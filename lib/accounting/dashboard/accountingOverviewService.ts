
import { prisma } from "@/lib/database/prisma";

interface AccountBalance {
  code: string;
  name: string;
  balance: number;
}
interface PaymentAccountBalance {
  code: string;
  name: string;
  balance: number;
}
interface CurrencyOverview {
  currency: string;
  revenue: number;
  expenses: number;
  revenueLessRecordedExpenses: number;
  cashAndPaymentBalances: number;
  receivables: number;
  payables: number;
  inventory: number;
  paymentAccounts: PaymentAccountBalance[];
  revenueAccounts: AccountBalance[];
  expenseAccounts: AccountBalance[];
}

const PAYMENT_ACCOUNT_CODES = [
  "1000",
  "1010",
  "1020",
  "1030",
];

export async function getAccountingOverviewByCurrency(
  businessId: string,
): Promise<{
  currencies: CurrencyOverview[];
  includesOnlyPostedEntries: true;
  includesCostOfGoodsSold: false;
}> {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  const accounts = await prisma.account.findMany({
    where: {
      businessId,
      code: {
        in: [
          ...PAYMENT_ACCOUNT_CODES,
          "1100",
          "1200",
          "2000",
        ],
      },
    },
    include: {
      journalLines: {
        where: {
          journalEntry: {
            status: "POSTED",
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

  const profitLossAccounts = await prisma.account.findMany({
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

  const currencyMap = new Map<string, CurrencyOverview>();

  function getCurrency(currency: string) {
    let summary = currencyMap.get(currency);

    if (!summary) {
      summary = {
        currency,
        revenue: 0,
        expenses: 0,
        revenueLessRecordedExpenses: 0,
        cashAndPaymentBalances: 0,
        receivables: 0,
        payables: 0,
        inventory: 0,
		paymentAccounts: [],
        revenueAccounts: [],
        expenseAccounts: [],
      };

      currencyMap.set(currency, summary);
    }

    return summary;
  }

  for (const account of accounts) {
    const balancesByCurrency = new Map<string, number>();

    for (const line of account.journalLines) {
      const balance =
        line.debit.toNumber() -
        line.credit.toNumber();

      balancesByCurrency.set(
        line.currency,
        (balancesByCurrency.get(line.currency) ?? 0) +
          balance,
      );
    }

    for (const [currency, balance] of balancesByCurrency) {
      const summary = getCurrency(currency);

      if (PAYMENT_ACCOUNT_CODES.includes(account.code)) {
        summary.cashAndPaymentBalances += balance;
      
        summary.paymentAccounts.push({
          code: account.code,
          name: account.name,
          balance,
        });
      } else if (account.code === "1100") {
        summary.inventory += balance;
      } else if (account.code === "1200") {
        summary.receivables += balance;
      } else if (account.code === "2000") {
        summary.payables -= balance;
      }
    }
  }

  for (const account of profitLossAccounts) {
    const balancesByCurrency = new Map<string, number>();

    for (const line of account.journalLines) {
      const balance =
        account.type === "REVENUE"
          ? line.credit.toNumber() - line.debit.toNumber()
          : line.debit.toNumber() - line.credit.toNumber();

      balancesByCurrency.set(
        line.currency,
        (balancesByCurrency.get(line.currency) ?? 0) +
          balance,
      );
    }

    for (const [currency, balance] of balancesByCurrency) {
      const summary = getCurrency(currency);

      const accountBalance: AccountBalance = {
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

  const currencies = Array.from(currencyMap.values())
    .map((summary) => ({
      ...summary,
      revenueLessRecordedExpenses:
        summary.revenue - summary.expenses,
    }))
    .sort((a, b) =>
      a.currency.localeCompare(b.currency),
    );

  return {
    currencies,
    includesOnlyPostedEntries: true,
    includesCostOfGoodsSold: false,
  };
}
