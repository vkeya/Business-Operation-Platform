import { accountRepository } from "@/lib/accounting/accountRepository";
import { journalService } from "@/lib/accounting/journalService";
import { prisma } from "@/lib/database/prisma";
import type { Prisma } from "@/generated/prisma/client";

type PrismaTransactionClient =
  Prisma.TransactionClient;

interface PostExpenseInput {
  businessId: string;
  expenseId: string;
  reference: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  createdBy: string;
}


export async function postExpenseToAccounting(
  input: PostExpenseInput,
  client: PrismaTransactionClient = prisma,
) {
  const expenseAccount =
    await accountRepository.findByCode(
  input.businessId,
  "5000",
  client,
);

  const payableAccount =
    await accountRepository.findByCode(
  input.businessId,
  "2000",
  client,
);


  if (!expenseAccount) {
    throw new Error(
      "Operating Expenses account not configured.",
    );
  }

  if (!payableAccount) {
    throw new Error(
      "Accounts Payable account not configured.",
    );
  }


  return journalService.create(
  {
    businessId:
      input.businessId,

    reference:
      `EXP-${input.reference}`,

    description:
      input.description,

    entryDate:
      new Date(),

    createdBy:
      input.createdBy,

    currency:
      input.currency,

    lines: [
      {
        accountId:
          expenseAccount.id,

        description:
          input.category ?? "Expense",

        debit:
          input.amount,

        credit:
          0,
      },

      {
        accountId:
          payableAccount.id,

        description:
          "Expense payable",

        debit:
          0,

        credit:
          input.amount,
      },
    ],
  },
  client,
);
}