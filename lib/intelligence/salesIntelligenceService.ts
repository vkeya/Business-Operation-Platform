import { prisma } from "@/lib/database/prisma";

const LOOKBACK_DAYS = 30;

type SaleRecord = {
  id: string;
  currency: string;
  totalAmount: { toNumber(): number };
  subtotal: { toNumber(): number };
  discountAmount: { toNumber(): number };
  createdAt: Date;
  customer: { name: string } | null;
  items: Array<{
    productId: string;
    productName: string;
    quantity: { toNumber(): number };
    totalAmount: { toNumber(): number };
  }>;
};

type SalesPeriod = {
  from: Date;
  to: Date;
};

function toPeriod(days: number, end: Date): SalesPeriod {
  const from = new Date(end);
  from.setDate(from.getDate() - days);
  return { from, to: end };
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / previous) * 100;
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

async function getCompletedSales(
  businessId: string,
  period: SalesPeriod,
): Promise<SaleRecord[]> {
  return prisma.sale.findMany({
    where: {
      businessId,
      status: "COMPLETED",
      createdAt: {
        gte: period.from,
        lt: period.to,
      },
    },
    select: {
      id: true,
      currency: true,
      totalAmount: true,
      subtotal: true,
      discountAmount: true,
      createdAt: true,
      customer: {
        select: {
          name: true,
        },
      },
      items: {
        select: {
          productId: true,
          productName: true,
          quantity: true,
          totalAmount: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

function buildPeriodMetrics(sales: SaleRecord[]) {
  const currencies = Array.from(
    new Set(sales.map((sale) => sale.currency)),
  );

  const revenueByCurrency = new Map<string, number>();

  let salesCount = 0;
  let unitsSold = 0;
  let discounts = 0;
  let subtotal = 0;

  const productMap = new Map<
    string,
    {
      productId: string;
      productName: string;
      unitsSold: number;
      revenueByCurrency: Map<string, number>;
    }
  >();

  const customerMap = new Map<
    string,
    {
      customerName: string;
      salesCount: number;
      revenueByCurrency: Map<string, number>;
    }
  >();

  const dailyMap = new Map<
    string,
    { salesCount: number; revenueByCurrency: Map<string, number> }
  >();

  for (const sale of sales) {
    salesCount += 1;

    const currency = sale.currency;
    const revenue = sale.totalAmount.toNumber();
    const saleSubtotal = sale.subtotal.toNumber();
    const saleDiscount = sale.discountAmount.toNumber();

    revenueByCurrency.set(
      currency,
      (revenueByCurrency.get(currency) ?? 0) + revenue,
    );

    subtotal += saleSubtotal;
    discounts += saleDiscount;

    const day = sale.createdAt.toISOString().slice(0, 10);
    const daily = dailyMap.get(day) ?? {
      salesCount: 0,
      revenueByCurrency: new Map<string, number>(),
    };

    daily.salesCount += 1;
    daily.revenueByCurrency.set(
      currency,
      (daily.revenueByCurrency.get(currency) ?? 0) + revenue,
    );
    dailyMap.set(day, daily);

    for (const item of sale.items) {
      const quantity = item.quantity.toNumber();
      unitsSold += quantity;

      const product = productMap.get(item.productId) ?? {
        productId: item.productId,
        productName: item.productName,
        unitsSold: 0,
        revenueByCurrency: new Map<string, number>(),
      };

      product.unitsSold += quantity;
      product.revenueByCurrency.set(
        currency,
        (product.revenueByCurrency.get(currency) ?? 0) +
          item.totalAmount.toNumber(),
      );

      productMap.set(item.productId, product);
    }

    if (sale.customer) {
      const customer = customerMap.get(sale.customer.name) ?? {
        customerName: sale.customer.name,
        salesCount: 0,
        revenueByCurrency: new Map<string, number>(),
      };

      customer.salesCount += 1;
      customer.revenueByCurrency.set(
        currency,
        (customer.revenueByCurrency.get(currency) ?? 0) + revenue,
      );

      customerMap.set(sale.customer.name, customer);
    }
  }

  const singleCurrency = currencies.length === 1;
  const currency = singleCurrency ? currencies[0] : null;
  const revenue = currency
    ? revenueByCurrency.get(currency) ?? 0
    : null;

  return {
    currencies,
    currency,
    revenue,
    salesCount,
    unitsSold,
    averageOrderValue:
      revenue !== null && salesCount > 0
        ? revenue / salesCount
        : null,
    discountRate:
      subtotal > 0 ? (discounts / subtotal) * 100 : 0,
    revenueByCurrency: Array.from(revenueByCurrency.entries()).map(
      ([code, amount]) => ({
        currency: code,
        amount: round(amount),
      }),
    ),
    topProducts: Array.from(productMap.values())
      .map((product) => ({
        productId: product.productId,
        productName: product.productName,
        unitsSold: round(product.unitsSold, 4),
        revenue:
          currency !== null
            ? round(
                product.revenueByCurrency.get(currency) ?? 0,
              )
            : null,
      }))
      .sort((a, b) => {
        if (currency !== null) {
          return (b.revenue ?? 0) - (a.revenue ?? 0);
        }

        return b.unitsSold - a.unitsSold;
      })
      .slice(0, 10),
    topCustomers: Array.from(customerMap.values())
      .map((customer) => ({
        customerName: customer.customerName,
        salesCount: customer.salesCount,
        revenue:
          currency !== null
            ? round(
                customer.revenueByCurrency.get(currency) ?? 0,
              )
            : null,
      }))
      .sort((a, b) => {
        if (currency !== null) {
          return (b.revenue ?? 0) - (a.revenue ?? 0);
        }

        return b.salesCount - a.salesCount;
      })
      .slice(0, 10),
    dailyTrend: Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, day]) => ({
        date,
        salesCount: day.salesCount,
        revenue:
          currency !== null
            ? round(day.revenueByCurrency.get(currency) ?? 0)
            : null,
        revenueByCurrency: Array.from(
          day.revenueByCurrency.entries(),
        ).map(([code, amount]) => ({
          currency: code,
          amount: round(amount),
        })),
      })),
  };
}

export const salesIntelligenceService = {
  async getOverview(
    businessId: string,
    now = new Date(),
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const currentPeriod = toPeriod(LOOKBACK_DAYS, now);

    const previousPeriod: SalesPeriod = {
      from: new Date(currentPeriod.from),
      to: new Date(currentPeriod.from),
    };
    previousPeriod.from.setDate(
      previousPeriod.from.getDate() - LOOKBACK_DAYS,
    );

    const [currentSales, previousSales] = await Promise.all([
      getCompletedSales(businessId, currentPeriod),
      getCompletedSales(businessId, previousPeriod),
    ]);

    const current = buildPeriodMetrics(currentSales);
    const previous = buildPeriodMetrics(previousSales);

    return {
      lookbackDays: LOOKBACK_DAYS,
      current: {
        ...current,
        revenueChangePercentage:
          current.revenue !== null && previous.revenue !== null
            ? percentageChange(
                current.revenue,
                previous.revenue,
              )
            : null,
      },
      previous,
      mixedCurrencies:
        current.currencies.length > 1 ||
        previous.currencies.length > 1,
      generatedAt: now,
    };
  },
};
