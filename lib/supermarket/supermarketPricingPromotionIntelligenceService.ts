import { prisma } from "@/lib/database/prisma";

const DEFAULT_LOOKBACK_DAYS = 30;

export type PricingPromotionAction =
  | "HOLD_PRICE"
  | "PROMOTE"
  | "REVIEW_PRICE"
  | "CLEARANCE"
  | "PROTECT_MARGIN";

export type PricingPromotionRisk =
  | "LOW_DEMAND"
  | "EXCESS_STOCK"
  | "MARGIN_PRESSURE"
  | "HEALTHY"
  | "STRONG_DEMAND";

export interface PricingPromotionItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string | null;
  currency: string;

  costPrice: number;
  currentPrice: number;

  wholesalePrice: number | null;
  minimumPrice: number | null;

  averageSellingPrice: number;
  salesQuantity: number;
  salesRevenue: number;

  dailySalesVelocity: number;

  currentStock: number;
  stockValue: number;

  grossMarginAmount: number;
  grossMarginPercent: number;

  daysOfStockRemaining: number | null;

  risk: PricingPromotionRisk;
  action: PricingPromotionAction;
  reason: string;
}

export interface PricingPromotionSummary {
  businessId: string;
  lookbackDays: number;

  totalProducts: number;

  holdPriceCount: number;
  promotionCount: number;
  reviewPriceCount: number;
  clearanceCount: number;
  protectMarginCount: number;

  totalSalesRevenue: number;
  totalStockValue: number;

  items: PricingPromotionItem[];
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getAction(input: {
  dailySalesVelocity: number;
  currentStock: number;
  daysOfStockRemaining: number | null;
  grossMarginPercent: number;
  minimumStock: number | null;
  reorderLevel: number | null;
}): {
  action: PricingPromotionAction;
  risk: PricingPromotionRisk;
  reason: string;
} {
  const {
    dailySalesVelocity,
    currentStock,
    daysOfStockRemaining,
    grossMarginPercent,
    minimumStock,
    reorderLevel,
  } = input;

  if (
    currentStock > 0 &&
    daysOfStockRemaining !== null &&
    daysOfStockRemaining > 90 &&
    dailySalesVelocity > 0
  ) {
    return {
      action: "CLEARANCE",
      risk: "EXCESS_STOCK",
      reason:
        "Stock coverage is above 90 days. Consider a controlled clearance or promotion.",
    };
  }

  if (
    currentStock > 0 &&
    dailySalesVelocity === 0
  ) {
    return {
      action: "PROMOTE",
      risk: "LOW_DEMAND",
      reason:
        "There has been no recorded sales movement during the analysis period.",
    };
  }

  if (
    grossMarginPercent < 10 &&
    dailySalesVelocity > 0
  ) {
    return {
      action: "PROTECT_MARGIN",
      risk: "MARGIN_PRESSURE",
      reason:
        "The product is selling but gross margin is below 10%. Review discounting and pricing.",
    };
  }

  if (
    minimumStock !== null &&
    currentStock <= minimumStock &&
    dailySalesVelocity > 0
  ) {
    return {
      action: "HOLD_PRICE",
      risk: "STRONG_DEMAND",
      reason:
        "Stock is at or below the minimum level while the product continues to sell.",
    };
  }

  if (
    reorderLevel !== null &&
    currentStock <= reorderLevel &&
    dailySalesVelocity > 0
  ) {
    return {
      action: "HOLD_PRICE",
      risk: "STRONG_DEMAND",
      reason:
        "Stock is at or below the reorder level with active demand.",
    };
  }

  if (
    dailySalesVelocity > 0 &&
    daysOfStockRemaining !== null &&
    daysOfStockRemaining <= 14
  ) {
    return {
      action: "HOLD_PRICE",
      risk: "STRONG_DEMAND",
      reason:
        "The product has strong movement and less than two weeks of projected stock coverage.",
    };
  }

  if (dailySalesVelocity > 0) {
    return {
      action: "HOLD_PRICE",
      risk: "HEALTHY",
      reason:
        "Sales movement and stock coverage are currently within a normal range.",
    };
  }

  return {
    action: "REVIEW_PRICE",
    risk: "LOW_DEMAND",
    reason:
      "Sales activity is insufficient to justify an aggressive pricing action.",
  };
}

export const supermarketPricingPromotionIntelligenceService = {
  async getPricingPromotionIntelligence(
    businessId: string,
    options?: {
      warehouseId?: string;
      lookbackDays?: number;
      productId?: string;
    },
  ): Promise<PricingPromotionSummary> {
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

    const since = new Date();

    since.setDate(
      since.getDate() - lookbackDays,
    );

    const productWhere = {
      businessId,
      type: "PRODUCT" as const,
      ...(options?.productId
        ? {
            id: options.productId,
          }
        : {}),
    };

    const products =
      await prisma.product.findMany({
        where: productWhere,
        select: {
          id: true,
          name: true,
          sku: true,
          barcode: true,
          costPrice: true,
          sellingPrice: true,
          currency: true,
          minimumStock: true,
          reorderLevel: true,
          prices: {
            where: {
              isActive: true,
            },
            select: {
              type: true,
              price: true,
              currency: true,
            },
          },
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
        holdPriceCount: 0,
        promotionCount: 0,
        reviewPriceCount: 0,
        clearanceCount: 0,
        protectMarginCount: 0,
        totalSalesRevenue: 0,
        totalStockValue: 0,
        items: [],
      };
    }

    const productIds = products.map(
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
              gte: since,
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
          unitPrice: true,
          discountAmount: true,
          totalAmount: true,
        },
      });

    const balances =
      await prisma.inventoryBalance.findMany({
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
          averageCost: true,
        },
      });

    const salesByProduct = new Map<
      string,
      {
        quantity: number;
        revenue: number;
        weightedPrice: number;
      }
    >();

    for (const item of saleItems) {
      const quantity =
        item.quantity.toNumber();

      const unitPrice =
        item.unitPrice.toNumber();

      const revenue =
        item.totalAmount.toNumber();

      const existing =
        salesByProduct.get(
          item.productId,
        );

      if (existing) {
        existing.quantity += quantity;
        existing.revenue += revenue;
        existing.weightedPrice +=
          unitPrice * quantity;
      } else {
        salesByProduct.set(
          item.productId,
          {
            quantity,
            revenue,
            weightedPrice:
              unitPrice * quantity,
          },
        );
      }
    }

    const stockByProduct = new Map<
      string,
      {
        quantity: number;
        reservedQuantity: number;
        averageCost: number;
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

      const averageCost =
        balance.averageCost.toNumber();

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
            averageCost,
          },
        );
      }
    }

    const items: PricingPromotionItem[] =
      products.map((product) => {
        const sales =
          salesByProduct.get(product.id);

        const stock =
          stockByProduct.get(product.id);

        const salesQuantity =
          sales?.quantity ?? 0;

        const salesRevenue =
          sales?.revenue ?? 0;

        const averageSellingPrice =
          salesQuantity > 0
            ? (sales?.weightedPrice ?? 0) /
              salesQuantity
            : product.sellingPrice.toNumber();

        const dailySalesVelocity =
          salesQuantity / lookbackDays;

        const currentStock =
          Math.max(
            0,
            (stock?.quantity ?? 0) -
              (stock?.reservedQuantity ?? 0),
          );

        const averageCost =
          stock?.averageCost ??
          product.costPrice.toNumber();

        const stockValue =
          currentStock * averageCost;

        const grossMarginAmount =
          averageSellingPrice -
          product.costPrice.toNumber();

        const grossMarginPercent =
          averageSellingPrice > 0
            ? (grossMarginAmount /
                averageSellingPrice) *
              100
            : 0;

        const daysOfStockRemaining =
          dailySalesVelocity > 0
            ? currentStock /
              dailySalesVelocity
            : null;

        const wholesalePrice =
          product.prices.find(
            (price) =>
              price.type === "WHOLESALE",
          )?.price.toNumber() ?? null;

        const minimumPrice =
          product.prices.find(
            (price) =>
              price.type === "MINIMUM",
          )?.price.toNumber() ?? null;

        const decision = getAction({
          dailySalesVelocity,
          currentStock,
          daysOfStockRemaining,
          grossMarginPercent,
          minimumStock:
            product.minimumStock?.toNumber() ??
            null,
          reorderLevel:
            product.reorderLevel?.toNumber() ??
            null,
        });

        return {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          currency: product.currency,

          costPrice: round(
            product.costPrice.toNumber(),
          ),

          currentPrice: round(
            product.sellingPrice.toNumber(),
          ),

          wholesalePrice:
            wholesalePrice === null
              ? null
              : round(wholesalePrice),

          minimumPrice:
            minimumPrice === null
              ? null
              : round(minimumPrice),

          averageSellingPrice: round(
            averageSellingPrice,
          ),

          salesQuantity: round(
            salesQuantity,
          ),

          salesRevenue: round(
            salesRevenue,
          ),

          dailySalesVelocity: round(
            dailySalesVelocity,
          ),

          currentStock: round(
            currentStock,
          ),

          stockValue: round(
            stockValue,
          ),

          grossMarginAmount: round(
            grossMarginAmount,
          ),

          grossMarginPercent: round(
            grossMarginPercent,
          ),

          daysOfStockRemaining:
            daysOfStockRemaining === null
              ? null
              : round(
                  daysOfStockRemaining,
                ),

          risk: decision.risk,
          action: decision.action,
          reason: decision.reason,
        };
      });

    return {
      businessId,
      lookbackDays,
      totalProducts: items.length,

      holdPriceCount: items.filter(
        (item) =>
          item.action === "HOLD_PRICE",
      ).length,

      promotionCount: items.filter(
        (item) =>
          item.action === "PROMOTE",
      ).length,

      reviewPriceCount: items.filter(
        (item) =>
          item.action === "REVIEW_PRICE",
      ).length,

      clearanceCount: items.filter(
        (item) =>
          item.action === "CLEARANCE",
      ).length,

      protectMarginCount: items.filter(
        (item) =>
          item.action === "PROTECT_MARGIN",
      ).length,

      totalSalesRevenue: round(
        items.reduce(
          (sum, item) =>
            sum + item.salesRevenue,
          0,
        ),
      ),

      totalStockValue: round(
        items.reduce(
          (sum, item) =>
            sum + item.stockValue,
          0,
        ),
      ),

      items,
    };
  },
};