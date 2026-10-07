import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    const url = new URL(request.url);
    const reference = url.searchParams.get("reference")?.trim();

    if (!reference) {
      return NextResponse.json(
        {
          error: "Payment reference is required.",
        },
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
        {
          error: "Subscription payment not found.",
        },
        { status: 404 },
      );
    }

    const subscription = await prisma.businessSubscription.findFirst({
      where: {
        id: payment.invoice.subscriptionId,
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
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        providerReference: payment.providerReference,
      },
      invoice: {
        id: payment.invoice.id,
        invoiceNumber: payment.invoice.invoiceNumber,
        status: payment.invoice.status,
        type: payment.invoice.type,
        plan: payment.invoice.plan,
        billingCycle: payment.invoice.billingCycle,
        amountPaid: payment.invoice.amountPaid,
        amountDue: payment.invoice.amountDue,
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
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve subscription payment status.",
      },
      { status: 500 },
    );
  }
}