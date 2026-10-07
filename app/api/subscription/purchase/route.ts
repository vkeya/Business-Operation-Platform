import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import {
  createSubscriptionPurchaseInvoice,
} from "@/lib/subscription/subscriptionPurchaseService";
import {
  createBillingPayment,
  initiateBillingPayment,
} from "@/lib/subscription/billingPaymentService";
import {
  isSupportedBillingCurrency,
} from "@/lib/subscription/billingCurrency";
import type {
  BillingCycle,
  SubscriptionPlan,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";

const PURCHASE_PLANS: SubscriptionPlan[] = [
  "STARTER",
  "PROFESSIONAL",
  "BUSINESS",
];

const BILLING_CYCLES: BillingCycle[] = [
  "MONTHLY",
  "ANNUAL",
];

export async function POST(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid subscription purchase request." },
        { status: 400 },
      );
    }

    const plan =
      typeof body.plan === "string"
        ? body.plan.trim().toUpperCase()
        : "";

    const billingCycle =
      typeof body.billingCycle === "string"
        ? body.billingCycle.trim().toUpperCase()
        : "";

    const currency =
      typeof body.currency === "string"
        ? body.currency.trim().toUpperCase()
        : "";

    const provider =
      typeof body.provider === "string"
        ? body.provider.trim().toUpperCase()
        : "";

    const paymentMethod =
      typeof body.paymentMethod === "string"
      ? body.paymentMethod.trim().toUpperCase()
      : "";

    const customerEmail =
     typeof body.customerEmail === "string"
       ? body.customerEmail.trim()
       : "";

    const customerPhone =
      typeof body.customerPhone === "string"
        ? body.customerPhone.trim()
        : "";

    if (!PURCHASE_PLANS.includes(plan as SubscriptionPlan)) {
      return NextResponse.json(
        {
          error:
            "A paid subscription plan is required.",
        },
        { status: 400 },
      );
    }

    if (!BILLING_CYCLES.includes(billingCycle as BillingCycle)) {
      return NextResponse.json(
        {
          error:
            "A valid billing cycle is required.",
        },
        { status: 400 },
      );
    }

    if (!isSupportedBillingCurrency(currency)) {
      return NextResponse.json(
        {
          error:
            "A supported billing currency is required.",
        },
        { status: 400 },
      );
    }

    if (
  provider !== "MPESA" &&
  provider !== "PAYSTACK"
) {
  return NextResponse.json(
    {
      error:
        "The selected subscription payment provider is not supported.",
    },
    { status: 400 },
  );
}

if (currency !== "KES") {
  return NextResponse.json(
    {
      error:
        "Subscription payments currently require KES.",
    },
    { status: 400 },
  );
}

if (
  paymentMethod !== "MPESA" &&
  paymentMethod !== "CARD"
) {
  return NextResponse.json(
    {
      error:
        "A valid subscription payment method is required.",
    },
    { status: 400 },
  );
}

if (provider === "MPESA" && paymentMethod !== "MPESA") {
  return NextResponse.json(
    {
      error:
        "Direct M-Pesa billing only supports the M-Pesa payment method.",
    },
    { status: 400 },
  );
}

       if (
         provider === "PAYSTACK" &&
         paymentMethod === "MPESA" &&
         !customerPhone
       ) {
         return NextResponse.json(
           {
             error:
               "Customer M-Pesa phone number is required.",
           },
           { status: 400 },
         );
       }

       if (
         provider === "PAYSTACK" &&
         !customerEmail
       ) {
         return NextResponse.json(
           {
             error:
               "Customer email is required for Paystack subscription payments.",
           },
           { status: 400 },
         );
       }

       if (
         provider === "MPESA" &&
         !customerPhone
       ) {
         return NextResponse.json(
           {
             error:
               "Customer M-Pesa phone number is required.",
           },
           { status: 400 },
         );
       }

    const existingPurchase =
  await prisma.billingInvoice.findFirst({
    where: {
      businessId: context.business.id,
      type: "SUBSCRIPTION_PURCHASE",
      status: {
        in: [
          "DRAFT",
          "OPEN",
          "PARTIALLY_PAID",
        ],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

if (existingPurchase) {
  const latestPayment =
    existingPurchase.payments[0];

  if (
    latestPayment &&
    (latestPayment.status === "PENDING" ||
      latestPayment.status === "PROCESSING")
  ) {
    return NextResponse.json(
      {
        error:
          "This subscription payment is already being processed.",
        invoice: {
          id: existingPurchase.id,
          invoiceNumber:
            existingPurchase.invoiceNumber,
          status: existingPurchase.status,
        },
        payment: latestPayment,
      },
      { status: 409 },
    );
  }
}

    const invoice =
  existingPurchase &&
  (existingPurchase.payments.length === 0 ||
    existingPurchase.payments[0]?.status === "FAILED" ||
    existingPurchase.payments[0]?.status === "CANCELLED")
    ? existingPurchase
    : await createSubscriptionPurchaseInvoice({
        businessId: context.business.id,
        plan: plan as SubscriptionPlan,
        billingCycle: billingCycle as BillingCycle,
        currency,
      });

    await prisma.billingInvoice.update({
      where: {
        id: invoice.id,
        businessId: context.business.id,
      },
      data: {
        status: "OPEN",
        issuedAt: new Date(),
      },
    });

    const payment =
      await createBillingPayment({
        businessId: context.business.id,
        invoiceId: invoice.id,
        amount: Number(invoice.amountDue),
        currency: invoice.currency,
        provider,
      });

    const initiated =
  await initiateBillingPayment({
    businessId: context.business.id,
    paymentId: payment.id,
    customerPhone: customerPhone || undefined,
    customerEmail: customerEmail || undefined,
    paymentMethod,
  });

    return NextResponse.json(
      {
        success: true,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
          currency: invoice.currency,
          status: "OPEN",
        },
        payment: initiated,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Subscription purchase failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process subscription purchase.",
      },
      { status: 500 },
    );
  }
}