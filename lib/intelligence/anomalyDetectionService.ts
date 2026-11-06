import { prisma } from "@/lib/database/prisma";
import { requireAnomalyDetection } from "@/lib/intelligence/intelligenceAccessService";

const LOOKBACK_DAYS = 30;
const MIN_BASELINE_DAYS = 7;
const Z_SCORE_THRESHOLD = 2.5;

type DailyMetric = {
  date: string;
  value: number;
};

type Anomaly = {
  date: string;
  metric: string;
  dimension: string | null;
  value: number;
  baselineMean: number;
  baselineStdDev: number;
  zScore: number;
  direction: "SPIKE" | "DROP";
  severity: "LOW" | "MEDIUM" | "HIGH";
  explanation: string;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function dateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function mean(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function standardDeviation(values: number[], average: number) {
  if (values.length < 2) {
    return 0;
  }

  const variance =
    values.reduce(
      (sum, value) =>
        sum + Math.pow(value - average, 2),
      0,
    ) / values.length;

  return Math.sqrt(variance);
}

function severityForZScore(
  zScore: number,
): Anomaly["severity"] {
  const absolute = Math.abs(zScore);

  if (absolute >= 4) {
    return "HIGH";
  }

  if (absolute >= 3) {
    return "MEDIUM";
  }

  return "LOW";
}

function buildDailySeries(
  start: Date,
  end: Date,
  values: Map<string, number>,
) {
  const series: DailyMetric[] = [];

  for (
    let cursor = startOfDay(start);
    cursor <= end;
    cursor = addDays(cursor, 1)
  ) {
    const key = dateKey(cursor);

    series.push({
      date: key,
      value: values.get(key) ?? 0,
    });
  }

  return series;
}

function detectAnomalies(
  metric: string,
  dimension: string | null,
  baseline: DailyMetric[],
  current: DailyMetric[],
): Anomaly[] {
  if (baseline.length < MIN_BASELINE_DAYS) {
    return [];
  }

  const baselineValues = baseline.map(
    (item) => item.value,
  );
  const baselineMean = mean(baselineValues);
  const baselineStdDev = standardDeviation(
    baselineValues,
    baselineMean,
  );

  return current
    .map((item) => {
      const deviation =
        item.value - baselineMean;

      const zScore =
        baselineStdDev > 0
          ? deviation / baselineStdDev
          : baselineMean === 0
            ? item.value > 0
              ? Infinity
              : 0
            : item.value === 0
              ? -Infinity
              : item.value === baselineMean
                ? 0
                : item.value > baselineMean
                  ? Infinity
                  : -Infinity;

      const absoluteZ = Math.abs(zScore);

      if (
        absoluteZ < Z_SCORE_THRESHOLD ||
        (baselineMean === 0 && item.value === 0)
      ) {
        return null;
      }

      const direction =
        item.value >= baselineMean
          ? "SPIKE"
          : "DROP";

      const severity =
        severityForZScore(zScore);

      return {
        date: item.date,
        metric,
        dimension,
        value: item.value,
        baselineMean,
        baselineStdDev,
        zScore,
        direction,
        severity,
        explanation:
          direction === "SPIKE"
            ? `${metric} was materially above its preceding-period baseline.`
            : `${metric} was materially below its preceding-period baseline.`,
      } satisfies Anomaly;
    })
    .filter(
      (item): item is Anomaly =>
        item !== null,
    );
}

export async function getAnomalyDetection(
  businessId: string,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  await requireAnomalyDetection(businessId);

  const now = new Date();
  const currentStart = startOfDay(
    addDays(now, -LOOKBACK_DAYS + 1),
  );
  const baselineStart = startOfDay(
    addDays(now, -(LOOKBACK_DAYS * 2) + 1),
  );

  const [
    sales,
    inventoryMovements,
    paymentAttempts,
  ] = await Promise.all([
    prisma.sale.findMany({
      where: {
        businessId,
        status: "COMPLETED",
        createdAt: {
          gte: baselineStart,
          lte: now,
        },
      },
      select: {
        id: true,
        currency: true,
        subtotal: true,
        discountAmount: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
    prisma.inventoryMovement.findMany({
      where: {
        businessId,
        type: "ADJUSTMENT",
        createdAt: {
          gte: baselineStart,
          lte: now,
        },
      },
      select: {
        quantity: true,
        createdAt: true,
      },
    }),
    prisma.paymentAttempt.findMany({
      where: {
        businessId,
        status: "FAILED",
        createdAt: {
          gte: baselineStart,
          lte: now,
        },
      },
      select: {
        createdAt: true,
      },
    }),
  ]);

  const baselineEnd = addDays(
    currentStart,
    -1,
  );

  const splitByPeriod = <T extends { createdAt: Date }>(
    items: T[],
  ) => ({
    baseline: items.filter(
      (item) =>
        item.createdAt >= baselineStart &&
        item.createdAt <= baselineEnd,
    ),
    current: items.filter(
      (item) =>
        item.createdAt >= currentStart &&
        item.createdAt <= now,
    ),
  });

  const salesByPeriod = splitByPeriod(sales);
  const movementByPeriod =
    splitByPeriod(inventoryMovements);
  const paymentAttemptByPeriod =
    splitByPeriod(paymentAttempts);

  const currencies = Array.from(
    new Set(
      sales.map((sale) =>
        sale.currency.trim().toUpperCase(),
      ),
    ),
  );

  const anomalies: Anomaly[] = [];

  for (const currency of currencies) {
    const baselineRevenue = new Map<
      string,
      number
    >();
    const currentRevenue = new Map<
      string,
      number
    >();

    for (const sale of salesByPeriod.baseline) {
      if (
        sale.currency.trim().toUpperCase() !==
        currency
      ) {
        continue;
      }

      const key = dateKey(sale.createdAt);
      baselineRevenue.set(
        key,
        (baselineRevenue.get(key) ?? 0) +
          sale.totalAmount.toNumber(),
      );
    }

    for (const sale of salesByPeriod.current) {
      if (
        sale.currency.trim().toUpperCase() !==
        currency
      ) {
        continue;
      }

      const key = dateKey(sale.createdAt);
      currentRevenue.set(
        key,
        (currentRevenue.get(key) ?? 0) +
          sale.totalAmount.toNumber(),
      );
    }

    anomalies.push(
      ...detectAnomalies(
        "Revenue",
        currency,
        buildDailySeries(
          baselineStart,
          baselineEnd,
          baselineRevenue,
        ),
        buildDailySeries(
          currentStart,
          now,
          currentRevenue,
        ),
      ),
    );
  }

  const baselineSalesCount = new Map<
    string,
    number
  >();
  const currentSalesCount = new Map<
    string,
    number
  >();

  for (const sale of salesByPeriod.baseline) {
    const key = dateKey(sale.createdAt);
    baselineSalesCount.set(
      key,
      (baselineSalesCount.get(key) ?? 0) + 1,
    );
  }

  for (const sale of salesByPeriod.current) {
    const key = dateKey(sale.createdAt);
    currentSalesCount.set(
      key,
      (currentSalesCount.get(key) ?? 0) + 1,
    );
  }

  anomalies.push(
    ...detectAnomalies(
      "Completed sales count",
      null,
      buildDailySeries(
        baselineStart,
        baselineEnd,
        baselineSalesCount,
      ),
      buildDailySeries(
        currentStart,
        now,
        currentSalesCount,
      ),
    ),
  );

  const baselineDiscount = new Map<
    string,
    { discount: number; subtotal: number }
  >();
  const currentDiscount = new Map<
    string,
    { discount: number; subtotal: number }
  >();

  for (const sale of salesByPeriod.baseline) {
    const key = dateKey(sale.createdAt);
    const existing =
      baselineDiscount.get(key) ?? {
        discount: 0,
        subtotal: 0,
      };

    existing.discount +=
      sale.discountAmount.toNumber();
    existing.subtotal +=
      sale.subtotal.toNumber();

    baselineDiscount.set(key, existing);
  }

  for (const sale of salesByPeriod.current) {
    const key = dateKey(sale.createdAt);
    const existing =
      currentDiscount.get(key) ?? {
        discount: 0,
        subtotal: 0,
      };

    existing.discount +=
      sale.discountAmount.toNumber();
    existing.subtotal +=
      sale.subtotal.toNumber();

    currentDiscount.set(key, existing);
  }

  const baselineDiscountRate = new Map<
    string,
    number
  >();
  const currentDiscountRate = new Map<
    string,
    number
  >();

  for (const [key, value] of baselineDiscount) {
    baselineDiscountRate.set(
      key,
      value.subtotal === 0
        ? 0
        : (value.discount /
            value.subtotal) *
            100,
    );
  }

  for (const [key, value] of currentDiscount) {
    currentDiscountRate.set(
      key,
      value.subtotal === 0
        ? 0
        : (value.discount /
            value.subtotal) *
            100,
    );
  }

  anomalies.push(
    ...detectAnomalies(
      "Discount rate",
      null,
      buildDailySeries(
        baselineStart,
        baselineEnd,
        baselineDiscountRate,
      ),
      buildDailySeries(
        currentStart,
        now,
        currentDiscountRate,
      ),
    ),
  );

  const baselineAdjustments = new Map<
    string,
    number
  >();
  const currentAdjustments = new Map<
    string,
    number
  >();

  for (const movement of movementByPeriod.baseline) {
    const key = dateKey(movement.createdAt);
    baselineAdjustments.set(
      key,
      (baselineAdjustments.get(key) ?? 0) +
        Math.abs(
          movement.quantity.toNumber(),
        ),
    );
  }

  for (const movement of movementByPeriod.current) {
    const key = dateKey(movement.createdAt);
    currentAdjustments.set(
      key,
      (currentAdjustments.get(key) ?? 0) +
        Math.abs(
          movement.quantity.toNumber(),
        ),
    );
  }

  anomalies.push(
    ...detectAnomalies(
      "Inventory adjustment quantity",
      null,
      buildDailySeries(
        baselineStart,
        baselineEnd,
        baselineAdjustments,
      ),
      buildDailySeries(
        currentStart,
        now,
        currentAdjustments,
      ),
    ),
  );

  const baselineFailedPayments = new Map<
    string,
    number
  >();
  const currentFailedPayments = new Map<
    string,
    number
  >();

  for (const attempt of paymentAttemptByPeriod.baseline) {
    const key = dateKey(attempt.createdAt);
    baselineFailedPayments.set(
      key,
      (baselineFailedPayments.get(key) ?? 0) + 1,
    );
  }

  for (const attempt of paymentAttemptByPeriod.current) {
    const key = dateKey(attempt.createdAt);
    currentFailedPayments.set(
      key,
      (currentFailedPayments.get(key) ?? 0) + 1,
    );
  }

  anomalies.push(
    ...detectAnomalies(
      "Failed payment attempts",
      null,
      buildDailySeries(
        baselineStart,
        baselineEnd,
        baselineFailedPayments,
      ),
      buildDailySeries(
        currentStart,
        now,
        currentFailedPayments,
      ),
    ),
  );

  anomalies.sort((a, b) => {
    const severityRank = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return (
      severityRank[b.severity] -
        severityRank[a.severity] ||
      Math.abs(b.zScore) -
        Math.abs(a.zScore) ||
      b.date.localeCompare(a.date)
    );
  });

  return {
    period: {
      currentStart,
      baselineStart,
      end: now,
      days: LOOKBACK_DAYS,
    },
    summary: {
      totalAnomalies: anomalies.length,
      high: anomalies.filter(
        (item) => item.severity === "HIGH",
      ).length,
      medium: anomalies.filter(
        (item) => item.severity === "MEDIUM",
      ).length,
      low: anomalies.filter(
        (item) => item.severity === "LOW",
      ).length,
    },
    anomalies: anomalies.slice(0, 100),
    methodology: {
      baseline:
        "Each current day is compared with the preceding 30-day daily baseline.",
      detection:
        "An anomaly requires an absolute z-score of at least 2.5 and at least 7 baseline days.",
      severity:
        "LOW starts at 2.5 standard deviations, MEDIUM at 3, and HIGH at 4.",
      metrics:
        "Completed sales revenue is analysed separately by currency; completed sales count, discount rate, inventory adjustments and failed payment attempts are business-level signals.",
      currency:
        "Revenue anomalies never combine currencies.",
      interpretation:
        "An anomaly is a statistical signal for investigation, not proof of fraud, error or misconduct.",
    },
  };
}
