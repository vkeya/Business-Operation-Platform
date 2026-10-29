import { accountRepository } from "@/lib/accounting/accountRepository";
import { journalService } from "@/lib/accounting/journalService";
import { reverseJournalEntry } from "@/lib/accounting/posting/journalReversal";
import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

type HospitalAccountingClient = PrismaTransactionClient;

interface PostHospitalInvoiceInput {
  businessId: string;
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  revenueAmount: number;
  taxAmount: number;
  currency: string;
  createdBy: string;
  client: HospitalAccountingClient;
}

interface PostHospitalPaymentInput {
  businessId: string;
  paymentId: string;
  invoiceNumber: string;
  reference: string;
  method: "CASH" | "MPESA" | "CARD" | "BANK";
  amount: number;
  currency: string;
  createdBy: string;
  client: HospitalAccountingClient;
}

interface ReverseHospitalInvoiceInput {
  businessId: string;
  invoiceNumber: string;
  currency: string;
  createdBy: string;
  client: HospitalAccountingClient;
}

function requirePositiveAmount(
  amount: number,
  field: string,
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${field} must be greater than zero.`);
  }
}

function requireBalancedAmounts(
  totalAmount: number,
  revenueAmount: number,
  taxAmount: number,
) {
  if (
    !Number.isFinite(totalAmount) ||
    !Number.isFinite(revenueAmount) ||
    !Number.isFinite(taxAmount) ||
    revenueAmount < 0 ||
    taxAmount < 0 ||
    Math.abs(totalAmount - revenueAmount - taxAmount) > 0.0001
  ) {
    throw new Error(
      "Hospital invoice accounting amounts do not balance.",
    );
  }
}

export async function postHospitalInvoiceToAccounting(
  input: PostHospitalInvoiceInput,
) {
  requirePositiveAmount(input.totalAmount, "Invoice total");

  requireBalancedAmounts(
    input.totalAmount,
    input.revenueAmount,
    input.taxAmount,
  );

  const receivableAccount = await accountRepository.findByCode(
    input.businessId,
    "1200",
    input.client,
  );

  const revenueAccount = await accountRepository.findByCode(
    input.businessId,
    "4000",
    input.client,
  );

  const taxPayableAccount = input.taxAmount > 0
    ? await accountRepository.findByCode(
        input.businessId,
        "2100",
        input.client,
      )
    : null;

  if (!receivableAccount) {
    throw new Error("Accounts Receivable account not configured.");
  }

  if (!revenueAccount) {
    throw new Error("Sales Revenue account not configured.");
  }

  if (input.taxAmount > 0 && !taxPayableAccount) {
    throw new Error("Tax Payable account not configured.");
  }

  return journalService.create(
    {
      businessId: input.businessId,
      reference: `HOSPITAL-INVOICE-${input.invoiceNumber}`,
      description: `Hospital invoice ${input.invoiceNumber}`,
      entryDate: new Date(),
      createdBy: input.createdBy,
      currency: input.currency,
      lines: [
        {
          accountId: receivableAccount.id,
          description: `Patient receivable for ${input.invoiceNumber}`,
          debit: input.totalAmount,
          credit: 0,
        },
        ...(input.revenueAmount > 0
          ? [
              {
                accountId: revenueAccount.id,
                description: `Hospital revenue for ${input.invoiceNumber}`,
                debit: 0,
                credit: input.revenueAmount,
              },
            ]
          : []),
        ...(input.taxAmount > 0 && taxPayableAccount
          ? [
              {
                accountId: taxPayableAccount.id,
                description: `Tax payable for ${input.invoiceNumber}`,
                debit: 0,
                credit: input.taxAmount,
              },
            ]
          : []),
      ],
    },
    input.client,
  );
}

export async function postHospitalPaymentToAccounting(
  input: PostHospitalPaymentInput,
) {
  requirePositiveAmount(input.amount, "Payment amount");

  const paymentAccountCode = {
    CASH: "1000",
    MPESA: "1010",
    CARD: "1020",
    BANK: "1030",
  }[input.method];

  const paymentAccount = await accountRepository.findByCode(
    input.businessId,
    paymentAccountCode,
    input.client,
  );

  const receivableAccount = await accountRepository.findByCode(
    input.businessId,
    "1200",
    input.client,
  );

  if (!paymentAccount) {
    throw new Error(
      `Payment account ${paymentAccountCode} is not configured.`,
    );
  }

  if (!receivableAccount) {
    throw new Error("Accounts Receivable account not configured.");
  }

  return journalService.create(
    {
      businessId: input.businessId,
      reference: `HOSPITAL-PAYMENT-${input.paymentId}`,
      description:
        `Hospital payment ${input.reference} for invoice ${input.invoiceNumber}`,
      entryDate: new Date(),
      createdBy: input.createdBy,
      currency: input.currency,
      lines: [
        {
          accountId: paymentAccount.id,
          description: `Hospital payment received: ${input.method}`,
          debit: input.amount,
          credit: 0,
        },
        {
          accountId: receivableAccount.id,
          description: `Patient receivable cleared for ${input.invoiceNumber}`,
          debit: 0,
          credit: input.amount,
        },
      ],
    },
    input.client,
  );
}

export async function reverseHospitalInvoiceAccounting(
  input: ReverseHospitalInvoiceInput,
) {
  return reverseJournalEntry({
    businessId: input.businessId,
    originalReference: `HOSPITAL-INVOICE-${input.invoiceNumber}`,
    reversalReference:
      `HOSPITAL-INVOICE-${input.invoiceNumber}-REVERSAL`,
    description:
      `Reversal of hospital invoice ${input.invoiceNumber}`,
    createdBy: input.createdBy,
    currency: input.currency,
    client: input.client,
  });
}