import { prisma } from "@/lib/database/prisma";
import { getProfitLoss } from "@/lib/accounting/reporting/profitLoss";
import { getCashFlow } from "@/lib/accounting/reporting/cashFlow";


export async function getAccountingMetrics(
  businessId: string,
) {
  const profitLoss =
    await getProfitLoss(
      businessId,
    );

  const cashFlow =
    await getCashFlow(
      businessId,
    );


  const receivables =
    await prisma.journalEntryLine.aggregate({
      _sum: {
        debit: true,
        credit: true,
      },

      where: {
        account: {
          businessId,
          code: "1200",
        },

        journalEntry: {
          status: "POSTED",
        },
      },
    });


  const payables =
    await prisma.journalEntryLine.aggregate({
      _sum: {
        debit: true,
        credit: true,
      },

      where: {
        account: {
          businessId,
          code: "2000",
        },

        journalEntry: {
          status: "POSTED",
        },
      },
    });


  const inventory =
    await prisma.journalEntryLine.aggregate({
      _sum: {
        debit: true,
        credit: true,
      },

      where: {
        account: {
          businessId,
          code: "1100",
        },

        journalEntry: {
          status: "POSTED",
        },
      },
    });


  return {
    revenue:
      profitLoss.revenue,

    expenses:
      profitLoss.expenses,

    profit:
      profitLoss.profit,

    cashPosition:
      cashFlow.netCashMovement,

    receivables:
      (receivables._sum.debit?.toNumber() ?? 0) -
      (receivables._sum.credit?.toNumber() ?? 0),

    payables:
      (payables._sum.credit?.toNumber() ?? 0) -
      (payables._sum.debit?.toNumber() ?? 0),

    inventoryValue:
      (inventory._sum.debit?.toNumber() ?? 0) -
      (inventory._sum.credit?.toNumber() ?? 0),
  };
}