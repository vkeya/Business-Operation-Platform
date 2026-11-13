import { prisma } from "@/lib/database/prisma";
import type { ResolvedReportPeriod } from "@/lib/reports/period/reportPeriodTypes";

interface ProfitLossAccountBalance {
  id: string;
  code: string;
  name: string;
  balance: number;
}

interface CurrencyProfitLoss {
  currency: string;
  revenue: number;
  expenses: number;
  revenueLessRecordedExpenses: number;
  revenueAccounts: ProfitLossAccountBalance[];
  expenseAccounts: ProfitLossAccountBalance[];
}

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

export async function getProfitLossByCurrency(
  businessId: string,
  period: ResolvedReportPeriod,
): Promise<{
  period: ResolvedReportPeriod;
  currencies: CurrencyProfitLoss[];
  includesOnlyPostedEntries: true;
  includesCostOfGoodsSold: false;
}> {
  const accounts = await prisma.account.findMany({
    where: {
      businessId,
      type: {
        in: ["REVENUE", "EXPENSE"],
      },
      isActive: true,
    },
    include: {
      journalLines: {
        where: {
          journalEntry: {
            status: "POSTED",
            entryDate: {
              gte: period.startDate,
              lt: period.endDateExclusive,
            },
          },
        },
        select: {
          debit: true,
          credit: true,
          currency: true,
        },
      },
    },
  });

  const currencyMap = new Map<
    string,
    {
      revenue: number;
      expenses: number;
      revenueAccounts: ProfitLossAccountBalance[];
      expenseAccounts: ProfitLossAccountBalance[];
    }
  >();

  for (const account of accounts) {
    const balancesByCurrency = new Map<string, number>();

    for (const line of account.journalLines) {
      const balance =
        account.type === "REVENUE"
          ? line.credit.toNumber() - line.debit.toNumber()
          : line.debit.toNumber() - line.credit.toNumber();

      balancesByCurrency.set(
        line.currency,
        (balancesByCurrency.get(line.currency) ?? 0) + balance,
      );
    }

    for (const [currency, balance] of balancesByCurrency) {
      let summary = currencyMap.get(currency);

      if (!summary) {
        summary = {
          revenue: 0,
          expenses: 0,
          revenueAccounts: [],
          expenseAccounts: [],
        };

        currencyMap.set(currency, summary);
      }

      const accountBalance: ProfitLossAccountBalance = {
        id: account.id,
        code: account.code,
        name: account.name,
        balance,
      };

      if (account.type === "REVENUE") {
        summary.revenue += balance;
        summary.revenueAccounts.push(accountBalance);
      } else {
        summary.expenses += balance;
        summary.expenseAccounts.push(accountBalance);
      }
    }
  }

  const currencies: CurrencyProfitLoss[] = Array.from(
    currencyMap.entries(),
  )
    .sort(([currencyA], [currencyB]) =>
      currencyA.localeCompare(currencyB),
    )
    .map(([currency, summary]) => ({
      currency,
      revenue: summary.revenue,
      expenses: summary.expenses,
      revenueLessRecordedExpenses:
        summary.revenue - summary.expenses,
      revenueAccounts: summary.revenueAccounts,
      expenseAccounts: summary.expenseAccounts,
    }));

  return {
    period,
    currencies,
    includesOnlyPostedEntries: true,
    includesCostOfGoodsSold: false,
  };
}