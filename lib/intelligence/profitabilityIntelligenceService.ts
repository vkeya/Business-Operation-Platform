import { prisma } from "@/lib/database/prisma";
import { requireProfitabilityIntelligence } from "./intelligenceAccessService";

const LOOKBACK_DAYS = 30;

type CurrencyBucket = {
  currency: string;
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  grossMarginPercent: number | null;
  netProfit: number;
  netMarginPercent: number | null;
  revenueCoveredByCost: number;
  costCoveragePercent: number | null;
};

type ProductProfitability = {
  productId: string;
  productName: string;
  currency: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPercent: number | null;
  unitsSold: number;
  costCoveragePercent: number | null;
};

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

function marginPercent(profit: number, revenue: number): number | null {
  if (revenue === 0) return null;
  return (profit / revenue) * 100;
}

function getPeriodStart(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function emptyBucket(currency: string): CurrencyBucket {
  return {
    currency,
    revenue: 0,
    cogs: 0,
    expenses: 0,
    grossProfit: 0,
    grossMarginPercent: null,
    netProfit: 0,
    netMarginPercent: null,
    revenueCoveredByCost: 0,
    costCoveragePercent: null,
  };
}

export const profitabilityIntelligenceService = {
  async getSummary(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    await requireProfitabilityIntelligence(businessId);

    const currentStart = getPeriodStart(LOOKBACK_DAYS);
    const previousStart = getPeriodStart(LOOKBACK_DAYS * 2);

    const [business, sales, returns, expenses] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        select: { baseCurrency: true },
      }),
      prisma.sale.findMany({
        where: {
          businessId,
          status: "COMPLETED",
          createdAt: { gte: previousStart },
        },
        select: {
          id: true,
          currency: true,
          subtotal: true,
          discountAmount: true,
          taxAmount: true,
          createdAt: true,
          items: {
            select: {
              productId: true,
              productName: true,
              quantity: true,
              totalAmount: true,
              taxAmount: true,
            },
          },
        },
      }),
      prisma.saleReturn.findMany({
        where: {
          businessId,
          status: "COMPLETED",
          createdAt: { gte: previousStart },
        },
        select: {
          id: true,
          saleId: true,
          currency: true,
          subtotal: true,
          discountAmount: true,
          createdAt: true,
          items: {
            select: {
              productId: true,
              productName: true,
              quantity: true,
              totalAmount: true,
              taxAmount: true,
            },
          },
        },
      }),
      prisma.expense.findMany({
        where: {
          businessId,
          expenseDate: { gte: previousStart },
        },
        select: {
          amount: true,
          currency: true,
          expenseDate: true,
        },
      }),
    ]);

    if (!business) {
      throw new Error("Business not found.");
    }

    const returnIds = returns.map((item) => item.id);

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        businessId,
        type: { in: ["SALE", "RETURN"] },
        createdAt: { gte: previousStart },
        OR: [
          { referenceType: "SALE" },
          ...(returnIds.length > 0
            ? [{ referenceType: "SALE_RETURN", referenceId: { in: returnIds } }]
            : []),
        ],
      },
      select: {
        productId: true,
        type: true,
        quantity: true,
        totalCost: true,
        referenceType: true,
        referenceId: true,
        createdAt: true,
      },
    });

    const saleById = new Map(sales.map((sale) => [sale.id, sale]));
    const returnById = new Map(returns.map((item) => [item.id, item]));

    const movementRows = movements
      .map((movement) => {
        if (movement.referenceType === "SALE") {
          const sale = movement.referenceId
            ? saleById.get(movement.referenceId)
            : undefined;

          if (!sale) return null;

          return {
            ...movement,
            currency: sale.currency,
            period:
              sale.createdAt >= currentStart ? "CURRENT" : "PREVIOUS",
          };
        }

        const saleReturn = movement.referenceId
          ? returnById.get(movement.referenceId)
          : undefined;

        if (!saleReturn) return null;

        return {
          ...movement,
          currency: saleReturn.currency,
          period:
            saleReturn.createdAt >= currentStart ? "CURRENT" : "PREVIOUS",
        };
      })
      .filter(
        (
          row,
        ): row is typeof row & {
          currency: string;
          period: "CURRENT" | "PREVIOUS";
        } => Boolean(row),
      );

    const buildPeriod = (start: Date, end?: Date) => {
      const periodSales = sales.filter(
        (sale) =>
          sale.createdAt >= start && (!end || sale.createdAt < end),
      );
      const periodReturns = returns.filter(
        (item) =>
          item.createdAt >= start && (!end || item.createdAt < end),
      );
      const periodExpenses = expenses.filter(
        (expense) =>
          expense.expenseDate >= start && (!end || expense.expenseDate < end),
      );
      const periodMovements = movementRows.filter(
        (movement) =>
          movement.period ===
          (start === currentStart ? "CURRENT" : "PREVIOUS"),
      );

      const buckets = new Map<string, CurrencyBucket>();

      const getBucket = (currency: string) => {
        const existing = buckets.get(currency);
        if (existing) return existing;
        const created = emptyBucket(currency);
        buckets.set(currency, created);
        return created;
      };

      for (const sale of periodSales) {
        const bucket = getBucket(sale.currency);
        bucket.revenue +=
          toNumber(sale.subtotal) - toNumber(sale.discountAmount);
      }

      for (const saleReturn of periodReturns) {
        const bucket = getBucket(saleReturn.currency);
        bucket.revenue -=
          toNumber(saleReturn.subtotal) -
          toNumber(saleReturn.discountAmount);
      }

      for (const expense of periodExpenses) {
        const bucket = getBucket(expense.currency);
        bucket.expenses += toNumber(expense.amount);
      }

      for (const movement of periodMovements) {
        const bucket = getBucket(movement.currency);
        const cost = toNumber(movement.totalCost);

        if (movement.type === "SALE") {
          bucket.cogs += cost;
        } else if (movement.type === "RETURN") {
          bucket.cogs -= cost;
        }
      }

      for (const bucket of buckets.values()) {
        bucket.grossProfit = bucket.revenue - bucket.cogs;
        bucket.netProfit = bucket.grossProfit - bucket.expenses;
        bucket.grossMarginPercent = marginPercent(
          bucket.grossProfit,
          bucket.revenue,
        );
        bucket.netMarginPercent = marginPercent(
          bucket.netProfit,
          bucket.revenue,
        );
      }

      const revenueByCurrency = new Map<string, number>();
      for (const sale of periodSales) {
        revenueByCurrency.set(
          sale.currency,
          (revenueByCurrency.get(sale.currency) ?? 0) +
            toNumber(sale.subtotal) -
            toNumber(sale.discountAmount),
        );
      }

      for (const saleReturn of periodReturns) {
        revenueByCurrency.set(
          saleReturn.currency,
          (revenueByCurrency.get(saleReturn.currency) ?? 0) -
            (toNumber(saleReturn.subtotal) -
              toNumber(saleReturn.discountAmount)),
        );
      }

      for (const movement of periodMovements) {
        if (movement.type !== "SALE") continue;

        const sale = movement.referenceId
          ? saleById.get(movement.referenceId)
          : undefined;
        if (!sale) continue;

        const revenue = sale.items
          .filter((item) => item.productId === movement.productId)
          .reduce(
            (total, item) =>
              total +
              toNumber(item.totalAmount) -
              toNumber(item.taxAmount),
            0,
          );

        const bucket = getBucket(sale.currency);
        bucket.revenueCoveredByCost += Math.min(
          Math.max(revenue, 0),
          Math.max(
            toNumber(sale.subtotal) - toNumber(sale.discountAmount),
            0,
          ),
        );
      }

      for (const bucket of buckets.values()) {
        bucket.costCoveragePercent =
          bucket.revenue === 0
            ? null
            : (bucket.revenueCoveredByCost / Math.abs(bucket.revenue)) * 100;
      }

      return Array.from(buckets.values()).sort(
        (a, b) => Math.abs(b.revenue) - Math.abs(a.revenue),
      );
    };

    const current = buildPeriod(currentStart);
    const previous = buildPeriod(previousStart, currentStart);

    const productMap = new Map<
      string,
      ProductProfitability & { coveredRevenue: number }
    >();

    for (const sale of sales) {
      if (sale.createdAt < currentStart) continue;

      for (const item of sale.items) {
        const key = `${sale.currency}:${item.productId}`;
        const existing = productMap.get(key) ?? {
          productId: item.productId,
          productName: item.productName,
          currency: sale.currency,
          revenue: 0,
          cogs: 0,
          grossProfit: 0,
          marginPercent: null,
          unitsSold: 0,
          costCoveragePercent: null,
          coveredRevenue: 0,
        };

        existing.revenue +=
          toNumber(item.totalAmount) - toNumber(item.taxAmount);
        existing.unitsSold += toNumber(item.quantity);
        productMap.set(key, existing);
      }
    }

    for (const movement of periodMovementRowsForCurrent(movementRows)) {
      if (movement.type !== "SALE") continue;

      const key = `${movement.currency}:${movement.productId}`;
      const existing = productMap.get(key);
      if (!existing) continue;

      const cost = toNumber(movement.totalCost);
      existing.cogs += cost;

      const sale = movement.referenceId
        ? saleById.get(movement.referenceId)
        : undefined;

      if (sale) {
        const coveredRevenue = sale.items
          .filter((item) => item.productId === movement.productId)
          .reduce(
            (total, item) =>
              total +
              toNumber(item.totalAmount) -
              toNumber(item.taxAmount),
            0,
          );

        existing.coveredRevenue += coveredRevenue;
      }
    }

    for (const saleReturn of returns) {
      if (saleReturn.createdAt < currentStart) continue;

      for (const item of saleReturn.items) {
        const key = `${saleReturn.currency}:${item.productId}`;
        const existing = productMap.get(key);
        if (!existing) continue;

        existing.revenue -=
          toNumber(item.totalAmount) - toNumber(item.taxAmount);
        existing.unitsSold -= toNumber(item.quantity);
      }
    }

    for (const movement of movementRows) {
      if (movement.period !== "CURRENT" || movement.type !== "RETURN") {
        continue;
      }

      const key = `${movement.currency}:${movement.productId}`;
      const existing = productMap.get(key);
      if (existing) {
        existing.cogs -= toNumber(movement.totalCost);
      }
    }

    const products = Array.from(productMap.values())
      .map(({ coveredRevenue, ...product }) => ({
        ...product,
        grossProfit: product.revenue - product.cogs,
        marginPercent: marginPercent(
          product.revenue - product.cogs,
          product.revenue,
        ),
        costCoveragePercent:
          product.revenue === 0
            ? null
            : (coveredRevenue / Math.abs(product.revenue)) * 100,
      }))
      .sort((a, b) => b.grossProfit - a.grossProfit);

    return {
      baseCurrency: business.baseCurrency,
      lookbackDays: LOOKBACK_DAYS,
      current,
      previous,
      products: products.slice(0, 20),
      methodology: {
        revenueBasis: "Completed sales net of discounts and tax.",
        cogsBasis:
          "Inventory SALE movements less RETURN movements using recorded movement totalCost.",
        expenseBasis: "Expenses grouped by their recorded currency.",
        multiCurrency:
          "Profitability is kept separate by currency; currencies are not combined without an explicit conversion.",
        costCoverage:
          "Coverage measures revenue associated with inventory cost movements. Uncovered revenue is not assigned invented COGS.",
      },
    };
  },
};

function periodMovementRowsForCurrent(
  rows: Array<{
    period: "CURRENT" | "PREVIOUS";
    type: "SALE" | "RETURN" | any;
    productId: string;
    currency: string;
    quantity: unknown;
    totalCost: unknown;
    referenceType: string | null;
    referenceId: string | null;
    createdAt: Date;
  }>,
) {
  return rows.filter((row) => row.period === "CURRENT");
}
