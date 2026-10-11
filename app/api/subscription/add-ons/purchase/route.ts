import { NextResponse } from "next/server";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import {
  createSubscriptionAddOnPurchaseInvoice,
} from "@/lib/subscription/subscriptionAddOnPurchaseService";
import {
  createBillingPayment,
  initiateBillingPayment,
} from "@/lib/subscription/billingPaymentService";
import type { BillingCycle } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";
import type { SubscriptionAddOnCode } from "@/lib/subscription/subscriptionPlanCatalog";

const ADD_ON_CODES: SubscriptionAddOnCode[] = [
  "ADDITIONAL_USER",
  "ADDITIONAL_BRANCH",
  "AUTOPILOT_LITE",
];
const BILLING_CYCLES: BillingCycle[] = ["MONTHLY", "ANNUAL"];

export async function POST(request: Request) {
  try {
    const context = await getCurrentBusinessContext();
    const body = await request.json();

    const addOnCode = typeof body?.addOnCode === "string"
      ? body.addOnCode.trim().toUpperCase() as SubscriptionAddOnCode
      : "" as SubscriptionAddOnCode;
    const billingCycle = typeof body?.billingCycle === "string"
      ? body.billingCycle.trim().toUpperCase() as BillingCycle
      : "" as BillingCycle;
    const quantity = Number(body?.quantity);
    const provider = typeof body?.provider === "string" ? body.provider.trim().toUpperCase() : "";
    const paymentMethod = typeof body?.paymentMethod === "string" ? body.paymentMethod.trim().toUpperCase() : "";
    const customerEmail = typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "";
    const customerPhone = typeof body?.customerPhone === "string" ? body.customerPhone.trim() : "";

    if (!ADD_ON_CODES.includes(addOnCode)) return NextResponse.json({ error: "A valid subscription add-on is required." }, { status: 400 });
    if (!BILLING_CYCLES.includes(billingCycle)) return NextResponse.json({ error: "A valid billing cycle is required." }, { status: 400 });
    if (!Number.isInteger(quantity) || quantity < 1) return NextResponse.json({ error: "Add-on quantity must be a positive whole number." }, { status: 400 });
    if (provider !== "PAYSTACK" && provider !== "MPESA") return NextResponse.json({ error: "The selected payment provider is not supported." }, { status: 400 });
    if (paymentMethod !== "CARD" && paymentMethod !== "MPESA") return NextResponse.json({ error: "A valid payment method is required." }, { status: 400 });
    if (provider === "MPESA" && paymentMethod !== "MPESA") return NextResponse.json({ error: "Direct M-Pesa billing only supports the M-Pesa payment method." }, { status: 400 });
    if (provider === "PAYSTACK" && !customerEmail) return NextResponse.json({ error: "Customer email is required for Paystack payments." }, { status: 400 });
    if (paymentMethod === "MPESA" && !customerPhone) return NextResponse.json({ error: "Customer M-Pesa phone number is required." }, { status: 400 });

    const existingInvoice = await prisma.billingInvoice.findFirst({
      where: {
        businessId: context.business.id,
        type: "SUBSCRIPTION_ADD_ON",
        status: { in: ["DRAFT", "OPEN", "PARTIALLY_PAID"] },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, invoiceNumber: true, status: true },
    });
    if (existingInvoice) return NextResponse.json({ error: "This business already has a subscription add-on awaiting payment.", invoice: existingInvoice }, { status: 409 });

    const invoice = await createSubscriptionAddOnPurchaseInvoice({
      businessId: context.business.id,
      addOnCode,
      quantity,
      billingCycle,
      currency: "KES",
    });

    await prisma.billingInvoice.update({
      where: { id: invoice.id, businessId: context.business.id },
      data: { status: "OPEN", issuedAt: new Date() },
    });

    const payment = await createBillingPayment({
      businessId: context.business.id,
      invoiceId: invoice.id,
      amount: Number(invoice.amountDue),
      currency: invoice.currency,
      provider,
    });

    const initiated = await initiateBillingPayment({
      businessId: context.business.id,
      paymentId: payment.id,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount,
        currency: invoice.currency,
        status: "OPEN",
      },
      payment: initiated,
    }, { status: 201 });
  } catch (error) {
    console.error("Subscription add-on purchase failed:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unable to process subscription add-on purchase.",
    }, { status: 500 });
  }
}
