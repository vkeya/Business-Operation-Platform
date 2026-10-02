import { prisma } from "@/lib/database/prisma";

const DEFAULT_LOOKBACK_DAYS = 30;
const MIN_VELOCITY_FOR_FAST_MOVER = 5;
const MAX_VELOCITY_FOR_SLOW_MOVER = 0.25;
const ACCELERATION_THRESHOLD = 0.2;

export type SupermarketDemandTrend =
  | "ACCELERATING"
  | "DECLINING"
  | "STABLE"
  | "DORMANT";

export type SupermarketDemandClassification =
  | "FAST_MOVER"
  | "SLOW_MOVER"
  | "DORMANT"
  | "CONSISTENT";

export interface SupermarketDemandItem {
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

  trend: SupermarketDemandTrend;
  classification: SupermarketDemandClassification;

  recentDays: number;
  previousDays: number;
}

export interface SupermarketDemandSummary {
  businessId: string;

  recentDays: number;
  previousDays: number;

  totalProducts: number;
  productsWithRecentSales: number;
  acceleratingProducts: number;
  decliningProducts: number;
  fastMovers: number;
  slowMovers: number;
  dormantProducts: number;
  stableProducts: number;

  items: SupermarketDemandItem[];
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
}): SupermarketDemandTrend {
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

  if (recentSales > 0 && previousSales === 0) {
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

  if (change >= ACCELERATION_THRESHOLD) {
    return "ACCELERATING";
  }

  if (change <= -ACCELERATION_THRESHOLD) {
    return "DECLINING";
  }

  return "STABLE";
}

function getClassification(
  recentVelocity: number,
  recentSales: number,
): SupermarketDemandClassification {
  if (recentSales === 0) {
    return "DORMANT";
  }

  if (
    recentVelocity >=
    MIN_VELOCITY_FOR_FAST_MOVER
  ) {
    return "FAST_MOVER";
  }

  if (
    recentVelocity <=
    MAX_VELOCITY_FOR_SLOW_MOVER
  ) {
    return "SLOW_MOVER";
  }

  return "CONSISTENT";
}

export const supermarketDemandService = {
  async getDemandIntelligence(
    businessId: string,
    options?: {
      warehouseId?: string;
      lookbackDays?: number;
      productId?: string;
    },
  ): Promise<SupermarketDemandSummary> {
    if (!businessId) {
      throw new Error("Business ID is required.");
    }

    const recentDays = Math.max(
      1,
      Math.min(
        options?.lookbackDays ??
          DEFAULT_LOOKBACK_DAYS,
        365,
      ),
    );

    const previousDays = recentDays;

    const now = new Date();

    const recentSince = new Date(now);
    recentSince.setDate(
      recentSince.getDate() - recentDays,
    );

    const previousSince = new Date(
      recentSince,
    );

    previousSince.setDate(
      previousSince.getDate() - previousDays,
    );

    const products =
      await prisma.product.findMany({
        where: {
          businessId,
          ...(options?.productId
            ? {
                id: options.productId,
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
        recentDays,
        previousDays,
        totalProducts: 0,
        productsWithRecentSales: 0,
        acceleratingProducts: 0,
        decliningProducts: 0,
        fastMovers: 0,
        slowMovers: 0,
        dormantProducts: 0,
        stableProducts: 0,
        items: [],
      };
    }

    const productIds =
      products.map((product) => product.id);

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

    const items =
      products.map((product) => {
        const recentSalesQuantity =
          recentSales.get(product.id) ?? 0;

        const previousSalesQuantity =
          previousSales.get(product.id) ?? 0;

        const recentDailyVelocity =
          recentSalesQuantity /
          recentDays;

        const previousDailyVelocity =
          previousSalesQuantity /
          previousDays;

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

        const classification =
          getClassification(
            recentDailyVelocity,
            recentSalesQuantity,
          );

        return {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          unit: product.unit,

          recentSalesQuantity:
            round(recentSalesQuantity),
          previousSalesQuantity:
            round(previousSalesQuantity),

          recentDailyVelocity:
            round(recentDailyVelocity),
          previousDailyVelocity:
            round(previousDailyVelocity),

          velocityChange:
            round(velocityChange),

          velocityChangePercent:
            velocityChangePercent === null
              ? null
              : round(
                  velocityChangePercent,
                ),

          trend,
          classification,

          recentDays,
          previousDays,
        };
      });

    items.sort((a, b) => {
      const trendRank: Record<
        SupermarketDemandTrend,
        number
      > = {
        ACCELERATING: 0,
        DECLINING: 1,
        STABLE: 2,
        DORMANT: 3,
      };

      const rankDifference =
        trendRank[a.trend] -
        trendRank[b.trend];

      if (rankDifference !== 0) {
        return rankDifference;
      }

      return (
        b.recentDailyVelocity -
        a.recentDailyVelocity
      );
    });

    return {
      businessId,
      recentDays,
      previousDays,

      totalProducts: products.length,

      productsWithRecentSales:
        items.filter(
          (item) =>
            item.recentSalesQuantity > 0,
        ).length,

      acceleratingProducts:
        items.filter(
          (item) =>
            item.trend === "ACCELERATING",
        ).length,

      decliningProducts:
        items.filter(
          (item) =>
            item.trend === "DECLINING",
        ).length,

      fastMovers:
        items.filter(
          (item) =>
            item.classification ===
            "FAST_MOVER",
        ).length,

      slowMovers:
        items.filter(
          (item) =>
            item.classification ===
            "SLOW_MOVER",
        ).length,

      dormantProducts:
        items.filter(
          (item) =>
            item.classification ===
            "DORMANT",
        ).length,

      stableProducts:
        items.filter(
          (item) =>
            item.trend === "STABLE",
        ).length,

      items,
    };
  },
};
