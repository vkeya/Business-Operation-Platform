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
  client?: PrismaTransactionClient;
}) {
  return reverseJournalEntry({
    businessId:
      input.businessId,

    originalReference:
      `PAY-${input.paymentReference}`,

    reversalReference:
      `PAY-${input.paymentReference}-REVERSAL`,

    description:
      `Reversal of payment ${input.paymentReference}`,

    createdBy:
      input.createdBy,

    currency:
      input.currency,

    client:
      input.client,
  });
}