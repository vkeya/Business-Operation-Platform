import { prisma } from "@/lib/database/prisma";

export const pharmacyBatchTraceabilityService = {
  async getHistory(input: {
    businessId: string;
    pharmacyBatchId: string;
  }) {
    if (!input.businessId) {
      throw new Error("Business is required.");
    }

    if (!input.pharmacyBatchId) {
      throw new Error("Pharmacy batch is required.");
    }

    const batch = await prisma.pharmacyBatch.findFirst({
      where: {
        id: input.pharmacyBatchId,
        pharmacyProduct: {
          product: {
            businessId: input.businessId,
          },
        },
      },
      select: {
        id: true,
        batchNumber: true,
		manufacturingDate: true,
        expiryDate: true,
        quantityReceived: true,
        quantityRemaining: true,
        isRecalled: true,
        recallReason: true,
        pharmacyProduct: {
          select: {
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
		
		purchase: {
  select: {
    id: true,
    referenceNumber: true,
    supplierInvoiceNumber: true,
    status: true,
    createdAt: true,
  },
},
      },
    });

    if (!batch) {
      throw new Error("Pharmacy batch not found.");
    }

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        businessId: input.businessId,
        referenceType: "PHARMACY_BATCH_ADJUSTMENT",
        referenceId: input.pharmacyBatchId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
        quantity: true,
        unitCost: true,
        totalCost: true,
        referenceType: true,
        referenceId: true,
        notes: true,
        createdBy: true,
        createdAt: true,
      },
    });
	
	const dispensingRecords =
  await prisma.pharmacyControlledDispensingRecord.findMany({
    where: {
      businessId: input.businessId,
      pharmacyBatchId: input.pharmacyBatchId,
    },
    orderBy: {
      dispensedAt: "desc",
    },
    select: {
      id: true,
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
          id: true,
          referenceNumber: true,
          status: true,
          createdAt: true,
        },
      },
      saleItem: {
        select: {
          id: true,
          productName: true,
          sku: true,
          quantity: true,
        },
      },
      prescription: {
        select: {
          id: true,
          prescriptionNumber: true,
          prescriptionDate: true,
          expiryDate: true,
          prescriberName: true,
          prescriberLicense: true,
          status: true,
        },
      },
      prescriptionItem: {
        select: {
          id: true,
          quantityPrescribed: true,
          quantityDispensed: true,
          dosageInstructions: true,
          duration: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });

    return {
  batch,
  movements,
  dispensingRecords,
};
  },
};