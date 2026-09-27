import { prisma } from "@/lib/database/prisma";

export const pharmacyDashboardService = {
  async getSummary(input: {
    businessId: string;
  }) {
    if (!input.businessId) {
      throw new Error("Business is required.");
    }

    const now = new Date();

    const [
      batchSummary,
      expiredBatches,
      expiringBatches,
      recalledBatches,
      prescriptionSummary,
      controlledDispensingCount,
      adjustmentCount,
    ] = await Promise.all([
      prisma.pharmacyBatch.aggregate({
        where: {
          pharmacyProduct: {
            product: {
              businessId: input.businessId,
            },
          },
        },
        _sum: {
          quantityRemaining: true,
        },
        _count: {
          id: true,
        },
      }),

      prisma.pharmacyBatch.count({
        where: {
          pharmacyProduct: {
            product: {
              businessId: input.businessId,
            },
          },
          expiryDate: {
            lte: now,
          },
          quantityRemaining: {
            gt: 0,
          },
        },
      }),

      prisma.pharmacyBatch.count({
        where: {
          pharmacyProduct: {
            product: {
              businessId: input.businessId,
            },
          },
          expiryDate: {
            gt: now,
            lte: new Date(
              now.getTime() +
                30 * 24 * 60 * 60 * 1000,
            ),
          },
          quantityRemaining: {
            gt: 0,
          },
          isRecalled: false,
        },
      }),

      prisma.pharmacyBatch.count({
        where: {
          pharmacyProduct: {
            product: {
              businessId: input.businessId,
            },
          },
          isRecalled: true,
        },
      }),

      prisma.pharmacyPrescription.groupBy({
        by: ["status"],
        where: {
          businessId: input.businessId,
        },
        _count: {
          id: true,
        },
      }),

      prisma.pharmacyControlledDispensingRecord.count({
        where: {
          businessId: input.businessId,
        },
      }),

      prisma.inventoryMovement.count({
        where: {
          businessId: input.businessId,
          referenceType:
            "PHARMACY_BATCH_ADJUSTMENT",
        },
      }),
    ]);

    const activePrescriptions =
      prescriptionSummary.find(
        (item) => item.status === "ACTIVE",
      )?._count.id ?? 0;

    const partiallyDispensedPrescriptions =
      prescriptionSummary.find(
        (item) =>
          item.status === "PARTIALLY_DISPENSED",
      )?._count.id ?? 0;

    const fullyDispensedPrescriptions =
      prescriptionSummary.find(
        (item) =>
          item.status === "FULLY_DISPENSED",
      )?._count.id ?? 0;

    const cancelledPrescriptions =
      prescriptionSummary.find(
        (item) =>
          item.status === "CANCELLED",
      )?._count.id ?? 0;

    const expiredPrescriptions =
      prescriptionSummary.find(
        (item) =>
          item.status === "EXPIRED",
      )?._count.id ?? 0;

    return {
      stock: {
        totalBatches: batchSummary._count.id,
        totalQuantity:
          batchSummary._sum.quantityRemaining?.toString() ??
          "0",
        expiredBatches,
        expiringBatches,
        recalledBatches,
      },

      prescriptions: {
        active: activePrescriptions,
        partiallyDispensed:
          partiallyDispensedPrescriptions,
        fullyDispensed:
          fullyDispensedPrescriptions,
        cancelled: cancelledPrescriptions,
        expired: expiredPrescriptions,
        total:
          activePrescriptions +
          partiallyDispensedPrescriptions +
          fullyDispensedPrescriptions +
          cancelledPrescriptions +
          expiredPrescriptions,
      },

      controlledDispensing: {
        total: controlledDispensingCount,
      },

      adjustments: {
        total: adjustmentCount,
      },
    };
  },
};