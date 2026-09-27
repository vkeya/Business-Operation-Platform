import { prisma } from "@/lib/database/prisma";

export const reportRepository = {
  async getSalesSummary(
    businessId: string,
  ) {
    return prisma.sale.aggregate({
      where: {
        businessId,
        status: "COMPLETED",
      },
      _sum: {
        totalAmount: true,
      },
      _count: true,
    });
  },
  
      async getTaxSummary(
    businessId: string,
  ) {
    const [sales, returns] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          businessId,
          status: "COMPLETED",
        },
        _sum: {
          subtotal: true,
          discountAmount: true,
          taxAmount: true,
          totalAmount: true,
        },
      }),

      prisma.saleReturn.aggregate({
        where: {
          businessId,
          status: "COMPLETED",
        },
        _sum: {
          subtotal: true,
          discountAmount: true,
          taxAmount: true,
          totalAmount: true,
        },
      }),
    ]);

    return {
      sales,
      returns,
    };
  },

  async getPurchaseSummary(
    businessId: string,
  ) {
    return prisma.purchase.aggregate({
      where: {
        businessId,
        status: "RECEIVED",
      },
      _sum: {
        totalAmount: true,
      },
      _count: true,
    });
  },

  async getExpenseSummary(
    businessId: string,
  ) {
    return prisma.expense.aggregate({
      where: {
        businessId,
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });
  },

  async getInventorySummary(
    businessId: string,
  ) {
    const balances =
      await prisma.inventoryBalance.findMany({
        where: {
          warehouse: {
            businessId,
          },
        },
      });

    return balances;
  },
  
    async getPharmacyControlledDispensingRegister(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return prisma.pharmacyControlledDispensingRecord.findMany({
      where: {
        businessId,
      },
      orderBy: {
        dispensedAt: "desc",
      },
      select: {
        id: true,
        saleId: true,
        saleItemId: true,
        pharmacyProductId: true,
        pharmacyBatchId: true,
        prescriptionId: true,
        prescriptionItemId: true,
        customerId: true,
        quantity: true,
        dispensedBy: true,
        pharmacistName: true,
        pharmacistLicense: true,
        registerReference: true,
        reason: true,
        status: true,
        dispensedAt: true,
        reversedAt: true,
        reversalReason: true,

        sale: {
          select: {
            referenceNumber: true,
          },
        },

        saleItem: {
          select: {
            productName: true,
          },
        },

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

        pharmacyBatch: {
          select: {
            batchNumber: true,
            expiryDate: true,
          },
        },

        prescription: {
          select: {
            prescriptionNumber: true,
            prescriberName: true,
            prescriberLicense: true,
          },
        },

        customer: {
          select: {
            name: true,
          },
        },
      },
    });
  },
  
    async getPharmacyPrescriptionDispensingReport(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return prisma.pharmacyPrescription.findMany({
      where: {
        businessId,
      },
      orderBy: {
        prescriptionDate: "desc",
      },
      select: {
        id: true,
        prescriptionNumber: true,
        prescriptionDate: true,
        expiryDate: true,
        prescriberName: true,
        prescriberLicense: true,
        status: true,
        customer: {
          select: {
            name: true,
          },
        },
        sale: {
          select: {
            referenceNumber: true,
          },
        },
        items: {
          select: {
            id: true,
            quantityPrescribed: true,
            quantityDispensed: true,
            dosageInstructions: true,
            duration: true,
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });
  },
  
    async getPharmacyExpiryReport(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return prisma.pharmacyBatch.findMany({
      where: {
        pharmacyProduct: {
          product: {
            businessId,
          },
        },
        quantityRemaining: {
          gt: 0,
        },
      },
      orderBy: [
        {
          expiryDate: "asc",
        },
        {
          quantityRemaining: "desc",
        },
      ],
      select: {
        id: true,
        batchNumber: true,
        manufacturingDate: true,
        expiryDate: true,
        quantityReceived: true,
        quantityRemaining: true,
        unitCost: true,
        isRecalled: true,
        recallReason: true,

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
  
    async getPharmacyBatchMovementReport(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return prisma.inventoryMovement.findMany({
      where: {
        businessId,
        referenceType: "PHARMACY_BATCH_ADJUSTMENT",
        referenceId: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        productId: true,
        warehouseId: true,
        type: true,
        quantity: true,
        unitCost: true,
        totalCost: true,
        referenceType: true,
        referenceId: true,
        notes: true,
        createdBy: true,
        createdAt: true,

        product: {
          select: {
            name: true,
            sku: true,
          },
        },

        warehouse: {
          select: {
            name: true,
          },
        },
      },
    });
  },
  
    async getPharmacyBatchStockValuation(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return prisma.pharmacyBatch.findMany({
      where: {
        pharmacyProduct: {
          product: {
            businessId,
          },
        },
        quantityRemaining: {
          gt: 0,
        },
      },
      orderBy: [
        {
          pharmacyProduct: {
            product: {
              name: "asc",
            },
          },
        },
        {
          expiryDate: "asc",
        },
      ],
      select: {
        id: true,
        batchNumber: true,
        expiryDate: true,
        quantityRemaining: true,
        unitCost: true,
        isRecalled: true,

        pharmacyProduct: {
          select: {
            medicineType: true,
            product: {
              select: {
                id: true,
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

        supplier: {
          select: {
            name: true,
          },
        },
      },
    });
  },
  
    async getPharmacyRecallReport(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return prisma.pharmacyBatch.findMany({
      where: {
        pharmacyProduct: {
          product: {
            businessId,
          },
        },
        isRecalled: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        batchNumber: true,
        manufacturingDate: true,
        expiryDate: true,
        quantityReceived: true,
        quantityRemaining: true,
        unitCost: true,
        recallReason: true,
        createdAt: true,
        updatedAt: true,

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
            name: true,
          },
        },

        supplier: {
          select: {
            name: true,
          },
        },
      },
    });
  },
  
};