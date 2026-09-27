import { prisma } from "@/lib/database/prisma";

export interface PharmacyBatchListInput {
  businessId: string;
  search?: string;
  warehouseId?: string;
  status?: "ALL" | "ACTIVE" | "EXPIRING" | "EXPIRED" | "RECALLED";
}

export const pharmacyBatchViewService = {
  async list(input: PharmacyBatchListInput) {
    const search = input.search?.trim();

    const batches = await prisma.pharmacyBatch.findMany({
      where: {
        pharmacyProduct: {
          product: {
            businessId: input.businessId,
            ...(search
              ? {
                  OR: [
                    {
                      name: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                    {
                      sku: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  ],
                }
              : {}),
          },
        },

        ...(input.warehouseId
          ? {
              warehouseId: input.warehouseId,
            }
          : {}),

        ...(input.status === "RECALLED"
          ? {
              isRecalled: true,
            }
          : {}),

        ...(input.status !== "RECALLED"
          ? {
              isRecalled: false,
            }
          : {}),
      },

      orderBy: {
        expiryDate: "asc",
      },

      include: {
        pharmacyProduct: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                barcode: true,
                unit: true,
              },
            },
          },
        },

        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },

        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const now = new Date();

    const expiringThreshold = new Date(now);
    expiringThreshold.setDate(
      expiringThreshold.getDate() + 90,
    );

    const result = batches.map((batch) => {
      let expiryStatus:
        | "EXPIRED"
        | "EXPIRING"
        | "ACTIVE";

      if (batch.expiryDate <= now) {
        expiryStatus = "EXPIRED";
      } else if (
        batch.expiryDate <= expiringThreshold
      ) {
        expiryStatus = "EXPIRING";
      } else {
        expiryStatus = "ACTIVE";
      }

      return {
        id: batch.id,

        product: {
          id: batch.pharmacyProduct.product.id,
          name: batch.pharmacyProduct.product.name,
          sku: batch.pharmacyProduct.product.sku,
          barcode:
            batch.pharmacyProduct.product.barcode,
          unit: batch.pharmacyProduct.product.unit,
        },

        pharmacyProductId:
          batch.pharmacyProductId,

        medicineType:
          batch.pharmacyProduct.medicineType,

        prescriptionType:
          batch.pharmacyProduct.prescriptionType,

        batchNumber: batch.batchNumber,

        manufacturingDate:
          batch.manufacturingDate,

        expiryDate: batch.expiryDate,

        quantityReceived:
          batch.quantityReceived.toNumber(),

        quantityRemaining:
          batch.quantityRemaining.toNumber(),

        unitCost:
          batch.unitCost?.toNumber() ?? null,

        warehouse: batch.warehouse,

        supplier: batch.supplier,

        isRecalled: batch.isRecalled,

        recallReason: batch.recallReason,

        expiryStatus,
      };
    });

    if (
      input.status === "EXPIRED"
    ) {
      return result.filter(
        (batch) =>
          batch.expiryStatus === "EXPIRED",
      );
    }

    if (
      input.status === "EXPIRING"
    ) {
      return result.filter(
        (batch) =>
          batch.expiryStatus === "EXPIRING",
      );
    }

    if (
      input.status === "ACTIVE"
    ) {
      return result.filter(
        (batch) =>
          batch.expiryStatus === "ACTIVE",
      );
    }

    return result;
  },
};