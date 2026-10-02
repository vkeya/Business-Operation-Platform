import { prisma } from "@/lib/database/prisma";

const DEFAULT_LOOKBACK_DAYS = 30;

export type SupermarketStockRisk =
  | "OUT_OF_STOCK"
  | "CRITICAL"
  | "LOW"
  | "HEALTHY"
  | "OVERSTOCKED";

export interface SupermarketStockItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string | null;
  unit: string;

  currentStock: number;
  reservedStock: number;
  availableStock: number;

  averageCost: number;
  stockValue: number;
  currency: string;

  reorderLevel: number | null;
  minimumStock: number | null;

  salesQuantity: number;
  dailySalesVelocity: number;
  daysOfStockRemaining: number | null;

  risk: SupermarketStockRisk;
}

export interface SupermarketStockSummary {
  businessId: string;
  lookbackDays: number;

  totalProducts: number;
  productsWithStock: number;
  outOfStockProducts: number;
  criticalProducts: number;
  lowStockProducts: number;
  healthyProducts: number;
  overstockedProducts: number;

  totalStockValue: number;

  items: SupermarketStockItem[];
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getRisk(input: {
  availableStock: number;
  dailySalesVelocity: number;
  reorderLevel: number | null;
  minimumStock: number | null;
}): SupermarketStockRisk {
  const {
    availableStock,
    dailySalesVelocity,
    reorderLevel,
    minimumStock,
  } = input;

  if (availableStock <= 0) {
    return "OUT_OF_STOCK";
  }

  if (
    minimumStock !== null &&
    availableStock <= minimumStock
  ) {
    return "CRITICAL";
  }

  if (
    reorderLevel !== null &&
    availableStock <= reorderLevel
  ) {
    return "LOW";
  }

  if (
    dailySalesVelocity > 0 &&
    availableStock / dailySalesVelocity > 90
  ) {
    return "OVERSTOCKED";
  }

  return "HEALTHY";
}

export const supermarketStockService = {
  async getStockIntelligence(
    businessId: string,
    options?: {
      warehouseId?: string;
      lookbackDays?: number;
      productId?: string;
    },
  ): Promise<SupermarketStockSummary> {
    if (!businessId) {
      throw new Error("Business ID is required.");
    }

    const lookbackDays = Math.max(
      1,
      Math.min(
        options?.lookbackDays ?? DEFAULT_LOOKBACK_DAYS,
        365,
      ),
    );

    const since = new Date();

    since.setDate(
      since.getDate() - lookbackDays,
    );

    const balanceWhere = {
      businessId,
      ...(options?.warehouseId
        ? {
            warehouseId:
              options.warehouseId,
          }
        : {}),
      ...(options?.productId
        ? {
            productId:
              options.productId,
          }
        : {}),
    };

    const balances =
      await prisma.inventoryBalance.findMany({
        where: balanceWhere,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              barcode: true,
              unit: true,
              minimumStock: true,
              reorderLevel: true,
              status: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

    const productIds = [
      ...new Set(
        balances.map(
          (balance) => balance.productId,
        ),
      ),
    ];

    if (productIds.length === 0) {
      return {
        businessId,
        lookbackDays,
        totalProducts: 0,
        productsWithStock: 0,
        outOfStockProducts: 0,
        criticalProducts: 0,
        lowStockProducts: 0,
        healthyProducts: 0,
        overstockedProducts: 0,
        totalStockValue: 0,
        items: [],
      };
    }

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
        },
      });

    const salesByProduct =
      new Map<string, number>();

    for (const item of saleItems) {
      const quantity =
        item.quantity.toNumber();

      salesByProduct.set(
        item.productId,
        (salesByProduct.get(
          item.productId,
        ) ?? 0) + quantity,
      );
    }

    const items: SupermarketStockItem[] =
      balances.map((balance) => {
        const currentStock =
          balance.quantity.toNumber();

        const reservedStock =
          balance.reservedQuantity.toNumber();

        const availableStock =
          Math.max(
            0,
            currentStock - reservedStock,
          );

        const averageCost =
          balance.averageCost.toNumber();

        const stockValue =
          availableStock * averageCost;

        const salesQuantity =
          salesByProduct.get(
            balance.productId,
          ) ?? 0;

        const dailySalesVelocity =
          salesQuantity / lookbackDays;

        const daysOfStockRemaining =
          dailySalesVelocity > 0
            ? availableStock /
              dailySalesVelocity
            : null;

        const reorderLevel =
          balance.product.reorderLevel?.toNumber() ??
          null;

        const minimumStock =
          balance.product.minimumStock?.toNumber() ??
          null;

        const risk = getRisk({
          availableStock,
          dailySalesVelocity,
          reorderLevel,
          minimumStock,
        });

        return {
          productId: balance.product.id,
          name: balance.product.name,
          sku: balance.product.sku,
          barcode: balance.product.barcode,
          unit: balance.product.unit,

          currentStock: round(
            currentStock,
          ),
          reservedStock: round(
            reservedStock,
          ),
          availableStock: round(
            availableStock,
          ),

          averageCost: round(
            averageCost,
          ),
          stockValue: round(
            stockValue,
          ),
          currency: balance.currency,

          reorderLevel:
            reorderLevel === null
              ? null
              : round(reorderLevel),

          minimumStock:
            minimumStock === null
              ? null
              : round(minimumStock),

          salesQuantity: round(
            salesQuantity,
          ),

          dailySalesVelocity: round(
            dailySalesVelocity,
            4,
          ),

          daysOfStockRemaining:
            daysOfStockRemaining === null
              ? null
              : round(
                  daysOfStockRemaining,
                  1,
                ),

          risk,
        };
      });

    const totalStockValue =
      items.reduce(
        (sum, item) =>
          sum + item.stockValue,
        0,
      );

    return {
      businessId,
      lookbackDays,

      totalProducts: items.length,

      productsWithStock:
        items.filter(
          (item) =>
            item.availableStock > 0,
        ).length,

      outOfStockProducts:
        items.filter(
          (item) =>
            item.risk ===
            "OUT_OF_STOCK",
        ).length,

      criticalProducts:
        items.filter(
          (item) =>
            item.risk === "CRITICAL",
        ).length,

      lowStockProducts:
        items.filter(
          (item) =>
            item.risk === "LOW",
        ).length,

      healthyProducts:
        items.filter(
          (item) =>
            item.risk === "HEALTHY",
        ).length,

      overstockedProducts:
        items.filter(
          (item) =>
            item.risk ===
            "OVERSTOCKED",
        ).length,

      totalStockValue:
        round(totalStockValue),

      items,
    };
  },

  async getProductStockIntelligence(
    businessId: string,
    productId: string,
    options?: {
      warehouseId?: string;
      lookbackDays?: number;
    },
  ) {
    const result =
      await this.getStockIntelligence(
        businessId,
        {
          ...options,
          productId,
        },
      );

    return (
      result.items[0] ?? null
    );
  },

  async getAtRiskStock(
    businessId: string,
    options?: {
      warehouseId?: string;
      lookbackDays?: number;
    },
  ) {
    const result =
      await this.getStockIntelligence(
        businessId,
        options,
      );

    return result.items.filter(
      (item) =>
        item.risk ===
          "OUT_OF_STOCK" ||
        item.risk === "CRITICAL" ||
        item.risk === "LOW",
    );
  },
};