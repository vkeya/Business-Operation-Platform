import { prisma } from "@/lib/database/prisma";

export const pharmacyComplianceDashboardService = {
  async getSummary(input: {
    businessId: string;
  }) {
    if (!input.businessId) {
      throw new Error("Business is required.");
    }

    const [
      recalledBatches,
      controlledRecords,
      adjustments,
      prescriptions,
    ] = await Promise.all([
      prisma.pharmacyBatch.findMany({
        where: {
          pharmacyProduct: {
            product: {
              businessId: input.businessId,
            },
          },
          isRecalled: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 20,
        select: {
          id: true,
          batchNumber: true,
          recallReason: true,
          quantityRemaining: true,
          updatedAt: true,
          pharmacyProduct: {
            select: {
              product: {
                select: {
                  name: true,
                  sku: true,
                },
              },
            },
          },
          warehouse: {
            select: {
              name: true,
            },
          },
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

      prisma.pharmacyPrescription.count({
        where: {
          businessId: input.businessId,
        },
      }),
    ]);

    return {
      recalledBatches,
      controlledDispensingCount: controlledRecords,
      adjustmentCount: adjustments,
      prescriptionCount: prescriptions,
    };
  },
};