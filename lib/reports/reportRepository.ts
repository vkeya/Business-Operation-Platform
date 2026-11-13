import { prisma } from "@/lib/database/prisma";
import type { ResolvedReportPeriod } from "./period/reportPeriodTypes";

export const reportRepository = {
  async getCoreReportData(
    businessId: string,
    period?: ResolvedReportPeriod,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const dateFilter = period
      ? {
          gte: period.startDate,
          lt: period.endDateExclusive,
        }
      : undefined;

    const [
      sales,
      returns,
      purchases,
      expenses,
      saleCollections,
      supplierPayments,
      inventoryBalances,
      purchaseReceipts,
    ] = await Promise.all([
      prisma.sale.groupBy({
        by: ["currency"],
        where: {
          businessId,
          status: "COMPLETED",
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        _sum: {
          subtotal: true,
          discountAmount: true,
          taxAmount: true,
          totalAmount: true,
        },
        _count: true,
      }),

      prisma.saleReturn.groupBy({
        by: ["currency"],
        where: {
          businessId,
          status: "COMPLETED",
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        _sum: {
          subtotal: true,
          discountAmount: true,
          taxAmount: true,
          totalAmount: true,
        },
        _count: true,
      }),

      prisma.purchase.groupBy({
        by: ["currency", "status"],
        where: {
          businessId,
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      }),

      prisma.expense.groupBy({
        by: ["currency", "paymentStatus"],
        where: {
          businessId,
          ...(dateFilter ? { expenseDate: dateFilter } : {}),
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),

      prisma.payment.groupBy({
        by: ["currency"],
        where: {
          businessId,
          status: "PAID",
          saleId: { not: null },
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),

      prisma.payment.groupBy({
        by: ["currency"],
        where: {
          businessId,
          status: "PAID",
          purchaseId: { not: null },
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),

      prisma.inventoryBalance.groupBy({
        by: ["currency", "averageCost"],
        where: {
          businessId,
        },
        _sum: {
          quantity: true,
        },
      }),

      prisma.inventoryMovement.groupBy({
        by: ["referenceId"],
        where: {
          businessId,
          type: "RECEIPT",
          referenceType: "PURCHASE",
          referenceId: { not: null },
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        _sum: {
          quantity: true,
          totalCost: true,
        },
        _count: true,
      }),
    ]);

    const receivedPurchaseIds = purchaseReceipts
      .map((receipt) => receipt.referenceId)
      .filter((id): id is string => Boolean(id));

    const receivedPurchases =
      receivedPurchaseIds.length > 0
        ? await prisma.purchase.findMany({
            where: {
              businessId,
              id: { in: receivedPurchaseIds },
            },
            select: {
              id: true,
              totalAmount: true,
              currency: true,
              status: true,
            },
          })
        : [];

    return {
      sales,
      returns,
      purchases,
      expenses,
      saleCollections,
      supplierPayments,
      inventoryBalances,
      purchaseReceipts,
      receivedPurchases,
    };
  },

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
  

    async getHospitalFinancialSummary(
      businessId: string,
      period: ResolvedReportPeriod,
    ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    if (
      Number.isNaN(period.startDate.getTime()) ||
      Number.isNaN(period.endDateExclusive.getTime()) ||
      period.startDate >= period.endDateExclusive
    ) {
      throw new Error("A valid report date range is required.");
    }

    const [invoiceStatuses, paymentCollections, collectibleInvoices] =
      await Promise.all([
        prisma.hospitalInvoice.groupBy({
          by: ["currency", "status"],
          where: {
            businessId,
            createdAt: {
              gte: period.startDate,
              lt: period.endDateExclusive,
            },
          },
          _count: { _all: true },
          _sum: {
            subtotal: true,
            discountTotal: true,
            taxTotal: true,
            totalAmount: true,
            amountPaid: true,
          },
        }),

        prisma.hospitalInvoicePayment.groupBy({
          by: ["currency"],
          where: {
            businessId,
            createdAt: {
              gte: period.startDate,
              lt: period.endDateExclusive,
            },
          },
          _count: { _all: true },
          _sum: { amount: true },
        }),

        prisma.hospitalInvoice.findMany({
          where: {
            businessId,
            status: {
              in: ["ISSUED", "PARTIALLY_PAID"],
            },
          },
          select: {
            id: true,
            invoiceNumber: true,
            currency: true,
            status: true,
            totalAmount: true,
            amountPaid: true,
            dueAt: true,
            issuedAt: true,
            patient: {
              select: {
                patientNumber: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            dueAt: "asc",
          },
        }),
      ]);

    return {
      invoiceStatuses,
      paymentCollections,
      collectibleInvoices,
    };
  },

};
