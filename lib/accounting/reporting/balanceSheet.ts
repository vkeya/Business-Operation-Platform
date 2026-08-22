import { prisma } from "@/lib/database/prisma";


export async function getBalanceSheet(
  businessId: string,
) {
  const accounts =
    await prisma.account.findMany({
      where: {
        businessId,
        type: {
          in: [
            "ASSET",
            "LIABILITY",
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


  const assets =
    accounts
      .filter(
        (account) =>
          account.type === "ASSET",
      )
      .map((account) => ({
        id: account.id,

        code: account.code,

        name: account.name,

        balance:
          account.journalLines.reduce(
            (total, line) =>
              total +
              line.debit.toNumber() -
              line.credit.toNumber(),
            0,
          ),
      }));


  const liabilities =
    accounts
      .filter(
        (account) =>
          account.type === "LIABILITY",
      )
      .map((account) => ({
        id: account.id,

        code: account.code,

        name: account.name,

        balance:
          account.journalLines.reduce(
            (total, line) =>
              total +
              line.credit.toNumber() -
              line.debit.toNumber(),
            0,
          ),
      }));


  const totalAssets =
    assets.reduce(
      (total, account) =>
        total + account.balance,
      0,
    );


  const totalLiabilities =
    liabilities.reduce(
      (total, account) =>
        total + account.balance,
      0,
    );


  return {
    assets,

    liabilities,

    totalAssets,

    totalLiabilities,

    equity:
      totalAssets -
      totalLiabilities,
  };
}