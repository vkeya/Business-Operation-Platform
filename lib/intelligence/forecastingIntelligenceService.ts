import { prisma } from "@/lib/database/prisma";
import { requireForecasting } from "@/lib/intelligence/intelligenceAccessService";

const DEFAULT_LOOKBACK_DAYS = 30;
const DEFAULT_HORIZON_DAYS = 7;
const MINIMUM_OBSERVATIONS = 7;

type ForecastConfidence =
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INSUFFICIENT_DATA";

type ForecastTrend =
  | "ACCELERATING"
  | "DECLINING"
  | "STABLE";

export interface ForecastSeries {
  currency: string;
  observations: number;
  activeDays: number;
  historicalRevenue: number;
  averageDailyRevenue: number;
  forecastDailyRevenue: number;
  projectedRevenue: number;
  historicalSales: number;
  averageDailySales: number;
  forecastDailySales: number;
  projectedSales: number;
  trend: ForecastTrend;
  confidence: ForecastConfidence;
  dailyForecast: Array<{
    date: string;
    revenue: number;
    sales: number;
  }>;
}

export interface ForecastingIntelligence {
  businessId: string;
  generatedAt: string;
  lookbackDays: number;
  horizonDays: number;
  series: ForecastSeries[];
  methodology: {
    revenueMetric: string;
    salesMetric: string;
    baseline: string;
    model: string;
    currencyHandling: string;
    minimumDataRequirement: string;
    limitation: string;
  };
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function toNumber(value: unknown) {
  return Number(value);
}

function buildDailyDates(
  endDate: Date,
  lookbackDays: number,
) {
  const dates: string[] = [];

  for (let offset = lookbackDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - offset);
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}

function linearForecast(
  values: number[],
  horizonDays: number,
) {
  if (values.length === 0) {
    return {
      projectedDaily: 0,
      forecasts: Array.from(
        { length: horizonDays },
        () => 0,
      ),
    };
  }

  const n = values.length;
  const meanX = (n - 1) / 2;
  const meanY =
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / n;

  let numerator = 0;
  let denominator = 0;

  values.forEach((value, index) => {
    const x = index - meanX;
    numerator +=
      x * (value - meanY);
    denominator += x * x;
  });

  const slope =
    denominator === 0
      ? 0
      : numerator / denominator;

  const intercept =
    meanY - slope * meanX;

  const forecasts = Array.from(
    { length: horizonDays },
    (_, index) =>
      Math.max(
        0,
        intercept +
          slope *
            (n + index),
      ),
  );

  const projectedDaily =
    forecasts.length > 0
      ? forecasts.reduce(
          (sum, value) =>
            sum + value,
          0,
        ) / forecasts.length
      : 0;

  return {
    projectedDaily,
    forecasts,
  };
}

function getConfidence(
  activeDays: number,
  observations: number,
): ForecastConfidence {
  if (
    observations <
    MINIMUM_OBSERVATIONS
  ) {
    return "INSUFFICIENT_DATA";
  }

  if (
    activeDays >= 21 &&
    observations >= 25
  ) {
    return "HIGH";
  }

  if (
    activeDays >= 14 &&
    observations >= 18
  ) {
    return "MEDIUM";
  }

  return "LOW";
}

function getTrend(
  historicalAverage: number,
  forecastAverage: number,
): ForecastTrend {
  if (historicalAverage === 0) {
    return forecastAverage > 0
      ? "ACCELERATING"
      : "STABLE";
  }

  const change =
    (forecastAverage -
      historicalAverage) /
    historicalAverage;

  if (change >= 0.05) {
    return "ACCELERATING";
  }

  if (change <= -0.05) {
    return "DECLINING";
  }

  return "STABLE";
}

export const forecastingIntelligenceService = {
  async getForecastingIntelligence(
    businessId: string,
    options?: {
      lookbackDays?: number;
      horizonDays?: number;
    },
  ): Promise<ForecastingIntelligence> {
    if (!businessId) {
      throw new Error(
        "Business ID is required.",
      );
    }

    await requireForecasting(
      businessId,
    );

    const lookbackDays = Math.max(
      7,
      Math.min(
        options?.lookbackDays ??
          DEFAULT_LOOKBACK_DAYS,
        90,
      ),
    );

    const horizonDays = Math.max(
      1,
      Math.min(
        options?.horizonDays ??
          DEFAULT_HORIZON_DAYS,
        30,
      ),
    );

    const now = new Date();
    const since = new Date(now);

    since.setDate(
      since.getDate() -
        (lookbackDays - 1),
    );
    since.setHours(0, 0, 0, 0);

    const sales =
      await prisma.sale.findMany({
        where: {
          businessId,
          status: "COMPLETED",
          createdAt: {
            gte: since,
          },
        },
        select: {
          currency: true,
          totalAmount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    const dates = buildDailyDates(
      now,
      lookbackDays,
    );

    const byCurrency =
      new Map<
        string,
        {
          revenue: Map<
            string,
            number
          >;
          sales: Map<
            string,
            number
          >;
        }
      >();

    for (const sale of sales) {
      const currency =
        sale.currency;

      if (
        !byCurrency.has(
          currency,
        )
      ) {
        byCurrency.set(
          currency,
          {
            revenue: new Map(),
            sales: new Map(),
          },
        );
      }

      const bucket =
        byCurrency.get(
          currency,
        )!;

      const date =
        sale.createdAt
          .toISOString()
          .slice(0, 10);

      bucket.revenue.set(
        date,
        (bucket.revenue.get(
          date,
        ) ?? 0) +
          toNumber(
            sale.totalAmount,
          ),
      );

      bucket.sales.set(
        date,
        (bucket.sales.get(
          date,
        ) ?? 0) + 1,
      );
    }

    const series: ForecastSeries[] =
      Array.from(
        byCurrency.entries(),
      )
        .sort(([a], [b]) =>
          a.localeCompare(b),
        )
        .map(
          ([
            currency,
            bucket,
          ]) => {
            const revenueValues =
              dates.map(
                (date) =>
                  bucket.revenue.get(
                    date,
                  ) ?? 0,
              );

            const salesValues =
              dates.map(
                (date) =>
                  bucket.sales.get(
                    date,
                  ) ?? 0,
              );

            const activeDays =
              revenueValues.filter(
                (value) =>
                  value > 0,
              ).length;

            const historicalRevenue =
              revenueValues.reduce(
                (sum, value) =>
                  sum + value,
                0,
              );

            const historicalSales =
              salesValues.reduce(
                (sum, value) =>
                  sum + value,
                0,
              );

            const averageDailyRevenue =
              historicalRevenue /
              lookbackDays;

            const averageDailySales =
              historicalSales /
              lookbackDays;

            const revenueForecast =
              linearForecast(
                revenueValues,
                horizonDays,
              );

            const salesForecast =
              linearForecast(
                salesValues,
                horizonDays,
              );

            const confidence =
              getConfidence(
                activeDays,
                lookbackDays,
              );

            const forecastDailyRevenue =
              confidence ===
              "INSUFFICIENT_DATA"
                ? 0
                : revenueForecast.projectedDaily;

            const forecastDailySales =
              confidence ===
              "INSUFFICIENT_DATA"
                ? 0
                : salesForecast.projectedDaily;

            const projectedRevenue =
              confidence ===
              "INSUFFICIENT_DATA"
                ? 0
                : revenueForecast.forecasts.reduce(
                    (sum, value) =>
                      sum + value,
                    0,
                  );

            const projectedSales =
              confidence ===
              "INSUFFICIENT_DATA"
                ? 0
                : salesForecast.forecasts.reduce(
                    (sum, value) =>
                      sum + value,
                    0,
                  );

            const dailyForecast =
              Array.from(
                {
                  length:
                    horizonDays,
                },
                (_, index) => {
                  const date =
                    new Date(now);

                  date.setDate(
                    date.getDate() +
                      index +
                      1,
                  );

                  return {
                    date: date
                      .toISOString()
                      .slice(
                        0,
                        10,
                      ),
                    revenue:
                      round(
                        revenueForecast
                          .forecasts[
                          index
                        ] ?? 0,
                      ),
                    sales: round(
                      salesForecast
                        .forecasts[
                        index
                      ] ?? 0,
                    ),
                  };
                },
              );

            return {
              currency,
              observations:
                lookbackDays,
              activeDays,
              historicalRevenue:
                round(
                  historicalRevenue,
                ),
              averageDailyRevenue:
                round(
                  averageDailyRevenue,
                ),
              forecastDailyRevenue:
                round(
                  forecastDailyRevenue,
                ),
              projectedRevenue:
                round(
                  projectedRevenue,
                ),
              historicalSales,
              averageDailySales:
                round(
                  averageDailySales,
                ),
              forecastDailySales:
                round(
                  forecastDailySales,
                ),
              projectedSales:
                round(
                  projectedSales,
                ),
              trend: getTrend(
                averageDailyRevenue,
                forecastDailyRevenue,
              ),
              confidence,
              dailyForecast,
            };
          },
        );

    return {
      businessId,
      generatedAt:
        new Date().toISOString(),
      lookbackDays,
      horizonDays,
      series,
      methodology: {
        revenueMetric:
          "Completed sale totalAmount.",
        salesMetric:
          "Count of completed sales.",
        baseline:
          `${lookbackDays} calendar days of historical completed sales.`,
        model:
          "Ordinary least-squares linear trend applied independently to each currency.",
        currencyHandling:
          "Each currency is forecast independently; currencies are never combined.",
        minimumDataRequirement:
  `${MINIMUM_OBSERVATIONS} calendar observations are required for a forecast. Less data is reported as insufficient.`,
        limitation:
          "This is a directional statistical forecast, not a guarantee. It does not yet model seasonality, promotions, holidays, supplier lead times, or external market factors.",
      },
    };
  },
};
