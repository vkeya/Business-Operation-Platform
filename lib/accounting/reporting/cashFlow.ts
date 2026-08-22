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
    throw new Error(
      "Cash account not configured.",
    );
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