import { prisma } from "@/lib/database/prisma";
import { requireCustomerIntelligence } from "./intelligenceAccessService";

const PERIOD_DAYS = 30;

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function subtractDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() - days);
  return value;
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

type CustomerSales = {
  customerId: string;
  customerName: string;
  currency: string;
  salesCount: number;
  revenue: number;
  units: number;
  firstSaleAt: Date;
  lastSaleAt: Date;
};

function buildCustomerSales(
  rows: Array<{
    customerId: string | null;
    customer: { name: string } | null;
    currency: string;
    subtotal: unknown;
    discountAmount: unknown;
    items: Array<{ quantity: unknown }>;
    createdAt: Date;
  }>,
) {
  const byCustomer = new Map<string, CustomerSales>();

  for (const row of rows) {
    if (!row.customerId || !row.customer) {
      continue;
    }

    const revenue =
      Number(row.subtotal ?? 0) -
      Number(row.discountAmount ?? 0);

    const units = row.items.reduce(
      (total, item) => total + Number(item.quantity ?? 0),
      0,
    );

    const key = `${row.customerId}:${row.currency}`;
    const existing = byCustomer.get(key);

    if (existing) {
      existing.salesCount += 1;
      existing.revenue += revenue;
      existing.units += units;
      if (row.createdAt < existing.firstSaleAt) {
        existing.firstSaleAt = row.createdAt;
      }
      if (row.createdAt > existing.lastSaleAt) {
        existing.lastSaleAt = row.createdAt;
      }
      continue;
    }

    byCustomer.set(key, {
      customerId: row.customerId,
      customerName: row.customer.name,
      currency: row.currency,
      salesCount: 1,
      revenue,
      units,
      firstSaleAt: row.createdAt,
      lastSaleAt: row.createdAt,
    });
  }

  return [...byCustomer.values()];
}

export const customerIntelligenceService = {
  async getOverview(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    await requireCustomerIntelligence(businessId);

    const now = new Date();
    const currentStart = startOfDay(
      subtractDays(now, PERIOD_DAYS),
    );
    const previousStart = startOfDay(
      subtractDays(now, PERIOD_DAYS * 2),
    );

    const [currentSales, previousSales, customers] =
      await Promise.all([
        prisma.sale.findMany({
          where: {
            businessId,
            status: "COMPLETED",
            createdAt: {
              gte: currentStart,
              lt: now,
            },
          },
          select: {
            customerId: true,
            customer: {
              select: {
                name: true,
              },
            },
            currency: true,
            subtotal: true,
            discountAmount: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
              },
            },
          },
        }),
        prisma.sale.findMany({
          where: {
            businessId,
            status: "COMPLETED",
            createdAt: {
              gte: previousStart,
              lt: currentStart,
            },
          },
          select: {
            customerId: true,
            customer: {
              select: {
                name: true,
              },
            },
            currency: true,
            subtotal: true,
            discountAmount: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
              },
            },
          },
        }),
        prisma.customer.findMany({
          where: {
            businessId,
          },
          select: {
            id: true,
            name: true,
            createdAt: true,
            isActive: true,
          },
        }),
      ]);

    const current = buildCustomerSales(currentSales);
    const previous = buildCustomerSales(previousSales);

    const currentCustomerIds = new Set(
      current.map((item) => item.customerId),
    );
    const previousCustomerIds = new Set(
      previous.map((item) => item.customerId),
    );

    const repeatCustomerCount = current.filter(
      (item) => item.salesCount >= 2,
    ).length;

    const revenueByCurrency = new Map<
      string,
      { currency: string; revenue: number; customers: Set<string> }
    >();

    for (const item of current) {
      const bucket =
        revenueByCurrency.get(item.currency) ?? {
          currency: item.currency,
          revenue: 0,
          customers: new Set<string>(),
        };

      bucket.revenue += item.revenue;
      bucket.customers.add(item.customerId);
      revenueByCurrency.set(item.currency, bucket);
    }

    const previousRevenueByCurrency = new Map<string, number>();
    for (const item of previous) {
      previousRevenueByCurrency.set(
        item.currency,
        (previousRevenueByCurrency.get(item.currency) ?? 0) +
          item.revenue,
      );
    }

    const topCustomers = [...current]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((item) => ({
        customerId: item.customerId,
        customerName: item.customerName,
        currency: item.currency,
        revenue: item.revenue,
        salesCount: item.salesCount,
        units: item.units,
        averageOrderValue:
          item.salesCount > 0
            ? item.revenue / item.salesCount
            : 0,
        lastPurchaseAt: item.lastSaleAt,
      }));

    const newCustomers = customers.filter(
      (customer) =>
        customer.createdAt >= currentStart &&
        customer.createdAt < now,
    ).length;

    const returningCustomers = [...currentCustomerIds].filter(
      (customerId) => previousCustomerIds.has(customerId),
    ).length;

    const currentRevenue = current.reduce(
      (total, item) => total + item.revenue,
      0,
    );
    const previousRevenue = previous.reduce(
      (total, item) => total + item.revenue,
      0,
    );

    const unassignedSales = currentSales.filter(
      (sale) => !sale.customerId,
    );

    const unassignedRevenue = unassignedSales.reduce(
      (total, sale) =>
        total +
        Number(sale.subtotal ?? 0) -
        Number(sale.discountAmount ?? 0),
      0,
    );

    const totalActiveCustomers = customers.filter(
      (customer) => customer.isActive,
    ).length;

    return {
      period: {
        start: currentStart,
        end: now,
        days: PERIOD_DAYS,
      },
      summary: {
        activeCustomers: currentCustomerIds.size,
        totalActiveCustomers,
        repeatCustomers: repeatCustomerCount,
        repeatCustomerRate:
          currentCustomerIds.size > 0
            ? (repeatCustomerCount /
                currentCustomerIds.size) *
              100
            : 0,
        newCustomers,
        returningCustomers,
        revenue: currentRevenue,
        previousRevenue,
        revenueChangePct: percentageChange(
          currentRevenue,
          previousRevenue,
        ),
        averageRevenuePerCustomer:
          currentCustomerIds.size > 0
            ? currentRevenue / currentCustomerIds.size
            : 0,
      },
      revenueByCurrency: [...revenueByCurrency.values()].map(
        (item) => ({
          currency: item.currency,
          revenue: item.revenue,
          customerCount: item.customers.size,
          previousRevenue:
            previousRevenueByCurrency.get(item.currency) ?? 0,
          revenueChangePct: percentageChange(
            item.revenue,
            previousRevenueByCurrency.get(item.currency) ?? 0,
          ),
        }),
      ),
      topCustomers,
      dataQuality: {
        unassignedSalesCount: unassignedSales.length,
        unassignedRevenue,
        unassignedCustomerRate:
          currentSales.length > 0
            ? (unassignedSales.length /
                currentSales.length) *
              100
            : 0,
      },
      methodology: [
        "Customer revenue is based on completed sales in the sale currency.",
        "Currencies are kept separate; no cross-currency aggregation or conversion is performed.",
        "Repeat customer rate counts customers with at least two completed sales in the current 30-day period.",
        "Returning customers are customers active in both the current and previous 30-day periods.",
        "Sales without a customer are excluded from customer rankings and reported separately as a data-quality signal.",
      ],
    };
  },
};
