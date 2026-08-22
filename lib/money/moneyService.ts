import {
  moneyRepository,
} from "./moneyRepository";

export const moneyService = {
  async getBusinessSummary(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    const summary =
      await moneyRepository.getSummary(
        businessId,
      );

    const revenue =
      Number(
        summary.sales._sum.totalAmount ?? 0,
      );

    const purchases =
      Number(
        summary.purchases._sum.totalAmount ?? 0,
      );

    const expenses =
      Number(
        summary.expenses._sum.amount ?? 0,
      );

    return {
      revenue,
      purchases,
      expenses,

      estimatedProfit:
        revenue -
        purchases -
        expenses,

      salesCount:
        summary.sales._count,

      purchaseCount:
        summary.purchases._count,

      expenseCount:
        summary.expenses._count,
    };
  },


  async getRecentActivity(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    const [
      sales,
      expenses,
    ] = await Promise.all([
      moneyRepository.getRecentSales(
        businessId,
      ),

      moneyRepository.getRecentExpenses(
        businessId,
      ),
    ]);

    return {
      sales,
      expenses,
    };
  },
};