import type { BillingCycle, SubscriptionPlan } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import { getSubscriptionAddOnPrice, type SubscriptionAddOnCode } from "@/lib/subscription/subscriptionPlanCatalog";

const ADD_ON_CODES: SubscriptionAddOnCode[] = [
  "ADDITIONAL_USER",
  "ADDITIONAL_BRANCH",
  "AUTOPILOT_LITE",
];

function calculatePeriodEnd(periodStart: Date, billingCycle: BillingCycle): Date {
  const periodEnd = new Date(periodStart);
  if (billingCycle === "MONTHLY") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }
  return periodEnd;
}

export interface CreateSubscriptionAddOnPurchaseInput {
  businessId: string;
  addOnCode: SubscriptionAddOnCode;
  quantity: number;
  billingCycle: BillingCycle;
  currency: string;
}

export async function createSubscriptionAddOnPurchaseInvoice(
  input: CreateSubscriptionAddOnPurchaseInput,
) {
  if (!input.businessId.trim()) throw new Error("Business context is required.");
  if (!ADD_ON_CODES.includes(input.addOnCode)) throw new Error("Unsupported subscription add-on.");
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error("Add-on quantity must be a positive whole number.");
  }
  if (input.addOnCode === "AUTOPILOT_LITE" && input.quantity !== 1) {
    throw new Error("AUTOPILOT_LITE can only be purchased as a single capability.");
  }
  if (input.quantity > 1000) throw new Error("Add-on quantity cannot exceed 1000 units per purchase.");
  if (input.currency.trim().toUpperCase() !== "KES") {
    throw new Error("Subscription add-on billing currently requires KES.");
  }

  const unitPrice = getSubscriptionAddOnPrice({
    addOnCode: input.addOnCode,
    billingCycle: input.billingCycle,
    currency: "KES",
  });
  const amount = unitPrice * input.quantity;

  return prisma.$transaction(async (tx) => {
    const subscription = await tx.businessSubscription.findUnique({
      where: { businessId: input.businessId },
      select: { id: true, businessId: true, plan: true, status: true },
    });

    if (!subscription) throw new Error("This business does not have a subscription.");
    if (subscription.plan !== "PROFESSIONAL") {
      throw new Error("Subscription add-ons are available on the Professional plan. Business does not require add-ons.");
    }
    if (subscription.status !== "ACTIVE") {
      throw new Error(`Capacity add-ons cannot be purchased while the subscription is ${subscription.status}.`);
    }

    const addOn = await tx.subscriptionAddOn.findFirst({
      where: { code: input.addOnCode, active: true },
      select: { code: true, billingType: true },
    });
    if (!addOn) throw new Error("The selected subscription add-on is not available.");

    const existingPending = await tx.billingInvoice.findFirst({
      where: {
        businessId: input.businessId,
        type: "SUBSCRIPTION_ADD_ON",
        addOnCode: input.addOnCode,
        status: { in: ["DRAFT", "OPEN", "PARTIALLY_PAID"] },
      },
      select: { id: true, invoiceNumber: true, status: true },
      orderBy: { createdAt: "desc" },
    });
    if (existingPending) {
      throw new Error("A payment for this add-on is already in progress.");
    }

    const periodStart = new Date();
    const periodEnd = calculatePeriodEnd(periodStart, input.billingCycle);
    const invoiceNumber = await generateBusinessReference({
      businessId: input.businessId,
      referenceType: "BILLING_INVOICE",
      prefix: "INV",
      client: tx,
    });

    return tx.billingInvoice.create({
      data: {
        businessId: subscription.businessId,
        subscriptionId: subscription.id,
        invoiceNumber,
        status: "DRAFT",
        type: "SUBSCRIPTION_ADD_ON",
        plan: subscription.plan as SubscriptionPlan,
        billingCycle: input.billingCycle,
        addOnCode: input.addOnCode,
        addOnQuantity: input.quantity,
        currency: "KES",
        subtotal: amount,
        taxAmount: 0,
        totalAmount: amount,
        amountPaid: 0,
        amountDue: amount,
        issuedAt: null,
        dueAt: null,
        paidAt: null,
        periodStart,
        periodEnd,
        notes:
          input.addOnCode === "AUTOPILOT_LITE"
            ? "AUTOPILOT_LITE subscription add-on purchase"
            : `${input.addOnCode} capacity add-on purchase`,
        items: {
          create: {
            description:
              input.addOnCode === "AUTOPILOT_LITE"
                ? "AUTOPILOT_LITE subscription add-on"
                : `${input.addOnCode} capacity add-on`,
            quantity: input.quantity,
            unitPrice,
            taxRate: 0,
            taxAmount: 0,
            totalAmount: amount,
          },
        },
      },
      include: { items: true },
    });
  }, { isolationLevel: "Serializable" });
}
