import type {
  BillingCycle,
  BillingInvoiceType,
  SubscriptionPlan,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import {
  isSupportedBillingCurrency,
  type BillingCurrency,
} from "@/lib/subscription/billingCurrency";
import { getSubscriptionPrice } from "@/lib/subscription/subscriptionPricingService";

export interface CreateSubscriptionPurchaseInput {
  businessId: string;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  currency: string;
}

function calculatePeriodEnd(
  periodStart: Date,
  billingCycle: BillingCycle,
): Date {
  const periodEnd = new Date(periodStart);

  if (billingCycle === "MONTHLY") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  return periodEnd;
}

export async function createSubscriptionPurchaseInvoice(
  input: CreateSubscriptionPurchaseInput,
) {
  if (!input.businessId.trim()) {
    throw new Error("Business context is required.");
  }

  if (!input.currency.trim()) {
    throw new Error("Subscription billing currency is required.");
  }

  const normalizedCurrency =
    input.currency.trim().toUpperCase();

  if (!isSupportedBillingCurrency(normalizedCurrency)) {
    throw new Error(
      `Unsupported subscription billing currency: ${normalizedCurrency}.`,
    );
  }

  const currency =
    normalizedCurrency as BillingCurrency;

  const amount = getSubscriptionPrice({
    plan: input.plan,
    currency,
    billingCycle: input.billingCycle,
  });

  return prisma.$transaction(
    async (tx) => {
      const subscription =
        await tx.businessSubscription.findUnique({
          where: {
            businessId: input.businessId,
          },
          select: {
            id: true,
            businessId: true,
            status: true,
          },
        });

      if (!subscription) {
        throw new Error(
          "This business does not have a subscription.",
        );
      }

      const periodStart = new Date();
      const periodEnd = calculatePeriodEnd(
        periodStart,
        input.billingCycle,
      );

      const invoiceNumber =
        await generateBusinessReference({
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
          type: "SUBSCRIPTION_PURCHASE" satisfies BillingInvoiceType,
          plan: input.plan,
          billingCycle: input.billingCycle,
          currency,
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
          notes: "Subscription purchase invoice",
          items: {
            create: {
              description: `${input.plan} subscription purchase`,
              quantity: 1,
              unitPrice: amount,
              taxRate: 0,
              taxAmount: 0,
              totalAmount: amount,
            },
          },
        },
        include: {
          items: true,
        },
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );
}