import { prisma } from "@/lib/database/prisma";

const DEFAULT_LOOKBACK_DAYS = 30;

const FORECAST_HORIZONS = [7, 14, 30] as const;

export type SupermarketForecastTrend =
  | "ACCELERATING"
  | "DECLINING"
  | "STABLE"
  | "DORMANT";

export type SupermarketForecastConfidence =
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INSUFFICIENT_DATA";

export type SupermarketForecastAction =
  | "MONITOR"
  | "REPLENISH"
  | "URGENT_REPLENISH"
  | "REDUCE_STOCK"
  | "INSUFFICIENT_DATA";

export interface SupermarketForecastItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string | null;
  unit: string;

  recentSalesQuantity: number;
  previousSalesQuantity: number;

  recentDailyVelocity: number;
  previousDailyVelocity: number;

  velocityChange: number;
  velocityChangePercent: number | null;

  trend: SupermarketForecastTrend;

  forecastDailyVelocity: number;

  forecast7DayQuantity: number;
  forecast14DayQuantity: number;
  forecast30DayQuantity: number;

  currentStock: number;
  reservedStock: number;
  availableStock: number;

  stockCoverageDays: number | null;

  projectedStock7Days: number;
  projectedStock14Days: number;
  projectedStock30Days: number;

  projectedStockoutDays: number | null;

  confidence: SupermarketForecastConfidence;
  action: SupermarketForecastAction;
}

export interface SupermarketForecastSummary {
  businessId: string;
  lookbackDays: number;

  totalProducts: number;
  productsWithDemand: number;

  acceleratingProducts: number;
  decliningProducts: number;
  stableProducts: number;
  dormantProducts: number;

  highConfidenceForecasts: number;
  mediumConfidenceForecasts: number;
  lowConfidenceForecasts: number;
  insufficientDataForecasts: number;

  replenishmentProducts: number;
  urgentReplenishmentProducts: number;
  reductionProducts: number;

  items: SupermarketForecastItem[];
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getTrend(input: {
  recentVelocity: number;
  previousVelocity: number;
  recentSales: number;
  previousSales: number;
}): SupermarketForecastTrend {
  const {
    recentVelocity,
    previousVelocity,
    recentSales,
    previousSales,
  } = input;

  if (
    recentSales === 0 &&
    previousSales === 0
  ) {
    return "DORMANT";
  }

  if (
    recentSales > 0 &&
    previousSales === 0
  ) {
    return "ACCELERATING";
  }

  if (
    recentVelocity === 0 &&
    previousVelocity > 0
  ) {
    return "DECLINING";
  }

  if (previousVelocity === 0) {
    return "ACCELERATING";
  }

  const change =
    (recentVelocity - previousVelocity) /
    previousVelocity;

  if (change >= 0.2) {
    return "ACCELERATING";
  }

  if (change <= -0.2) {
    return "DECLINING";
  }

  return "STABLE";
}

function getForecastVelocity(input: {
  recentVelocity: number;
  previousVelocity: number;
  trend: SupermarketForecastTrend;
}): number {
  const {
    recentVelocity,
    previousVelocity,
    trend,
  } = input;

  if (trend === "DORMANT") {
    return 0;
  }

  if (
    trend === "ACCELERATING" &&
    previousVelocity > 0
  ) {
    return (
      recentVelocity * 0.7 +
      previousVelocity * 0.3
    );
  }

  if (
    trend === "DECLINING" &&
    previousVelocity > 0
  ) {
    return (
      recentVelocity * 0.7 +
      previousVelocity * 0.3
    );
  }

  return recentVelocity;
}

function getConfidence(input: {
  recentSales: number;
  previousSales: number;
  recentVelocity: number;
  previousVelocity: number;
}): SupermarketForecastConfidence {
  const {
    recentSales,
    previousSales,
    recentVelocity,
    previousVelocity,
  } = input;

  if (
    recentSales === 0 &&
    previousSales === 0
  ) {
    return "INSUFFICIENT_DATA";
  }

  if (recentSales < 3) {
    return "LOW";
  }

  if (
    previousSales === 0 &&
    recentSales >= 3
  ) {
    return "MEDIUM";
  }

  const averageVelocity =
    (recentVelocity +
      previousVelocity) /
    2;

  if (averageVelocity === 0) {
    return "INSUFFICIENT_DATA";
  }

  const difference =
    Math.abs(
      recentVelocity -
        previousVelocity,
    ) / averageVelocity;

  if (
    recentSales >= 20 &&
    previousSales >= 20 &&
    difference <= 0.2
  ) {
    return "HIGH";
  }

  if (
    recentSales >= 10 &&
    previousSales >= 10
  ) {
    return "MEDIUM";
  }

  return "LOW";
}

function getAction(input: {
  availableStock: number;
  forecastDailyVelocity: number;
  stockCoverageDays: number | null;
  confidence: SupermarketForecastConfidence;
}): SupermarketForecastAction {
  const {
    availableStock,
    forecastDailyVelocity,
    stockCoverageDays,
    confidence,
  } = input;

  if (
    confidence === "INSUFFICIENT_DATA"
  ) {
    return "INSUFFICIENT_DATA";
  }

  if (forecastDailyVelocity === 0) {
    if (availableStock > 0) {
      return "REDUCE_STOCK";
    }

    return "MONITOR";
  }

  if (
    stockCoverageDays !== null &&
    stockCoverageDays <= 7
  ) {
    return "URGENT_REPLENISH";
  }

  if (
    stockCoverageDays !== null &&
    stockCoverageDays <= 14
  ) {
    return "REPLENISH";
  }

  return "MONITOR";
}

export const supermarketForecastingIntelligenceService =
  {
    async getForecastingIntelligence(
      businessId: string,
      options?: {
        warehouseId?: string;
        lookbackDays?: number;
        productId?: string;
      },
    ): Promise<SupermarketForecastSummary> {
      if (!businessId) {
        throw new Error(
          "Business ID is required.",
        );
      }

      const lookbackDays = Math.max(
        1,
        Math.min(
          options?.lookbackDays ??
            DEFAULT_LOOKBACK_DAYS,
          365,
        ),
      );

      const now = new Date();

      const recentSince = new Date(now);

      recentSince.setDate(
        recentSince.getDate() -
          lookbackDays,
      );

      const previousSince =
        new Date(recentSince);

      previousSince.setDate(
        previousSince.getDate() -
          lookbackDays,
      );

      const products =
        await prisma.product.findMany({
          where: {
            businessId,
            ...(options?.productId
              ? {
                  id:
                    options.productId,
                }
              : {}),
          },
          select: {
            id: true,
            name: true,
            sku: true,
            barcode: true,
            unit: true,
          },
          orderBy: {
            name: "asc",
          },
        });

      if (products.length === 0) {
        return {
          businessId,
          lookbackDays,

          totalProducts: 0,
          productsWithDemand: 0,

          acceleratingProducts: 0,
          decliningProducts: 0,
          stableProducts: 0,
          dormantProducts: 0,

          highConfidenceForecasts: 0,
          mediumConfidenceForecasts: 0,
          lowConfidenceForecasts: 0,
          insufficientDataForecasts: 0,

          replenishmentProducts: 0,
          urgentReplenishmentProducts: 0,
          reductionProducts: 0,

          items: [],
        };
      }

      const productIds =
        products.map(
          (product) => product.id,
        );

      const saleItems =
        await prisma.saleItem.findMany({
          where: {
            productId: {
              in: productIds,
            },
            sale: {
              businessId,
              status: "COMPLETED",
              createdAt: {
                gte: previousSince,
              },
              ...(options?.warehouseId
                ? {
                    warehouseId:
                      options.warehouseId,
                  }
                : {}),
            },
          },
          select: {
            productId: true,
            quantity: true,
            sale: {
              select: {
                createdAt: true,
              },
            },
          },
        });

      const recentSales =
        new Map<string, number>();

      const previousSales =
        new Map<string, number>();

      for (const item of saleItems) {
        const quantity =
          item.quantity.toNumber();

        if (
          item.sale.createdAt >=
          recentSince
        ) {
          recentSales.set(
            item.productId,
            (recentSales.get(
              item.productId,
            ) ?? 0) + quantity,
          );
        } else {
          previousSales.set(
            item.productId,
            (previousSales.get(
              item.productId,
            ) ?? 0) + quantity,
          );
        }
      }

      const balances =
        await prisma.inventoryBalance.findMany(
          {
            where: {
              businessId,
              productId: {
                in: productIds,
              },
              ...(options?.warehouseId
                ? {
                    warehouseId:
                      options.warehouseId,
                  }
                : {}),
            },
            select: {
              productId: true,
              quantity: true,
              reservedQuantity: true,
            },
          },
        );

      const stockByProduct =
        new Map<
          string,
          {
            quantity: number;
            reservedQuantity: number;
          }
        >();

      for (const balance of balances) {
        const existing =
          stockByProduct.get(
            balance.productId,
          );

        const quantity =
          balance.quantity.toNumber();

        const reservedQuantity =
          balance.reservedQuantity.toNumber();

        if (existing) {
          existing.quantity += quantity;
          existing.reservedQuantity +=
            reservedQuantity;
        } else {
          stockByProduct.set(
            balance.productId,
            {
              quantity,
              reservedQuantity,
            },
          );
        }
      }

      const items =
        products.map((product) => {
          const recentSalesQuantity =
            recentSales.get(
              product.id,
            ) ?? 0;

          const previousSalesQuantity =
            previousSales.get(
              product.id,
            ) ?? 0;

          const recentDailyVelocity =
            recentSalesQuantity /
            lookbackDays;

          const previousDailyVelocity =
            previousSalesQuantity /
            lookbackDays;

          const velocityChange =
            recentDailyVelocity -
            previousDailyVelocity;

          const velocityChangePercent =
            previousDailyVelocity > 0
              ? (velocityChange /
                  previousDailyVelocity) *
                100
              : recentDailyVelocity > 0
                ? null
                : 0;

          const trend = getTrend({
            recentVelocity:
              recentDailyVelocity,
            previousVelocity:
              previousDailyVelocity,
            recentSales:
              recentSalesQuantity,
            previousSales:
              previousSalesQuantity,
          });

          const forecastDailyVelocity =
            getForecastVelocity({
              recentVelocity:
                recentDailyVelocity,
              previousVelocity:
                previousDailyVelocity,
              trend,
            });

          const confidence =
            getConfidence({
              recentSales:
                recentSalesQuantity,
              previousSales:
                previousSalesQuantity,
              recentVelocity:
                recentDailyVelocity,
              previousVelocity:
                previousDailyVelocity,
            });

          const stock =
            stockByProduct.get(
              product.id,
            );

          const currentStock =
            stock?.quantity ?? 0;

          const reservedStock =
            stock?.reservedQuantity ?? 0;

          const availableStock =
            Math.max(
              0,
              currentStock -
                reservedStock,
            );

          const stockCoverageDays =
            forecastDailyVelocity > 0
              ? availableStock /
                forecastDailyVelocity
              : null;

          const projectedStock7Days =
            Math.max(
              0,
              availableStock -
                forecastDailyVelocity *
                  7,
            );

          const projectedStock14Days =
            Math.max(
              0,
              availableStock -
                forecastDailyVelocity *
                  14,
            );

          const projectedStock30Days =
            Math.max(
              0,
              availableStock -
                forecastDailyVelocity *
                  30,
            );

          const projectedStockoutDays =
            forecastDailyVelocity > 0 &&
            availableStock > 0
              ? availableStock /
                forecastDailyVelocity
              : forecastDailyVelocity > 0
                ? 0
                : null;

          const action = getAction({
            availableStock,
            forecastDailyVelocity,
            stockCoverageDays,
            confidence,
          });

          return {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            unit: product.unit,

            recentSalesQuantity:
              round(
                recentSalesQuantity,
              ),

            previousSalesQuantity:
              round(
                previousSalesQuantity,
              ),

            recentDailyVelocity:
              round(
                recentDailyVelocity,
              ),

            previousDailyVelocity:
              round(
                previousDailyVelocity,
              ),

            velocityChange:
              round(velocityChange),

            velocityChangePercent:
              velocityChangePercent ===
              null
                ? null
                : round(
                    velocityChangePercent,
                  ),

            trend,

            forecastDailyVelocity:
              round(
                forecastDailyVelocity,
              ),

            forecast7DayQuantity:
              round(
                forecastDailyVelocity *
                  FORECAST_HORIZONS[0],
              ),

            forecast14DayQuantity:
              round(
                forecastDailyVelocity *
                  FORECAST_HORIZONS[1],
              ),

            forecast30DayQuantity:
              round(
                forecastDailyVelocity *
                  FORECAST_HORIZONS[2],
              ),

            currentStock:
              round(currentStock),

            reservedStock:
              round(reservedStock),

            availableStock:
              round(availableStock),

            stockCoverageDays:
              stockCoverageDays ===
              null
                ? null
                : round(
                    stockCoverageDays,
                  ),

            projectedStock7Days:
              round(
                projectedStock7Days,
              ),

            projectedStock14Days:
              round(
                projectedStock14Days,
              ),

            projectedStock30Days:
              round(
                projectedStock30Days,
              ),

            projectedStockoutDays:
              projectedStockoutDays ===
              null
                ? null
                : round(
                    projectedStockoutDays,
                  ),

            confidence,
            action,
          };
        });

      items.sort((a, b) => {
        const actionRank: Record<
          SupermarketForecastAction,
          number
        > = {
          URGENT_REPLENISH: 0,
          REPLENISH: 1,
          REDUCE_STOCK: 2,
          MONITOR: 3,
          INSUFFICIENT_DATA: 4,
        };

        const rankDifference =
          actionRank[a.action] -
          actionRank[b.action];

        if (rankDifference !== 0) {
          return rankDifference;
        }

        return (
          (b.forecastDailyVelocity ?? 0) -
          (a.forecastDailyVelocity ?? 0)
        );
      });

      return {
        businessId,
        lookbackDays,

        totalProducts: items.length,

        productsWithDemand:
          items.filter(
            (item) =>
              item.recentSalesQuantity >
                0 ||
              item.previousSalesQuantity >
                0,
          ).length,

        acceleratingProducts:
          items.filter(
            (item) =>
              item.trend ===
              "ACCELERATING",
          ).length,

        decliningProducts:
          items.filter(
            (item) =>
              item.trend ===
              "DECLINING",
          ).length,

        stableProducts:
          items.filter(
            (item) =>
              item.trend === "STABLE",
          ).length,

        dormantProducts:
          items.filter(
            (item) =>
              item.trend === "DORMANT",
          ).length,

        highConfidenceForecasts:
          items.filter(
            (item) =>
              item.confidence === "HIGH",
          ).length,

        mediumConfidenceForecasts:
          items.filter(
            (item) =>
              item.confidence === "MEDIUM",
          ).length,

        lowConfidenceForecasts:
          items.filter(
            (item) =>
              item.confidence === "LOW",
          ).length,

        insufficientDataForecasts:
          items.filter(
            (item) =>
              item.confidence ===
              "INSUFFICIENT_DATA",
          ).length,

        replenishmentProducts:
          items.filter(
            (item) =>
              item.action ===
              "REPLENISH",
          ).length,

        urgentReplenishmentProducts:
          items.filter(
            (item) =>
              item.action ===
              "URGENT_REPLENISH",
          ).length,

        reductionProducts:
          items.filter(
            (item) =>
              item.action ===
              "REDUCE_STOCK",
          ).length,

        items,
      };
    },
  };
