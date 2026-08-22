import { prisma } from "@/lib/database/prisma";


export async function getAccountBalance(
  businessId: string,
  accountId: string,
) {
  const lines =
    await prisma.journalEntryLine.findMany({
      where: {
        accountId,
        journalEntry: {
          businessId,
          status: "POSTED",
        },
      },

      include: {
        journalEntry: true,
      },
    });


  const totalDebit =
    lines.reduce(
      (total, line) =>
        total + line.debit.toNumber(),
      0,
    );


  const totalCredit =
    lines.reduce(
      (total, line) =>
        total + line.credit.toNumber(),
      0,
    );


  return {
    accountId,

    totalDebit,

    totalCredit,

    balance:
      totalDebit - totalCredit,

    transactions:
      lines,
  };
}