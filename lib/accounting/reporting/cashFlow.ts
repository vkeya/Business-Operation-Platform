import { prisma } from "@/lib/database/prisma";


export async function getCashFlow(
  businessId: string,
) {
  const cashAccount =
    await prisma.account.findFirst({
      where: {
        businessId,
        code: "1000",
      },

      include: {
        journalLines: {
          where: {
            journalEntry: {
              status: "POSTED",
            },
          },

          include: {
            journalEntry: true,
          },
        },
      },
    });


    if (!cashAccount) {
    return {
      cashIn: 0,
      cashOut: 0,
      netCashMovement: 0,
      transactions: [],
    };
  }


  const cashIn =
    cashAccount.journalLines.reduce(
      (total, line) =>
        total +
        line.debit.toNumber(),
      0,
    );


  const cashOut =
    cashAccount.journalLines.reduce(
      (total, line) =>
        total +
        line.credit.toNumber(),
      0,
    );


  return {
    cashIn,

    cashOut,

    netCashMovement:
      cashIn - cashOut,

    transactions:
      cashAccount.journalLines,
  };
}