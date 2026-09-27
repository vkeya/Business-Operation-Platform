import { reportRepository } from "./reportRepository";

export const reportService = {
  async getBusinessReport(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const [
      sales,
      purchases,
      expenses,
      inventory,
      taxSummary,
    ] = await Promise.all([
      reportRepository.getSalesSummary(businessId),
      reportRepository.getPurchaseSummary(businessId),
      reportRepository.getExpenseSummary(businessId),
      reportRepository.getInventorySummary(businessId),
      reportRepository.getTaxSummary(businessId),
    ]);

    const revenue = Number(
      sales._sum.totalAmount ?? 0,
    );

    const purchaseCost = Number(
      purchases._sum.totalAmount ?? 0,
    );

    const expenseCost = Number(
      expenses._sum.amount ?? 0,
    );

    const inventoryValue = inventory.reduce(
      (total, item) =>
        total +
        Number(item.quantity) *
          Number(item.averageCost),
      0,
    );

    return {
      sales: {
        count: sales._count,
        amount: revenue,
      },

      tax: {
  taxableSales:
    Number(taxSummary.sales._sum.subtotal ?? 0) -
    Number(taxSummary.sales._sum.discountAmount ?? 0) -
    Number(taxSummary.returns._sum.subtotal ?? 0) +
    Number(taxSummary.returns._sum.discountAmount ?? 0),

  taxCollected:
    Number(taxSummary.sales._sum.taxAmount ?? 0) -
    Number(taxSummary.returns._sum.taxAmount ?? 0),

  totalSales:
    Number(taxSummary.sales._sum.totalAmount ?? 0) -
    Number(taxSummary.returns._sum.totalAmount ?? 0),
},

      purchases: {
        count: purchases._count,
        amount: purchaseCost,
      },

      expenses: {
        count: expenses._count,
        amount: expenseCost,
      },

      inventory: {
        value: inventoryValue,
        units: inventory.reduce(
          (total, item) =>
            total + Number(item.quantity),
          0,
        ),
      },

      profit:
        revenue -
        purchaseCost -
        expenseCost,
    };
  },
  
    async getPharmacyControlledDispensingRegister(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const records =
      await reportRepository.getPharmacyControlledDispensingRegister(
        businessId,
      );

    return records.map((record) => ({
      id: record.id,
      saleId: record.saleId,
      saleReference:
        record.sale.referenceNumber,
      saleItemId: record.saleItemId,

      productId:
        record.pharmacyProductId,
      productName:
        record.pharmacyProduct.product.name,
      sku:
        record.pharmacyProduct.product.sku,
      saleItemProductName:
        record.saleItem.productName,

      batchId:
        record.pharmacyBatchId,
      batchNumber:
        record.pharmacyBatch.batchNumber,
      expiryDate:
        record.pharmacyBatch.expiryDate,

      prescriptionId:
        record.prescriptionId,
      prescriptionNumber:
        record.prescription
          ?.prescriptionNumber ?? null,
      prescriberName:
        record.prescription
          ?.prescriberName ?? null,
      prescriberLicense:
        record.prescription
          ?.prescriberLicense ?? null,

      customerId:
        record.customerId,
      customerName:
        record.customer?.name ?? null,

      quantity:
        Number(record.quantity),

      dispensedBy:
        record.dispensedBy,
      pharmacistName:
        record.pharmacistName,
      pharmacistLicense:
        record.pharmacistLicense,

      registerReference:
        record.registerReference,
      reason:
        record.reason,

      status:
        record.status,

      dispensedAt:
        record.dispensedAt,
      reversedAt:
        record.reversedAt,
      reversalReason:
        record.reversalReason,
    }));
  },
  
    async getPharmacyPrescriptionDispensingReport(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const prescriptions =
      await reportRepository.getPharmacyPrescriptionDispensingReport(
        businessId,
      );

    return prescriptions.flatMap((prescription) =>
      prescription.items.map((item) => ({
        id: item.id,

        prescriptionId: prescription.id,
        prescriptionNumber:
          prescription.prescriptionNumber,

        prescriptionDate:
          prescription.prescriptionDate,
        expiryDate:
          prescription.expiryDate,

        prescriberName:
          prescription.prescriberName,
        prescriberLicense:
          prescription.prescriberLicense,

        customerName:
          prescription.customer?.name ?? null,

        saleReference:
          prescription.sale?.referenceNumber ?? null,

        status:
          prescription.status,

        productName:
          item.product.name,
        sku:
          item.product.sku,

        quantityPrescribed:
          Number(item.quantityPrescribed),

        quantityDispensed:
          Number(item.quantityDispensed),

        quantityRemaining:
          Math.max(
            0,
            Number(item.quantityPrescribed) -
              Number(item.quantityDispensed),
          ),

        dosageInstructions:
          item.dosageInstructions,

        duration:
          item.duration,
      })),
    );
  },
  
    async getPharmacyExpiryReport(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const batches =
      await reportRepository.getPharmacyExpiryReport(
        businessId,
      );

    const now = new Date();

    return batches.map((batch) => {
      const daysToExpiry = Math.ceil(
        (batch.expiryDate.getTime() - now.getTime()) /
          (24 * 60 * 60 * 1000),
      );

      const quantityRemaining =
        Number(batch.quantityRemaining);

      const unitCost =
        batch.unitCost === null
          ? 0
          : Number(batch.unitCost);

      return {
        id: batch.id,

        productId:
          batch.pharmacyProduct.product.id,
        productName:
          batch.pharmacyProduct.product.name,
        sku:
          batch.pharmacyProduct.product.sku,
        barcode:
          batch.pharmacyProduct.product.barcode,

        medicineType:
          batch.pharmacyProduct.medicineType,
        prescriptionType:
          batch.pharmacyProduct.prescriptionType,

        batchNumber:
          batch.batchNumber,

        manufacturingDate:
          batch.manufacturingDate,
        expiryDate:
          batch.expiryDate,

        daysToExpiry,

        quantityReceived:
          Number(batch.quantityReceived),

        quantityRemaining,

        unitCost,

        stockValue:
          quantityRemaining * unitCost,

        warehouseName:
          batch.warehouse.name,

        supplierName:
          batch.supplier?.name ?? null,

        isRecalled:
          batch.isRecalled,

        recallReason:
          batch.recallReason,
      };
    });
  },
  
    async getPharmacyBatchMovementReport(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const movements =
      await reportRepository.getPharmacyBatchMovementReport(
        businessId,
      );

    return movements.map((movement) => ({
      id: movement.id,

      productId:
        movement.productId,
      productName:
        movement.product.name,
      sku:
        movement.product.sku,

      warehouseId:
        movement.warehouseId,
      warehouseName:
        movement.warehouse.name,

      movementType:
        movement.type,

      quantity:
        Number(movement.quantity),

      unitCost:
        movement.unitCost === null
          ? null
          : Number(movement.unitCost),

      totalCost:
        movement.totalCost === null
          ? null
          : Number(movement.totalCost),

      referenceType:
        movement.referenceType,

      referenceId:
        movement.referenceId,

      notes:
        movement.notes,

      createdBy:
        movement.createdBy,

      createdAt:
        movement.createdAt,
    }));
  },
  
    async getPharmacyBatchStockValuation(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const batches =
      await reportRepository.getPharmacyBatchStockValuation(
        businessId,
      );

    const rows = batches.map((batch) => {
      const quantityRemaining =
        Number(batch.quantityRemaining);

      const unitCost =
        batch.unitCost === null
          ? 0
          : Number(batch.unitCost);

      return {
        id: batch.id,

        productId:
          batch.pharmacyProduct.product.id,
        productName:
          batch.pharmacyProduct.product.name,
        sku:
          batch.pharmacyProduct.product.sku,

        medicineType:
          batch.pharmacyProduct.medicineType,

        batchNumber:
          batch.batchNumber,

        expiryDate:
          batch.expiryDate,

        quantityRemaining,

        unitCost,

        stockValue:
          quantityRemaining * unitCost,

        warehouseName:
          batch.warehouse.name,

        supplierName:
          batch.supplier?.name ?? null,

        isRecalled:
          batch.isRecalled,
      };
    });

    return {
      rows,
      totalStockValue: rows.reduce(
        (total, row) =>
          total + row.stockValue,
        0,
      ),
      totalUnits: rows.reduce(
        (total, row) =>
          total + row.quantityRemaining,
        0,
      ),
    };
  },
  
    async getPharmacyRecallReport(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const batches =
      await reportRepository.getPharmacyRecallReport(
        businessId,
      );

    return batches.map((batch) => ({
      id: batch.id,

      productId:
        batch.pharmacyProduct.product.id,
      productName:
        batch.pharmacyProduct.product.name,
      sku:
        batch.pharmacyProduct.product.sku,
      barcode:
        batch.pharmacyProduct.product.barcode,

      medicineType:
        batch.pharmacyProduct.medicineType,
      prescriptionType:
        batch.pharmacyProduct.prescriptionType,

      batchNumber:
        batch.batchNumber,

      manufacturingDate:
        batch.manufacturingDate,
      expiryDate:
        batch.expiryDate,

      quantityReceived:
        Number(batch.quantityReceived),

      quantityRemaining:
        Number(batch.quantityRemaining),

      unitCost:
        batch.unitCost === null
          ? null
          : Number(batch.unitCost),

      stockValue:
        batch.unitCost === null
          ? 0
          : Number(batch.quantityRemaining) *
            Number(batch.unitCost),

      recallReason:
        batch.recallReason,

      warehouseName:
        batch.warehouse.name,

      supplierName:
        batch.supplier?.name ?? null,

      createdAt:
        batch.createdAt,

      recalledAt:
        batch.updatedAt,
    }));
  },
  
};