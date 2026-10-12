import { NextResponse } from "next/server";

import {
  failBillingPayment,
  succeedBillingPayment,
} from "@/lib/subscription/billingPaymentService";
import { verifyPaystackPayment } from "@/lib/subscription/providers/paystack/billingPaystackProvider";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: Request) {
  try {
    const context = await getCurrentBusinessContext();
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference")?.trim();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required." },
        { status: 400 },
      );
    }

    const payment = await prisma.billingPayment.findFirst({
      where: {
        businessId: context.business.id,
        provider: "PAYSTACK",
        providerReference: reference,
      },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        provider: true,
        providerReference: true,
        providerResponse: true,
        updatedAt: true,
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            type: true,
            plan: true,
            billingCycle: true,
            amountPaid: true,
            amountDue: true,
            subscriptionId: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Subscription payment not found." },
        { status: 404 },
      );
    }

    if (
      (payment.status === "PENDING" || payment.status === "PROCESSING") &&
      payment.providerReference
    ) {
      const storedResponse =
        payment.providerResponse &&
        typeof payment.providerResponse === "object" &&
        !Array.isArray(payment.providerResponse)
          ? payment.providerResponse as Record<string, unknown>
          : {};
      const paymentMethod =
        typeof storedResponse.paymentMethod === "string"
          ? storedResponse.paymentMethod.trim().toUpperCase()
          : "";
      const lastAttempt =
        typeof storedResponse.lastVerificationAttemptAt === "string"
          ? Date.parse(storedResponse.lastVerificationAttemptAt)
          : Number.NaN;
      const now = Date.now();

      if (
        (paymentMethod === "CARD" || paymentMethod === "MPESA") &&
        (!Number.isFinite(lastAttempt) || now - lastAttempt >= 15000)
      ) {
        const claimed = await prisma.billingPayment.updateMany({
          where: {
            id: payment.id,
            businessId: context.business.id,
            status: payment.status,
            updatedAt: payment.updatedAt,
          },
          data: {
            providerResponse: {
              ...storedResponse,
              lastVerificationAttemptAt: new Date(now).toISOString(),
            } as never,
          },
        });

        if (claimed.count === 1) {
          try {
            const verification = await verifyPaystackPayment(
              payment.providerReference,
              paymentMethod,
            );
            const expectedAmount = Math.round(payment.amount.toNumber() * 100);
            const referenceMatches = verification.reference === payment.providerReference;
            const amountMatches = verification.amount === expectedAmount;
            const currencyMatches =
              verification.currency === payment.currency.trim().toUpperCase();

            if (
              referenceMatches && amountMatches && currencyMatches &&
              verification.status === "success"
            ) {
              await succeedBillingPayment(context.business.id, payment.id);
            } else if (
              referenceMatches && amountMatches && currencyMatches &&
              verification.status === "failed"
            ) {
              await failBillingPayment(
                context.business.id,
                payment.id,
                verification.message || "Paystack confirmed that the payment failed.",
              );
            }
            // Inconclusive or mismatched verification never settles the payment.
          } catch (verificationError) {
            console.warn("Paystack payment reconciliation deferred:", verificationError);
          }
        }
      }
    }

    // Re-read after reconciliation: the original payment/invoice snapshot above
    // may now be stale if verification or a concurrent webhook settled it.
    const refreshedPayment = await prisma.billingPayment.findFirst({
      where: {
        id: payment.id,
        businessId: context.business.id,
        provider: "PAYSTACK",
      },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        provider: true,
        providerReference: true,
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            type: true,
            plan: true,
            billingCycle: true,
            amountPaid: true,
            amountDue: true,
            subscriptionId: true,
          },
        },
      },
    });

    if (!refreshedPayment) {
      return NextResponse.json(
        { error: "Subscription payment not found." },
        { status: 404 },
      );
    }

    const subscription = refreshedPayment.invoice.subscriptionId
      ? await prisma.businessSubscription.findFirst({
          where: {
            id: refreshedPayment.invoice.subscriptionId,
            businessId: context.business.id,
          },
          select: {
            id: true,
            plan: true,
            status: true,
            billingCycle: true,
            billingCurrency: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            nextBillingDate: true,
          },
        })
      : null;

    return NextResponse.json({
      success: true,
      payment: {
        id: refreshedPayment.id,
        status: refreshedPayment.status,
        amount: refreshedPayment.amount,
        currency: refreshedPayment.currency,
        provider: refreshedPayment.provider,
        providerReference: refreshedPayment.providerReference,
      },
      invoice: {
        id: refreshedPayment.invoice.id,
        invoiceNumber: refreshedPayment.invoice.invoiceNumber,
        status: refreshedPayment.invoice.status,
        type: refreshedPayment.invoice.type,
        plan: refreshedPayment.invoice.plan,
        billingCycle: refreshedPayment.invoice.billingCycle,
        amountPaid: refreshedPayment.invoice.amountPaid,
        amountDue: refreshedPayment.invoice.amountDue,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            billingCycle: subscription.billingCycle,
            billingCurrency: subscription.billingCurrency,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            nextBillingDate: subscription.nextBillingDate,
          }
        : null,
    });
  } catch (error) {
    console.error("Subscription payment status lookup failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Unable to retrieve subscription payment status.",
      },
      { status: 500 },
    );
  }
}
