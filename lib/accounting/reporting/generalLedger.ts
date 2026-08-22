import { prisma } from "@/lib/database/prisma";


export async function getGeneralLedger(
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
        account: true,
      },

      orderBy: {
        journalEntry: {
          entryDate: "asc",
        },
      },
    });


  let balance = 0;


  const transactions =
    lines.map((line) => {
      balance +=
        line.debit.toNumber() -
        line.credit.toNumber();


      return {
        id: line.id,

        date:
          line.journalEntry.entryDate,

        reference:
          line.journalEntry.reference,

        description:
          line.journalEntry.description,

        debit:
          line.debit.toNumber(),

        credit:
          line.credit.toNumber(),

        balance,
      };
    });


  return {
    account:
      lines[0]?.account ?? null,

    transactions,
  };
}