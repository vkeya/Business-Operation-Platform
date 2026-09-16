import { reportRepository } from "./reportRepository";

export const reportService = {
  async getBusinessReport(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const [
      sales,
      purchases,
      expenses,
      inventory,
      taxSummary,
    ] = await Promise.all([
      reportRepository.getSalesSummary(businessId),
      reportRepository.getPurchaseSummary(businessId),
      reportRepository.getExpenseSummary(businessId),
      reportRepository.getInventorySummary(businessId),
      reportRepository.getTaxSummary(businessId),
    ]);

    const revenue = Number(
      sales._sum.totalAmount ?? 0,
    );

    const purchaseCost = Number(
      purchases._sum.totalAmount ?? 0,
    );

    const expenseCost = Number(
      expenses._sum.amount ?? 0,
    );

    const inventoryValue = inventory.reduce(
      (total, item) =>
        total +
        Number(item.quantity) *
          Number(item.averageCost),
      0,
    );

    return {
      sales: {
        count: sales._count,
        amount: revenue,
      },

      tax: {
  taxableSales:
    Number(taxSummary.sales._sum.subtotal ?? 0) -
    Number(taxSummary.sales._sum.discountAmount ?? 0) -
    Number(taxSummary.returns._sum.subtotal ?? 0) +
    Number(taxSummary.returns._sum.discountAmount ?? 0),

  taxCollected:
    Number(taxSummary.sales._sum.taxAmount ?? 0) -
    Number(taxSummary.returns._sum.taxAmount ?? 0),

  totalSales:
    Number(taxSummary.sales._sum.totalAmount ?? 0) -
    Number(taxSummary.returns._sum.totalAmount ?? 0),
},

      purchases: {
        count: purchases._count,
        amount: purchaseCost,
      },

      expenses: {
        count: expenses._count,
        amount: expenseCost,
      },

      inventory: {
        value: inventoryValue,
        units: inventory.reduce(
          (total, item) =>
            total + Number(item.quantity),
          0,
        ),
      },

      profit:
        revenue -
        purchaseCost -
        expenseCost,
    };
  },
};