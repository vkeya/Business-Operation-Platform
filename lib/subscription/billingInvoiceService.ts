import { prisma } from "@/lib/database/prisma";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import type {
  BillingCycle,
  BillingInvoiceType,
  SubscriptionPlan,
} from "@/generated/prisma/client";
type BillingInvoiceStatus =
  | "DRAFT"
  | "OPEN"
  | "PAID"
  | "PARTIALLY_PAID"
  | "VOID"
  | "UNCOLLECTIBLE";

const ALLOWED_BILLING_INVOICE_TRANSITIONS: Record<
  BillingInvoiceStatus,
  BillingInvoiceStatus[]
> = {
  DRAFT: ["OPEN"],
  OPEN: ["PARTIALLY_PAID", "PAID", "VOID", "UNCOLLECTIBLE"],
  PARTIALLY_PAID: ["PAID"],
  PAID: [],
  VOID: [],
  UNCOLLECTIBLE: [],
};

function assertBillingInvoiceTransition(
  currentStatus: BillingInvoiceStatus,
  nextStatus: BillingInvoiceStatus,
): void {
  if (
    !ALLOWED_BILLING_INVOICE_TRANSITIONS[currentStatus].includes(
      nextStatus,
    )
  ) {
    throw new Error(
      `Invalid billing invoice status transition: ${currentStatus} → ${nextStatus}.`,
    );
  }
}

export interface BillingInvoiceLineInput {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface CreateDraftBillingInvoiceInput {
  businessId: string;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  type: BillingInvoiceType;
  currency: string;
  lines: BillingInvoiceLineInput[];
  periodStart?: Date;
  periodEnd?: Date;
  dueAt?: Date;
  notes?: string;
}

export async function openBillingInvoice(
  businessId: string,
  invoiceId: string,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  if (!invoiceId) {
    throw new Error("Billing invoice is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const invoice =
        await tx.billingInvoice.findFirst({
          where: {
            id: invoiceId,
            businessId,
          },
          select: {
            id: true,
            businessId: true,
            status: true,
            issuedAt: true,
          },
        });

      if (!invoice) {
        throw new Error("Billing invoice not found.");
      }

      assertBillingInvoiceTransition(
        invoice.status,
        "OPEN",
      );

      return tx.billingInvoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          status: "OPEN",
          issuedAt: invoice.issuedAt ?? new Date(),
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

export async function voidBillingInvoice(
  businessId: string,
  invoiceId: string,
) {
  return transitionBillingInvoiceStatus(
    businessId,
    invoiceId,
    "VOID",
  );
}

export async function markBillingInvoiceUncollectible(
  businessId: string,
  invoiceId: string,
) {
  return transitionBillingInvoiceStatus(
    businessId,
    invoiceId,
    "UNCOLLECTIBLE",
  );
}

async function transitionBillingInvoiceStatus(
  businessId: string,
  invoiceId: string,
  nextStatus: BillingInvoiceStatus,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  if (!invoiceId) {
    throw new Error("Billing invoice is required.");
  }

  return prisma.$transaction(
    async (tx) => {
      const invoice =
        await tx.billingInvoice.findFirst({
          where: {
            id: invoiceId,
            businessId,
          },
          select: {
            id: true,
            status: true,
          },
        });

      if (!invoice) {
        throw new Error("Billing invoice not found.");
      }

      assertBillingInvoiceTransition(
        invoice.status,
        nextStatus,
      );

      return tx.billingInvoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          status: nextStatus,
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

function assertPositiveFiniteNumber(
  value: number,
  fieldName: string,
): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${fieldName} must be greater than zero.`);
  }
}

function assertNonNegativeFiniteNumber(
  value: number,
  fieldName: string,
): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${fieldName} must be zero or greater.`);
  }
}

export async function createDraftBillingInvoice(
  input: CreateDraftBillingInvoiceInput,
) {
  if (!input.businessId) {
    throw new Error("Business context is required.");
  }

  if (!input.currency.trim()) {
    throw new Error("Invoice currency is required.");
  }

  if (!input.lines.length) {
    throw new Error("At least one invoice line is required.");
  }

  for (const line of input.lines) {
    if (!line.description.trim()) {
      throw new Error("Invoice line description is required.");
    }

    assertPositiveFiniteNumber(line.quantity, "Invoice line quantity");
    assertNonNegativeFiniteNumber(line.unitPrice, "Invoice line unit price");

    if (line.taxRate !== undefined) {
      assertNonNegativeFiniteNumber(line.taxRate, "Invoice line tax rate");
    }
  }

  return prisma.$transaction(
    async (tx) => {
      const subscription =
        await tx.businessSubscription.findUnique({
          where: {
            businessId: input.businessId,
          },
          select: {
            id: true,
            plan: true,
            status: true,
          },
        });

      if (!subscription) {
        throw new Error(
          "This business does not have a subscription.",
        );
      }

      const referenceNumber =
        await generateBusinessReference({
          businessId: input.businessId,
          referenceType: "BILLING_INVOICE",
          prefix: "INV",
          client: tx,
        });

      const calculatedLines = input.lines.map((line) => {
        const lineSubtotal =
          line.quantity * line.unitPrice;

        const taxRate = line.taxRate ?? 0;

        const taxAmount =
          lineSubtotal * (taxRate / 100);

        const totalAmount =
          lineSubtotal + taxAmount;

        return {
          description: line.description.trim(),
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate,
          taxAmount,
          totalAmount,
        };
      });

      const subtotal = calculatedLines.reduce(
        (sum, line) => sum + line.quantity * line.unitPrice,
        0,
      );

      const taxAmount = calculatedLines.reduce(
        (sum, line) => sum + line.taxAmount,
        0,
      );

      const totalAmount = calculatedLines.reduce(
        (sum, line) => sum + line.totalAmount,
        0,
      );

      return tx.billingInvoice.create({
        data: {
          businessId: input.businessId,
          subscriptionId: subscription.id,
          invoiceNumber: referenceNumber,
          status: "DRAFT",
          plan: input.plan,
          billingCycle: input.billingCycle,
		  type: input.type,
          currency: input.currency.trim(),
          subtotal,
          taxAmount,
          totalAmount,
          amountPaid: 0,
          amountDue: totalAmount,
          issuedAt: null,
          dueAt: input.dueAt ?? null,
          paidAt: null,
          periodStart: input.periodStart ?? null,
          periodEnd: input.periodEnd ?? null,
          notes: input.notes?.trim() || null,
          items: {
            create: calculatedLines,
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

export async function getBillingInvoice(
  businessId: string,
  invoiceId: string,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  if (!invoiceId) {
    throw new Error("Billing invoice is required.");
  }

  const invoice = await prisma.billingInvoice.findFirst({
    where: {
      id: invoiceId,
      businessId,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
      subscription: true,
    },
  });

  if (!invoice) {
    throw new Error("Billing invoice not found.");
  }

  return invoice;
}

export async function listBillingInvoices(
  businessId: string,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  return prisma.billingInvoice.findMany({
    where: {
      businessId,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}