import {
  isSupportedBillingCurrency,
} from "@/lib/subscription/billingCurrency";
import { prisma } from "@/lib/database/prisma";
import type { BillingPaymentStatus } from "@/generated/prisma/client";
import { getSubscriptionPrice } from "@/lib/subscription/subscriptionPricingService";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import type { BillingCycle } from "@/generated/prisma/client";

export interface GenerateRenewalInvoiceInput {
  subscriptionId: string;
}

function calculateNextPeriodEnd(
  periodStart: Date,
  billingCycle: BillingCycle,
): Date {
  const periodEnd = new Date(periodStart);

  if (billingCycle === "MONTHLY") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    return periodEnd;
  }

  periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  return periodEnd;
}

export async function generateRenewalInvoice(
  input: GenerateRenewalInvoiceInput,
) {
  if (!input.subscriptionId.trim()) {
    throw new Error("Billing subscription is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const subscription =
        await tx.businessSubscription.findUnique({
          where: {
            id: input.subscriptionId,
          },
          select: {
            id: true,
            businessId: true,
            plan: true,
            status: true,
            billingCycle: true,
			billingCurrency: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        });

      if (!subscription) {
        throw new Error("Billing subscription not found.");
      }

      if (subscription.status !== "ACTIVE") {
        throw new Error(
          `Renewal invoice cannot be generated for a subscription in ${subscription.status} status.`,
        );
      }

      if (!subscription.billingCycle) {
  throw new Error(
    "Billing subscription does not have a billing cycle.",
  );
}

if (!subscription.billingCurrency) {
  throw new Error(
    "Billing subscription does not have a billing currency.",
  );
}

if (!isSupportedBillingCurrency(subscription.billingCurrency)) {
  throw new Error(
    `Unsupported billing currency: ${subscription.billingCurrency}.`,
  );
}

const renewalAmount = getSubscriptionPrice({
  plan: subscription.plan,
  currency: subscription.billingCurrency,
  billingCycle: subscription.billingCycle,
});

if (
  !subscription.currentPeriodStart ||
  !subscription.currentPeriodEnd
) {
  throw new Error(
    "Billing subscription does not have a current billing period.",
  );
}

      if (subscription.cancelAtPeriodEnd) {
        return null;
      }

      const periodStart = new Date(
        subscription.currentPeriodEnd,
      );

      const periodEnd = calculateNextPeriodEnd(
        periodStart,
        subscription.billingCycle,
      );

      const existingInvoice =
        await tx.billingInvoice.findFirst({
          where: {
            businessId: subscription.businessId,
            subscriptionId: subscription.id,
            periodStart,
            periodEnd,
          },
          include: {
            items: true,
          },
        });

      if (existingInvoice) {
        return existingInvoice;
      }

      const invoiceNumber =
        await generateBusinessReference({
          businessId: subscription.businessId,
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
		  type: "SUBSCRIPTION_RENEWAL",
          plan: subscription.plan,
          billingCycle: subscription.billingCycle,
          currency: subscription.billingCurrency,
          subtotal: renewalAmount,
          taxAmount: 0,
          totalAmount: renewalAmount,
          amountPaid: 0,
          amountDue: renewalAmount,
          issuedAt: null,
          dueAt: null,
          paidAt: null,
          periodStart,
          periodEnd,
          notes: "Subscription renewal invoice",
          items: {
            create: {
              description: `${subscription.plan} subscription renewal`,
              quantity: 1,
              unitPrice: renewalAmount,
              taxRate: 0,
              taxAmount: 0,
              totalAmount: renewalAmount,
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

export async function prepareRenewalPayment(input: {
  subscriptionId: string;
  provider: string;
}) {
  if (!input.subscriptionId.trim()) {
    throw new Error("Billing subscription is required.");
  }

  if (!input.provider.trim()) {
    throw new Error("Renewal payment provider is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const subscription =
        await tx.businessSubscription.findUnique({
          where: {
            id: input.subscriptionId,
          },
          select: {
            id: true,
            businessId: true,
            status: true,
            cancelAtPeriodEnd: true,
          },
        });

      if (!subscription) {
        throw new Error("Billing subscription not found.");
      }

      if (subscription.status !== "ACTIVE") {
        throw new Error(
          `Renewal payment cannot be prepared for a subscription in ${subscription.status} status.`,
        );
      }

      if (subscription.cancelAtPeriodEnd) {
        throw new Error(
          "Renewal payment cannot be prepared because the subscription is set to cancel at period end.",
        );
      }

      const invoice =
        await tx.billingInvoice.findFirst({
          where: {
            businessId: subscription.businessId,
            subscriptionId: subscription.id,
            status: {
              in: ["DRAFT", "OPEN"],
            },
            periodStart: {
              not: null,
            },
            periodEnd: {
              not: null,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (!invoice) {
        throw new Error(
          "No open renewal invoice was found for this subscription.",
        );
      }

      const amountDue = Number(invoice.amountDue);

      if (!Number.isFinite(amountDue) || amountDue <= 0) {
        throw new Error(
          "Renewal invoice does not have an amount due.",
        );
      }

      if (invoice.status === "DRAFT") {
        await tx.billingInvoice.update({
          where: {
            id: invoice.id,
          },
          data: {
            status: "OPEN",
            issuedAt: invoice.issuedAt ?? new Date(),
          },
        });
      }

      const existingPayment =
        await tx.billingPayment.findFirst({
          where: {
            businessId: subscription.businessId,
            invoiceId: invoice.id,
            status: {
              in: [
                "PENDING",
                "PROCESSING",
              ] satisfies BillingPaymentStatus[],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (existingPayment) {
        return {
          invoiceId: invoice.id,
          payment: existingPayment,
          created: false,
        };
      }

      const payment =
        await tx.billingPayment.create({
          data: {
            businessId: subscription.businessId,
            invoiceId: invoice.id,
            amount: amountDue,
            currency: invoice.currency,
            status: "PENDING",
            provider: input.provider.trim(),
          },
        });

      return {
        invoiceId: invoice.id,
        payment,
        created: true,
      };
    },
    {
      isolationLevel: "Serializable",
    },
  );
}

export async function initiateRenewalPayment(input: {
  subscriptionId: string;
  provider: string;
  customerPhone: string;
}) {
  if (!input.customerPhone.trim()) {
    throw new Error(
      "Customer M-Pesa phone number is required.",
    );
  }

  const prepared = await prepareRenewalPayment({
  subscriptionId: input.subscriptionId,
  provider: input.provider,
});

  const { initiateBillingPayment } = await import(
    "@/lib/subscription/billingPaymentService"
  );

  const initiated = await initiateBillingPayment({
    businessId: prepared.payment.businessId,
    paymentId: prepared.payment.id,
    customerPhone: input.customerPhone,
  });

  return {
    invoiceId: prepared.invoiceId,
    payment: initiated,
    created: prepared.created,
  };
}