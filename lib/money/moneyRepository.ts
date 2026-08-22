import { prisma } from "@/lib/database/prisma";

export const moneyRepository = {
  async getSummary(
    businessId: string,
  ) {
    const [
      sales,
      purchases,
      expenses,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          businessId,
          status: "COMPLETED",
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      }),

      prisma.purchase.aggregate({
        where: {
          businessId,
          status: "RECEIVED",
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      }),

      prisma.expense.aggregate({
        where: {
          businessId,
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]);

    return {
      sales,
      purchases,
      expenses,
    };
  },


  async getRecentSales(
    businessId: string,
  ) {
    return prisma.sale.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });
  },


  async getRecentExpenses(
    businessId: string,
  ) {
    return prisma.expense.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });
  },
};