
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import { postHospitalPaymentToAccounting } from "@/lib/hospital/hospitalAccountingService";
import type { BusinessType } from "@/types";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";

export class HospitalInvoicePaymentError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "HospitalInvoicePaymentError";
  }
}

export interface RecordHospitalInvoicePaymentInput {
  invoiceId: string;
  method: string;
  amount: number | string;
  notes?: string | null;
}

async function getHospitalContext() {
  const context = await getCurrentBusinessContext();
  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

function toPaymentAmount(value: number | string) {
  let amount: Prisma.Decimal;

  try {
    amount = new Prisma.Decimal(value);
  } catch {
    throw new HospitalInvoicePaymentError(
      "Payment amount must be a valid number.",
    );
  }

  if (!amount.isFinite() || amount.lte(0)) {
    throw new HospitalInvoicePaymentError(
      "Payment amount must be greater than zero.",
    );
  }

  if (amount.decimalPlaces() > 4) {
    throw new HospitalInvoicePaymentError(
      "Payment amount cannot have more than four decimal places.",
    );
  }

  return amount;
}

export async function recordHospitalInvoicePayment(
  input: RecordHospitalInvoicePaymentInput,
) {
  const { businessId, userId } = await getHospitalContext();

  const invoiceId = input.invoiceId?.trim();
  const method = input.method?.trim().toUpperCase();
  const amount = toPaymentAmount(input.amount);
  
  const allowedMethods = [
    "CASH",
    "MPESA",
    "CARD",
    "BANK",
  ] as const;
  
  if (
    !method ||
    !allowedMethods.includes(method as (typeof allowedMethods)[number])
  ) {
    throw new HospitalInvoicePaymentError(
      "Payment method must be CASH, MPESA, CARD, or BANK.",
    );
  }

  if (!invoiceId) {
    throw new HospitalInvoicePaymentError("An invoice is required.");
  }

  return prisma.$transaction(async (tx) => {
    // Lock the business-scoped invoice before reading its balance.
    const lockedRows = await tx.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "HospitalInvoice"
      WHERE "id" = ${invoiceId}
        AND "businessId" = ${businessId}
      FOR UPDATE
    `;
    
    if (lockedRows.length === 0) {
      throw new HospitalInvoicePaymentError(
        "Invoice not found in this business.",
        404,
      );
    }
    
    const lockedInvoice = await tx.hospitalInvoice.findFirst({
      where: { id: invoiceId, businessId },
    });
    
    if (!lockedInvoice) {
      throw new HospitalInvoicePaymentError(
        "Invoice not found in this business.",
        404,
      );
    }
    
    if (
      lockedInvoice.status !== "ISSUED" &&
      lockedInvoice.status !== "PARTIALLY_PAID"
    ) {
      throw new HospitalInvoicePaymentError(
        "Only issued or partially paid invoices can receive payments.",
      );
    }

    const outstanding = lockedInvoice.totalAmount.sub(
      lockedInvoice.amountPaid,
    );

    if (outstanding.lte(0)) {
      throw new HospitalInvoicePaymentError(
        "This invoice has no outstanding balance.",
      );
    }

    if (amount.gt(outstanding)) {
      throw new HospitalInvoicePaymentError(
        `Payment exceeds the outstanding balance of ${outstanding.toFixed(4)} ${lockedInvoice.currency}.`,
      );
    }

    const reference = await generateBusinessReference({
      businessId,
      referenceType: "HOSPITAL_INVOICE_PAYMENT",
      prefix: "HPMT",
      padLength: 6,
      client: tx,
    });

    const payment = await tx.hospitalInvoicePayment.create({
      data: {
        businessId,
        invoiceId: lockedInvoice.id,
        reference,
        method,
        amount,
        currency: lockedInvoice.currency,
        notes: input.notes?.trim() || null,
        createdBy: userId,
      },
    });

    const newAmountPaid = lockedInvoice.amountPaid.add(amount);
    const newStatus = newAmountPaid.gte(lockedInvoice.totalAmount)
      ? "PAID"
      : "PARTIALLY_PAID";

    const updatedInvoice = await tx.hospitalInvoice.update({
      where: { id: lockedInvoice.id },
      data: {
        amountPaid: newAmountPaid,
        status: newStatus,
      },
    });

    await postHospitalPaymentToAccounting({
      businessId,
      paymentId: payment.id,
      invoiceNumber: lockedInvoice.invoiceNumber,
      reference: payment.reference,
      method: method as (typeof allowedMethods)[number],
      amount: Number(amount.toString()),
      currency: lockedInvoice.currency,
      createdBy: userId,
      client: tx,
    });

    await recordAuditEvent(
      {
        businessId,
        actorId: userId,
        action: AUDIT_ACTIONS.HOSPITAL_INVOICE_PAYMENT_RECORDED,
        entityType: "HospitalInvoicePayment",
        entityId: payment.id,
        afterData: {
          invoiceId: lockedInvoice.id,
          invoiceNumber: lockedInvoice.invoiceNumber,
          reference: payment.reference,
          method: payment.method,
          amount: payment.amount.toString(),
          currency: payment.currency,
          previousAmountPaid: lockedInvoice.amountPaid.toString(),
          amountPaid: newAmountPaid.toString(),
          outstandingBalance: lockedInvoice.totalAmount
            .sub(newAmountPaid)
            .toString(),
          invoiceStatus: updatedInvoice.status,
        },
      },
      tx,
    );

    return { payment, invoice: updatedInvoice };
  }, {
    maxWait: 10_000,
    timeout: 15_000,
  });
}
