import { prisma } from "@/lib/database/prisma";

export const reportRepository = {
  async getSalesSummary(
    businessId: string,
  ) {
    return prisma.sale.aggregate({
      where: {
        businessId,
        status: "COMPLETED",
      },
      _sum: {
        totalAmount: true,
      },
      _count: true,
    });
  },
  
      async getTaxSummary(
    businessId: string,
  ) {
    const [sales, returns] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          businessId,
          status: "COMPLETED",
        },
        _sum: {
          subtotal: true,
          discountAmount: true,
          taxAmount: true,
          totalAmount: true,
        },
      }),

      prisma.saleReturn.aggregate({
        where: {
          businessId,
          status: "COMPLETED",
        },
        _sum: {
          subtotal: true,
          discountAmount: true,
          taxAmount: true,
          totalAmount: true,
        },
      }),
    ]);

    return {
      sales,
      returns,
    };
  },

  async getPurchaseSummary(
    businessId: string,
  ) {
    return prisma.purchase.aggregate({
      where: {
        businessId,
        status: "RECEIVED",
      },
      _sum: {
        totalAmount: true,
      },
      _count: true,
    });
  },

  async getExpenseSummary(
    businessId: string,
  ) {
    return prisma.expense.aggregate({
      where: {
        businessId,
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });
  },

  async getInventorySummary(
    businessId: string,
  ) {
    const balances =
      await prisma.inventoryBalance.findMany({
        where: {
          warehouse: {
            businessId,
          },
        },
      });

    return balances;
  },
};