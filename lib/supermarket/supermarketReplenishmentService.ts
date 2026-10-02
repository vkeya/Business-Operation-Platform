import {
  supermarketStockService,
  type SupermarketStockItem,
} from "@/lib/supermarket/supermarketStockService";

export type SupermarketReplenishmentAction =
  | "ORDER_NOW"
  | "REORDER_SOON"
  | "MONITOR"
  | "NO_ACTION";

export type SupermarketReplenishmentUrgency =
  | "URGENT"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "NONE";

export interface SupermarketReplenishmentRecommendation {
  productId: string;
  name: string;
  sku: string;
  barcode: string | null;
  unit: string;

  currentStock: number;
  reservedStock: number;
  availableStock: number;

  dailySalesVelocity: number;
  salesQuantity: number;
  daysOfStockRemaining: number | null;

  reorderLevel: number | null;
  minimumStock: number | null;

  safetyStock: number;
  targetStock: number;
  recommendedOrderQuantity: number;

  averageCost: number;
  estimatedPurchaseCost: number;
  currency: string;

  action: SupermarketReplenishmentAction;
  urgency: SupermarketReplenishmentUrgency;
  reason: string;
}

export interface SupermarketReplenishmentSummary {
  businessId: string;
  lookbackDays: number;

  totalProducts: number;
  productsRequiringReplenishment: number;
  urgentProducts: number;
  highPriorityProducts: number;

  totalRecommendedUnits: number;
  estimatedPurchaseCost: number;

  recommendations: SupermarketReplenishmentRecommendation[];
}

const DEFAULT_LOOKBACK_DAYS = 30;

/**
 * Number of days of expected demand that we want to keep available.
 *
 * This is deliberately conservative for the first intelligence layer.
 * Supplier lead-time intelligence can be introduced later without changing
 * the public recommendation contract.
 */
const DEFAULT_TARGET_COVERAGE_DAYS = 30;

/**
 * Safety-stock multiplier.
 *
 * 25% gives the business a buffer against normal demand variation while
 * avoiding unnecessarily aggressive purchasing.
 */
const SAFETY_STOCK_RATE = 0.25;

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function ceilQuantity(value: number) {
  if (value <= 0) {
    return 0;
  }

  return Math.ceil(value);
}

function calculateSafetyStock(
  dailySalesVelocity: number,
  minimumStock: number | null,
) {
  const velocitySafetyStock =
    dailySalesVelocity *
    DEFAULT_TARGET_COVERAGE_DAYS *
    SAFETY_STOCK_RATE;

  return Math.max(
    velocitySafetyStock,
    minimumStock ?? 0,
  );
}

function calculateTargetStock(
  item: SupermarketStockItem,
) {
  const demandCoverage =
    item.dailySalesVelocity *
    DEFAULT_TARGET_COVERAGE_DAYS;

  const safetyStock =
    calculateSafetyStock(
      item.dailySalesVelocity,
      item.minimumStock,
    );

  const reorderFloor =
    item.reorderLevel ?? 0;

  return Math.max(
    demandCoverage + safetyStock,
    reorderFloor + safetyStock,
    item.minimumStock ?? 0,
  );
}

function getAction(
  item: SupermarketStockItem,
): {
  action: SupermarketReplenishmentAction;
  urgency: SupermarketReplenishmentUrgency;
  reason: string;
} {
  if (item.risk === "OUT_OF_STOCK") {
    return {
      action: "ORDER_NOW",
      urgency: "URGENT",
      reason:
        "The product is out of stock and requires immediate replenishment.",
    };
  }

  if (item.risk === "CRITICAL") {
    return {
      action: "ORDER_NOW",
      urgency: "URGENT",
      reason:
        "Available stock is at or below the minimum stock level.",
    };
  }

  if (
    item.daysOfStockRemaining !== null &&
    item.daysOfStockRemaining <= 7
  ) {
    return {
      action: "ORDER_NOW",
      urgency: "URGENT",
      reason:
        "Current sales velocity indicates that stock may run out within 7 days.",
    };
  }

  if (
    item.daysOfStockRemaining !== null &&
    item.daysOfStockRemaining <= 14
  ) {
    return {
      action: "ORDER_NOW",
      urgency: "HIGH",
      reason:
        "Current sales velocity indicates that stock may run out within 14 days.",
    };
  }

  if (item.risk === "LOW") {
    return {
      action: "REORDER_SOON",
      urgency: "HIGH",
      reason:
        "Available stock has reached the configured reorder level.",
    };
  }

  if (
    item.daysOfStockRemaining !== null &&
    item.daysOfStockRemaining <= 30
  ) {
    return {
      action: "REORDER_SOON",
      urgency: "MEDIUM",
      reason:
        "Stock coverage is below the recommended replenishment horizon.",
    };
  }

  if (item.risk === "OVERSTOCKED") {
    return {
      action: "NO_ACTION",
      urgency: "NONE",
      reason:
        "Current stock is significantly above expected demand.",
    };
  }

  return {
    action: "MONITOR",
    urgency: "LOW",
    reason:
      "Current stock is healthy and does not require immediate replenishment.",
  };
}

function buildRecommendation(
  item: SupermarketStockItem,
): SupermarketReplenishmentRecommendation {
  const safetyStock =
    calculateSafetyStock(
      item.dailySalesVelocity,
      item.minimumStock,
    );

  const targetStock =
    calculateTargetStock(item);

  const rawOrderQuantity =
    targetStock - item.availableStock;

  const recommendedOrderQuantity =
    ceilQuantity(rawOrderQuantity);

  const estimatedPurchaseCost =
    recommendedOrderQuantity *
    item.averageCost;

  const decision =
    getAction(item);

  const action =
    recommendedOrderQuantity > 0 &&
    decision.action !== "NO_ACTION"
      ? decision.action
      : decision.action === "NO_ACTION"
        ? "NO_ACTION"
        : "MONITOR";

  const urgency =
    recommendedOrderQuantity > 0
      ? decision.urgency
      : "NONE";

  return {
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    barcode: item.barcode,
    unit: item.unit,

    currentStock: round(item.currentStock),
    reservedStock: round(item.reservedStock),
    availableStock: round(item.availableStock),

    dailySalesVelocity:
      round(item.dailySalesVelocity),
    salesQuantity: round(item.salesQuantity),
    daysOfStockRemaining:
      item.daysOfStockRemaining === null
        ? null
        : round(item.daysOfStockRemaining),

    reorderLevel:
      item.reorderLevel === null
        ? null
        : round(item.reorderLevel),

    minimumStock:
      item.minimumStock === null
        ? null
        : round(item.minimumStock),

    safetyStock: round(safetyStock),
    targetStock: round(targetStock),
    recommendedOrderQuantity,

    averageCost: round(item.averageCost),
    estimatedPurchaseCost:
      round(estimatedPurchaseCost),
    currency: item.currency,

    action,
    urgency,
    reason: decision.reason,
  };
}

export const supermarketReplenishmentService = {
  async getReplenishmentIntelligence(
    businessId: string,
    options?: {
      warehouseId?: string;
      lookbackDays?: number;
      productId?: string;
      includeHealthy?: boolean;
    },
  ): Promise<SupermarketReplenishmentSummary> {
    if (!businessId) {
      throw new Error("Business ID is required.");
    }

    const lookbackDays = Math.max(
      1,
      Math.min(
        options?.lookbackDays ??
          DEFAULT_LOOKBACK_DAYS,
        365,
      ),
    );

    const stock =
      await supermarketStockService.getStockIntelligence(
        businessId,
        {
          warehouseId:
            options?.warehouseId,
          lookbackDays,
          productId:
            options?.productId,
        },
      );

    const recommendations =
      stock.items
        .map(buildRecommendation)
        .filter((item) => {
          if (options?.includeHealthy) {
            return true;
          }

          return (
            item.action !== "MONITOR" ||
            item.recommendedOrderQuantity > 0
          );
        })
        .sort((a, b) => {
          const urgencyRank: Record<
            SupermarketReplenishmentUrgency,
            number
          > = {
            URGENT: 0,
            HIGH: 1,
            MEDIUM: 2,
            LOW: 3,
            NONE: 4,
          };

          const urgencyDifference =
            urgencyRank[a.urgency] -
            urgencyRank[b.urgency];

          if (urgencyDifference !== 0) {
            return urgencyDifference;
          }

          return (
            a.daysOfStockRemaining ??
            Number.POSITIVE_INFINITY
          ) -
            (
              b.daysOfStockRemaining ??
              Number.POSITIVE_INFINITY
            );
        });

    const requiringReplenishment =
      recommendations.filter(
        (item) =>
          item.recommendedOrderQuantity > 0 &&
          item.action !== "NO_ACTION",
      );

    const urgentProducts =
      requiringReplenishment.filter(
        (item) => item.urgency === "URGENT",
      ).length;

    const highPriorityProducts =
      requiringReplenishment.filter(
        (item) => item.urgency === "HIGH",
      ).length;

    const totalRecommendedUnits =
      requiringReplenishment.reduce(
        (total, item) =>
          total +
          item.recommendedOrderQuantity,
        0,
      );

    const estimatedPurchaseCost =
      requiringReplenishment.reduce(
        (total, item) =>
          total +
          item.estimatedPurchaseCost,
        0,
      );

    return {
      businessId,
      lookbackDays,

      totalProducts:
        stock.totalProducts,

      productsRequiringReplenishment:
        requiringReplenishment.length,

      urgentProducts,
      highPriorityProducts,

      totalRecommendedUnits,
      estimatedPurchaseCost:
        round(estimatedPurchaseCost),

      recommendations,
    };
  },
};
