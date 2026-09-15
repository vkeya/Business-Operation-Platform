import { journalRepository } from "@/lib/accounting/journalRepository";
import { journalService } from "@/lib/accounting/journalService";
import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export async function reverseJournalEntry(input: {
  businessId: string;
  originalReference: string;
  reversalReference: string;
  description: string;
  createdBy: string;
  currency: string;
  client?: PrismaTransactionClient;
}) {
  const client =
    input.client ?? prisma;

  const existingReversal =
    await journalRepository.findByReference(
      input.businessId,
      input.reversalReference,
      client,
    );

  if (existingReversal) {
    return existingReversal;
  }

  const original =
    await journalRepository.findByReference(
      input.businessId,
      input.originalReference,
      client,
    );

  if (!original) {
    throw new Error(
      `Original accounting entry ${input.originalReference} was not found.`,
    );
  }

  if (original.lines.length < 2) {
    throw new Error(
      `Original accounting entry ${input.originalReference} is incomplete.`,
    );
  }

  return journalService.create(
    {
      businessId:
        input.businessId,

      reference:
        input.reversalReference,

      description:
        input.description,

      entryDate:
        new Date(),

      createdBy:
        input.createdBy,

      currency:
        input.currency,

      lines:
        original.lines.map(
          (line) => ({
            accountId:
              line.accountId,

            description:
              `Reversal of ${line.description ?? "journal line"}`,

            debit:
              Number(line.credit),

            credit:
              Number(line.debit),
          }),
        ),
    },
    client,
  );
}