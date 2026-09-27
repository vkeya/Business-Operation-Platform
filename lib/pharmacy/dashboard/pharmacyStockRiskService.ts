import { prisma } from "@/lib/database/prisma";

export const pharmacyStockRiskService = {
  async getLowStockProducts(input: {
    businessId: string;
    threshold?: number;
  }) {
    if (!input.businessId) {
      throw new Error("Business is required.");
    }

    const threshold = input.threshold ?? 10;

    if (
      !Number.isFinite(threshold) ||
      threshold < 0
    ) {
      throw new Error(
        "Stock threshold must be zero or greater.",
      );
    }

    return prisma.inventoryBalance.findMany({
      where: {
        businessId: input.businessId,
        quantity: {
          lte: threshold,
        },
        product: {
          pharmacyProduct: {
            isNot: null,
          },
        },
      },
      orderBy: {
        quantity: "asc",
      },
      take: 50,
      select: {
        id: true,
        quantity: true,
        reservedQuantity: true,
        warehouseId: true,
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            barcode: true,
            pharmacyProduct: {
              select: {
                medicineType: true,
                prescriptionType: true,
                status: true,
              },
            },
          },
        },
      },
    });
  },

  async getOutOfStockProducts(input: {
    businessId: string;
  }) {
    if (!input.businessId) {
      throw new Error("Business is required.");
    }

    return prisma.inventoryBalance.findMany({
      where: {
        businessId: input.businessId,
        quantity: {
          lte: 0,
        },
        product: {
          pharmacyProduct: {
            isNot: null,
          },
        },
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
      take: 50,
      select: {
        id: true,
        quantity: true,
        warehouseId: true,
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            barcode: true,
            pharmacyProduct: {
              select: {
                medicineType: true,
                prescriptionType: true,
                status: true,
              },
            },
          },
        },
      },
    });
  },
};