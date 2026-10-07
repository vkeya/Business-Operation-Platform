import { prisma } from "@/lib/database/prisma";
import {
  createBillingPaymentProviderService,
} from "@/lib/subscription/billingPaymentProviderService";

import {
  getBillingPaymentProvider,
} from "@/lib/subscription/billingPaymentProviderResolver";

import type { BillingPaymentStatus } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

type BillingPaymentLifecycleStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

const ALLOWED_BILLING_PAYMENT_TRANSITIONS: Record<
  BillingPaymentLifecycleStatus,
  BillingPaymentLifecycleStatus[]
> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SUCCEEDED", "FAILED", "CANCELLED"],
  SUCCEEDED: ["REFUNDED"],
  FAILED: [],
  CANCELLED: [],
  REFUNDED: [],
};

  export async function initiateBillingPayment(
  input: {
    businessId: string;
    paymentId: string;
    customerPhone?: string;
	customerEmail?: string;
    paymentMethod?: string;
  },
) {
  if (!input.businessId.trim()) {
    throw new Error("Business context is required.");
  }

  if (!input.paymentId.trim()) {
    throw new Error("Billing payment is required.");
  }

  const payment =
    await prisma.billingPayment.findFirst({
      where: {
        id: input.paymentId,
        businessId: input.businessId,
      },
      include: {
        invoice: true,
      },
    });

  if (!payment) {
    throw new Error("Billing payment not found.");
  }

  const provider =
  payment.provider.trim().toUpperCase();

const paymentMethod =
  input.paymentMethod?.trim().toUpperCase();

if (
  provider === "MPESA" &&
  !input.customerPhone?.trim()
) {
  throw new Error(
    "Customer M-Pesa phone number is required.",
  );
}

if (
  provider === "PAYSTACK" &&
  paymentMethod !== "MPESA" &&
  paymentMethod !== "CARD"
) {
  throw new Error(
    "Paystack payment method must be MPESA or CARD.",
  );
}

if (
  provider === "PAYSTACK" &&
  !input.customerEmail?.trim()
) {
  throw new Error(
    "Customer email is required for Paystack subscription payments.",
  );
}

if (
  provider === "PAYSTACK" &&
  paymentMethod === "MPESA" &&
  !input.customerPhone?.trim()
) {
  throw new Error(
    "Customer M-Pesa phone number is required for Paystack M-Pesa payments.",
  );
}

  if (payment.status !== "PENDING") {
    throw new Error(
      `Billing payment cannot be initiated from status ${payment.status}.`,
    );
  }

  const processingPayment =
  await prisma.billingPayment.updateMany({
    where: {
      id: payment.id,
      businessId: input.businessId,
      status: "PENDING",
    },
    data: {
      status: "PROCESSING",
    },
  });

if (processingPayment.count === 0) {
  throw new Error(
    "Billing payment could not be moved to processing because its status changed.",
  );
}

  let result;

try {
  const billingPaymentProvider =
    createBillingPaymentProviderService(
      getBillingPaymentProvider(payment.provider),
    );

  result = await billingPaymentProvider.initiate({
    businessId: input.businessId,
    invoiceId: payment.invoiceId,
    paymentId: payment.id,
    amount: payment.amount.toNumber(),
    currency: payment.currency,
    reference: payment.invoice.invoiceNumber,
    description:
      `SmatPic subscription ${payment.invoice.invoiceNumber}`,
    metadata: {
      ...(input.customerPhone?.trim()
        ? {
            customerPhone: input.customerPhone.trim(),
          }
        : {}),
      ...(input.customerEmail?.trim()
        ? {
            customerEmail: input.customerEmail.trim(),
          }
        : {}),
      ...(paymentMethod
        ? {
            paymentMethod,
          }
        : {}),
    },
  });
} catch (error) {
  await failBillingPayment(
    input.businessId,
    payment.id,
    error instanceof Error
      ? error.message
      : "Billing payment provider initiation failed.",
  );

  throw error;
}



  return prisma.$transaction(
    async (tx) => {
      const updated =
        await tx.billingPayment.updateMany({
          where: {
            id: payment.id,
            businessId: input.businessId,
            status: "PROCESSING",
          },
          data: {

            providerReference:
              result.providerReference,

			providerResponse:
              result.providerResponse as Prisma.InputJsonValue,
          },
        });

      if (updated.count === 0) {
        throw new Error(
          "Billing payment could not be updated because its status changed.",
        );
      }

      return {
        paymentId: payment.id,
        status: result.status,
        providerReference:
          result.providerReference,
        message: result.message,
      };
    },
  );
}

function assertBillingPaymentTransition(
  currentStatus: BillingPaymentLifecycleStatus,
  nextStatus: BillingPaymentLifecycleStatus,
): void {
  if (
    !ALLOWED_BILLING_PAYMENT_TRANSITIONS[
      currentStatus
    ].includes(nextStatus)
  ) {
    throw new Error(
      `Invalid billing payment status transition: ${currentStatus} → ${nextStatus}.`,
    );
  }
}

export interface CreateBillingPaymentInput {
  businessId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  provider: string;
  providerReference?: string;
}

function assertPositiveFiniteNumber(
  value: number,
  fieldName: string,
): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${fieldName} must be greater than zero.`);
  }
}

export async function createBillingPayment(
  input: CreateBillingPaymentInput,
) {
  if (!input.businessId) {
    throw new Error("Business context is required.");
  }

  if (!input.invoiceId) {
    throw new Error("Billing invoice is required.");
  }

  assertPositiveFiniteNumber(
    input.amount,
    "Billing payment amount",
  );

  if (!input.currency.trim()) {
    throw new Error("Billing payment currency is required.");
  }

  if (!input.provider.trim()) {
    throw new Error("Billing payment provider is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const invoice =
        await tx.billingInvoice.findFirst({
          where: {
            id: input.invoiceId,
            businessId: input.businessId,
          },
          select: {
            id: true,
            businessId: true,
            status: true,
            currency: true,
            amountDue: true,
          },
        });

      if (!invoice) {
        throw new Error("Billing invoice not found.");
      }

      if (
        invoice.status !== "OPEN" &&
        invoice.status !== "PARTIALLY_PAID"
      ) {
        throw new Error(
          `Billing invoice cannot accept payment while in ${invoice.status} status.`,
        );
      }

      if (
        invoice.currency.trim().toUpperCase() !==
        input.currency.trim().toUpperCase()
      ) {
        throw new Error(
          "Billing payment currency must match the invoice currency.",
        );
      }

      const amountDue = Number(invoice.amountDue);

      if (!Number.isFinite(amountDue) || amountDue <= 0) {
        throw new Error(
          "Billing invoice does not have an amount due.",
        );
      }

      if (input.amount > amountDue) {
        throw new Error(
          "Billing payment amount cannot exceed the invoice amount due.",
        );
      }

      return tx.billingPayment.create({
        data: {
          businessId: input.businessId,
          invoiceId: invoice.id,
          amount: input.amount,
          currency: input.currency.trim(),
          status: "PENDING" satisfies BillingPaymentStatus,
          provider: input.provider.trim(),
          providerReference:
            input.providerReference?.trim() || null,
        },
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );
}

export async function processBillingPayment(
  businessId: string,
  paymentId: string,
) {
  return transitionBillingPaymentStatus(
    businessId,
    paymentId,
    "PROCESSING",
  );
}

export async function failBillingPayment(
  businessId: string,
  paymentId: string,
  failureReason?: string,
) {
  return transitionBillingPaymentStatus(
    businessId,
    paymentId,
    "FAILED",
    failureReason,
  );
}

export async function cancelBillingPayment(
  businessId: string,
  paymentId: string,
) {
  return transitionBillingPaymentStatus(
    businessId,
    paymentId,
    "CANCELLED",
  );
}

async function transitionBillingPaymentStatus(
  businessId: string,
  paymentId: string,
  nextStatus: BillingPaymentLifecycleStatus,
  failureReason?: string,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  if (!paymentId) {
    throw new Error("Billing payment is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const payment =
        await tx.billingPayment.findFirst({
          where: {
            id: paymentId,
            businessId,
          },
          select: {
            id: true,
            status: true,
          },
        });

      if (!payment) {
        throw new Error("Billing payment not found.");
      }

      assertBillingPaymentTransition(
        payment.status,
        nextStatus,
      );

      return tx.billingPayment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: nextStatus,
          failureReason:
            nextStatus === "FAILED"
              ? failureReason?.trim() || null
              : undefined,
          processedAt:
            nextStatus === "SUCCEEDED"
              ? new Date()
              : undefined,
          failedAt:
            nextStatus === "FAILED"
              ? new Date()
              : undefined,
          cancelledAt:
            nextStatus === "CANCELLED"
              ? new Date()
              : undefined,
        },
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );
}

export async function succeedBillingPayment(
  businessId: string,
  paymentId: string,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  if (!paymentId) {
    throw new Error("Billing payment is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const payment =
        await tx.billingPayment.findFirst({
          where: {
            id: paymentId,
            businessId,
          },
          select: {
            id: true,
            invoiceId: true,
            amount: true,
            status: true,
          },
        });

      if (!payment) {
        throw new Error("Billing payment not found.");
      }

      /*
       * Idempotency:
       * If the payment has already succeeded, return the
       * current payment/invoice state without applying it again.
       */
      if (payment.status === "SUCCEEDED") {
  const existingPayment = await tx.billingPayment.findUnique({
    where: {
      id: payment.id,
    },
  });

  const existingInvoice = await tx.billingInvoice.findUnique({
    where: {
      id: payment.invoiceId,
    },
    include: {
      items: true,
    },
  });

  if (!existingPayment || !existingInvoice) {
    throw new Error(
      "Billing payment or invoice could not be loaded for idempotent reconciliation.",
    );
  }

  return {
    payment: existingPayment,
    invoice: existingInvoice,
  };
}

      if (payment.status !== "PROCESSING") {
        throw new Error(
          `Billing payment cannot be completed while in ${payment.status} status.`,
        );
      }

      const invoice =
        await tx.billingInvoice.findFirst({
          where: {
            id: payment.invoiceId,
            businessId,
          },
          select: {
            id: true,
            status: true,
            totalAmount: true,
            amountPaid: true,
            amountDue: true,
			type: true,
			plan: true,
            billingCycle: true,
            periodStart: true,
            periodEnd: true,
            subscriptionId: true,
          },
        });

      if (!invoice) {
        throw new Error("Billing invoice not found.");
      }

      if (
        invoice.status !== "OPEN" &&
        invoice.status !== "PARTIALLY_PAID"
      ) {
        throw new Error(
          `Billing invoice cannot be reconciled while in ${invoice.status} status.`,
        );
      }

      const currentAmountPaid = Number(
        invoice.amountPaid,
      );

      const currentAmountDue = Number(
        invoice.amountDue,
      );

      const paymentAmount = Number(
        payment.amount,
      );

      if (
        !Number.isFinite(currentAmountPaid) ||
        currentAmountPaid < 0
      ) {
        throw new Error(
          "Billing invoice has an invalid amount paid.",
        );
      }

      if (
        !Number.isFinite(currentAmountDue) ||
        currentAmountDue < 0
      ) {
        throw new Error(
          "Billing invoice has an invalid amount due.",
        );
      }

      if (
        !Number.isFinite(paymentAmount) ||
        paymentAmount <= 0
      ) {
        throw new Error(
          "Billing payment has an invalid amount.",
        );
      }

      if (paymentAmount > currentAmountDue) {
        throw new Error(
          "Billing payment amount exceeds the invoice amount due.",
        );
      }

      const newAmountPaid =
        currentAmountPaid + paymentAmount;

      const totalAmount = Number(
        invoice.totalAmount,
      );

      const newAmountDue =
        Math.max(totalAmount - newAmountPaid, 0);

      const newInvoiceStatus =
        newAmountDue === 0
          ? "PAID"
          : "PARTIALLY_PAID";

	  if (
  newInvoiceStatus === "PAID" &&
  (!invoice.periodStart || !invoice.periodEnd)
) {
  throw new Error(
    "Paid billing invoice must have a billing period.",
  );
}

      const now = new Date();

      const updatedPayment =
        await tx.billingPayment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "SUCCEEDED",
            processedAt: now,
          },
        });

      const updatedInvoice =
        await tx.billingInvoice.update({
          where: {
            id: invoice.id,
          },
          data: {
            amountPaid: newAmountPaid,
            amountDue: newAmountDue,
            status: newInvoiceStatus,
            paidAt:
              newInvoiceStatus === "PAID"
                ? now
                : null,
          },
          include: {
            items: true,
          },
        });

		let updatedSubscription = null;

if (newInvoiceStatus === "PAID") {
  const subscription =
    await tx.businessSubscription.findFirst({
      where: {
        id: invoice.subscriptionId,
        businessId,
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
      },
    });

  if (!subscription) {
    throw new Error(
      "Billing subscription not found.",
    );
  }

  if (invoice.type === "SUBSCRIPTION_RENEWAL") {
    if (subscription.status !== "ACTIVE") {
      throw new Error(
        `Subscription renewal cannot be applied to a ${subscription.status} subscription.`,
      );
    }

    if (
      subscription.currentPeriodEnd &&
      invoice.periodStart &&
      invoice.periodStart < subscription.currentPeriodEnd
    ) {
      throw new Error(
        "Paid billing invoice period overlaps the current subscription period.",
      );
    }
  } else if (invoice.type === "SUBSCRIPTION_PURCHASE") {
    if (
      subscription.status !== "TRIALING" &&
      subscription.status !== "ACTIVE" &&
      subscription.status !== "EXPIRED" &&
      subscription.status !== "CANCELLED"
    ) {
      throw new Error(
        `Subscription purchase cannot be applied to a ${subscription.status} subscription.`,
      );
    }
  } else {
    throw new Error(
      `Unsupported billing invoice type: ${invoice.type}.`,
    );
  }

  updatedSubscription =
    await tx.businessSubscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        plan: invoice.plan,
        status: "ACTIVE",
        startedAt:
          subscription.startedAt ?? now,
        endedAt: null,
        billingCycle: invoice.billingCycle,
        currentPeriodStart: invoice.periodStart,
        currentPeriodEnd: invoice.periodEnd,
        nextBillingDate: invoice.periodEnd,
      },
    });
}

      return {
        payment: updatedPayment,
        invoice: updatedInvoice,
		subscription: updatedSubscription,
      };
    },
    {
      isolationLevel: "Serializable",
    },
  );
}