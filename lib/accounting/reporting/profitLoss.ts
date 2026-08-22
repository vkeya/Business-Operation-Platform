import { prisma } from "@/lib/database/prisma";


export async function getProfitLoss(
  businessId: string,
) {
  const accounts =
    await prisma.account.findMany({
      where: {
        businessId,
        type: {
          in: [
            "REVENUE",
            "EXPENSE",
          ],
        },
        isActive: true,
      },

      include: {
        journalLines: {
          where: {
            journalEntry: {
              status: "POSTED",
            },
          },
        },
      },
    });


  const revenueAccounts =
    accounts.filter(
      (account) =>
        account.type === "REVENUE",
    );


  const expenseAccounts =
    accounts.filter(
      (account) =>
        account.type === "EXPENSE",
    );


  const revenue =
    revenueAccounts.reduce(
      (total, account) => {
        const balance =
          account.journalLines.reduce(
            (sum, line) =>
              sum +
              line.credit.toNumber() -
              line.debit.toNumber(),
            0,
          );

        return total + balance;
      },
      0,
    );


  const expenses =
    expenseAccounts.reduce(
      (total, account) => {
        const balance =
          account.journalLines.reduce(
            (sum, line) =>
              sum +
              line.debit.toNumber() -
              line.credit.toNumber(),
            0,
          );

        return total + balance;
      },
      0,
    );


  return {
    revenue,
    expenses,
    profit:
      revenue - expenses,

    revenueAccounts,
    expenseAccounts,
  };
}