import { prisma } from "@/lib/database/prisma";

export const pharmacyExpiryRiskService = {
  async getExpiringBatches(input: {
    businessId: string;
    days?: number;
  }) {
    if (!input.businessId) {
      throw new Error("Business is required.");
    }

    const days = input.days ?? 30;

    if (!Number.isInteger(days) || days <= 0) {
      throw new Error(
        "Expiry window must be a positive number of days.",
      );
    }

    const now = new Date();

    const cutoff = new Date(
      now.getTime() +
        days * 24 * 60 * 60 * 1000,
    );

    return prisma.pharmacyBatch.findMany({
      where: {
        pharmacyProduct: {
          product: {
            businessId: input.businessId,
          },
        },
        expiryDate: {
          gt: now,
          lte: cutoff,
        },
        quantityRemaining: {
          gt: 0,
        },
        isRecalled: false,
      },
      orderBy: [
        {
          expiryDate: "asc",
        },
        {
          quantityRemaining: "desc",
        },
      ],
      take: 50,
      select: {
        id: true,
        batchNumber: true,
        expiryDate: true,
        quantityReceived: true,
        quantityRemaining: true,
        unitCost: true,
        pharmacyProduct: {
          select: {
            medicineType: true,
            prescriptionType: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                barcode: true,
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
  },
};