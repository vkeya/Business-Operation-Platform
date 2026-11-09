import { prisma } from "@/lib/database/prisma";
import { requireSupplierIntelligence } from "@/lib/intelligence/intelligenceAccessService";

const LOOKBACK_DAYS = 30;
const TOP_SUPPLIERS = 10;

type SupplierAggregate = {
  supplierId: string;
  supplierName: string;
  currency: string;
  spend: number;
  purchaseCount: number;
  averagePurchaseValue: number;
  shareOfCurrencySpend: number;
  paymentTermsDays: number | null;
  isActive: boolean;
};

function startOfWindow(daysAgo: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / previous) * 100;
}

export async function getSupplierIntelligence(
  businessId: string,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  await requireSupplierIntelligence(businessId);

  const now = new Date();
  const currentStart = startOfWindow(LOOKBACK_DAYS);
  const previousStart = startOfWindow(LOOKBACK_DAYS * 2);

  const purchases = await prisma.purchase.findMany({
    where: {
      businessId,
      status: "RECEIVED",
      createdAt: {
        gte: previousStart,
        lte: now,
      },
    },
    select: {
      id: true,
      supplierId: true,
      currency: true,
      totalAmount: true,
      createdAt: true,
      paymentStatus: true,
      supplier: {
        select: {
          id: true,
          name: true,
          isActive: true,
          createdAt: true,
          paymentTermsDays: true,
          currency: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const currentPurchases = purchases.filter(
    (purchase) => purchase.createdAt >= currentStart,
  );

  const previousPurchases = purchases.filter(
    (purchase) => purchase.createdAt < currentStart,
  );

  const currentSpendByCurrency = new Map<string, number>();
  const previousSpendByCurrency = new Map<string, number>();
  const currentPurchaseCountByCurrency = new Map<string, number>();
  const supplierCurrencyTotals = new Map<
    string,
    {
      supplierId: string;
      supplierName: string;
      currency: string;
      spend: number;
      purchaseCount: number;
      paymentTermsDays: number | null;
      isActive: boolean;
    }
  >();

  const addPurchase = (
    purchase: (typeof purchases)[number],
    target: Map<string, number>,
    countTarget?: Map<string, number>,
    aggregate?: boolean,
  ) => {
    const amount = purchase.totalAmount.toNumber();
    const currency = purchase.currency.trim().toUpperCase();

    target.set(
      currency,
      (target.get(currency) ?? 0) + amount,
    );

    if (countTarget) {
      countTarget.set(
        currency,
        (countTarget.get(currency) ?? 0) + 1,
      );
    }

    if (aggregate) {
      const key = `${currency}:${purchase.supplierId}`;
      const existing = supplierCurrencyTotals.get(key);

      if (existing) {
        existing.spend += amount;
        existing.purchaseCount += 1;
      } else {
        supplierCurrencyTotals.set(key, {
          supplierId: purchase.supplierId,
          supplierName: purchase.supplier.name,
          currency,
          spend: amount,
          purchaseCount: 1,
          paymentTermsDays:
            purchase.supplier.paymentTermsDays,
          isActive: purchase.supplier.isActive,
        });
      }
    }
  };

  for (const purchase of currentPurchases) {
    addPurchase(
      purchase,
      currentSpendByCurrency,
      currentPurchaseCountByCurrency,
      true,
    );
  }

  for (const purchase of previousPurchases) {
    addPurchase(
      purchase,
      previousSpendByCurrency,
    );
  }

  const topSuppliersByCurrency: Record<
    string,
    SupplierAggregate[]
  > = {};

  for (const currency of currentSpendByCurrency.keys()) {
    const totalSpend =
      currentSpendByCurrency.get(currency) ?? 0;

    const suppliers = Array.from(
      supplierCurrencyTotals.values(),
    )
      .filter(
        (supplier) => supplier.currency === currency,
      )
      .sort((a, b) => b.spend - a.spend)
      .slice(0, TOP_SUPPLIERS)
      .map((supplier) => ({
        ...supplier,
        averagePurchaseValue:
          supplier.purchaseCount === 0
            ? 0
            : supplier.spend /
              supplier.purchaseCount,
        shareOfCurrencySpend:
          totalSpend === 0
            ? 0
            : (supplier.spend / totalSpend) * 100,
      }));

    topSuppliersByCurrency[currency] = suppliers;
  }

  const supplierIdsInCurrentPeriod = new Set(
    currentPurchases.map(
      (purchase) => purchase.supplierId,
    ),
  );

  const activeSupplierCount =
    supplierIdsInCurrentPeriod.size;

  const newSupplierCount = new Set(
    currentPurchases
      .filter(
        (purchase) =>
          purchase.supplier.createdAt >= currentStart,
      )
      .map((purchase) => purchase.supplierId),
  ).size;

  const paymentTermsValues = Array.from(
    supplierCurrencyTotals.values(),
  )
    .map((supplier) => supplier.paymentTermsDays)
    .filter(
      (days): days is number =>
        days !== null && days >= 0,
    );

  const averagePaymentTermsDays =
    paymentTermsValues.length === 0
      ? null
      : paymentTermsValues.reduce(
          (sum, days) => sum + days,
          0,
        ) / paymentTermsValues.length;

  const purchaseCountByCurrency = Array.from(
    currentPurchaseCountByCurrency.entries(),
  ).map(([currency, purchaseCount]) => ({
    currency,
    purchaseCount,
    currentSpend:
      currentSpendByCurrency.get(currency) ?? 0,
    previousSpend:
      previousSpendByCurrency.get(currency) ?? 0,
    spendChangePercent: percentageChange(
      currentSpendByCurrency.get(currency) ?? 0,
      previousSpendByCurrency.get(currency) ?? 0,
    ),
    averagePurchaseValue:
      purchaseCount === 0
        ? 0
        : (currentSpendByCurrency.get(currency) ?? 0) /
          purchaseCount,
  }));

  const concentrationByCurrency =
    purchaseCountByCurrency.map((item) => {
      const topSupplier =
        topSuppliersByCurrency[item.currency]?.[0];

      return {
        currency: item.currency,
        topSupplierName:
          topSupplier?.supplierName ?? null,
        topSupplierSpend:
          topSupplier?.spend ?? 0,
        topSupplierSharePercent:
          topSupplier?.shareOfCurrencySpend ?? 0,
      };
    });

  const supplierCurrencyMismatchCount =
    currentPurchases.filter((purchase) => {
      const supplierCurrency =
        purchase.supplier.currency?.trim().toUpperCase();

      return (
        supplierCurrency &&
        supplierCurrency !==
          purchase.currency.trim().toUpperCase()
      );
    }).length;

  const partiallyOrUnpaidReceivedPurchases =
    currentPurchases.filter(
      (purchase) =>
        purchase.paymentStatus !== "PAID",
    ).length;

  return {
    period: {
      currentStart,
      previousStart,
      end: now,
      days: LOOKBACK_DAYS,
    },
    activeSupplierCount,
    newSupplierCount,
    averagePaymentTermsDays,
    partiallyOrUnpaidReceivedPurchases,
    purchaseCountByCurrency,
    topSuppliersByCurrency,
    concentrationByCurrency,
    dataQuality: {
      receivedPurchases: currentPurchases.length,
      supplierCurrencyMismatchCount,
      missingSupplierCount: 0,
    },
    methodology: {
      purchaseBoundary:
        "Only RECEIVED purchases are included.",
      comparison:
        "Current 30 days are compared with the preceding 30 days.",
      currency:
        "Spend, averages and concentration are calculated separately by purchase currency; currencies are never combined.",
      supplierSpend:
        "Supplier spend uses Purchase.totalAmount.",
      paymentExposure:
        "The payment exposure signal counts received purchases whose payment status is not PAID; it is not a cross-currency payable balance.",
    },
  };
}
