import { reverseJournalEntry } from "@/lib/accounting/posting/journalReversal";
import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export async function reversePaymentAccounting(input: {
  businessId: string;
  paymentReference: string;
  currency: string;
  createdBy: string;
  amountRatio?: number;
  reversalSuffix?: string;
  client?: PrismaTransactionClient;
}) {
  const suffix =
    input.reversalSuffix?.trim() ||
    (input.amountRatio !== undefined &&
    input.amountRatio < 1
      ? `-${Math.round(input.amountRatio * 10000)}`
      : "");

  return reverseJournalEntry({
    businessId:
      input.businessId,

    originalReference:
      `PAY-${input.paymentReference}`,

    reversalReference:
      `PAY-${input.paymentReference}-REVERSAL${suffix}`,

    description:
      `Reversal of payment ${input.paymentReference}`,

    createdBy:
      input.createdBy,

    currency:
      input.currency,

    amountRatio:
      input.amountRatio,

    client:
      input.client,
  });
}