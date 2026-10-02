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
  amountRatio?: number;
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

  const amountRatio =
    input.amountRatio ?? 1;

  if (
    !Number.isFinite(amountRatio) ||
    amountRatio <= 0 ||
    amountRatio > 1
  ) {
    throw new Error(
      "Reversal amount ratio must be greater than 0 and no greater than 1.",
    );
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

  const originalAmount = original.lines.reduce(
  (total, line) =>
    total +
    Math.max(
      Number(line.debit),
      Number(line.credit),
    ),
  0,
);

const existingReversals =
  await journalRepository.listByReferencePrefix(
    input.businessId,
    `${input.originalReference}-REVERSAL`,
    client,
  );

const alreadyReversedAmount =
  existingReversals.reduce(
    (total, reversal) => {
      const reversalAmount =
        reversal.lines.reduce(
          (lineTotal, line) =>
            lineTotal +
            Math.max(
              Number(line.debit),
              Number(line.credit),
            ),
          0,
        );

      return total + reversalAmount;
    },
    0,
  );

const requestedReversalAmount =
  originalAmount * amountRatio;

const remainingAmount =
  originalAmount - alreadyReversedAmount;

if (
  requestedReversalAmount >
  remainingAmount + 0.01
) {
  throw new Error(
    `Reversal exceeds the remaining reversible amount. Remaining amount: ${remainingAmount.toFixed(2)}.`,
  );
}

  if (original.lines.length < 2) {
    throw new Error(
      `Original accounting entry ${input.originalReference} is incomplete.`,
    );
  }

  const roundCurrency = (
    value: number,
  ) =>
    Math.round(
      (value + Number.EPSILON) * 100,
    ) / 100;

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
              roundCurrency(
                Number(line.credit) *
                  amountRatio,
              ),

            credit:
              roundCurrency(
                Number(line.debit) *
                  amountRatio,
              ),
          }),
        ),
    },
    client,
  );
}