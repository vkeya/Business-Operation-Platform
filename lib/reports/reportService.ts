import { reportRepository } from "./reportRepository";
import type { ResolvedReportPeriod } from "./period/reportPeriodTypes";

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
  

  async getCoreBusinessReport(
    businessId: string,
    period?: ResolvedReportPeriod,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    const data = await reportRepository.getCoreReportData(
      businessId,
      period,
    );

    type CurrencyTotals = {
      currency: string;
      sales: {
        count: number;
        grossSales: number;
        revenueExcludingTax: number;
        taxCollected: number;
      };
      returns: {
        count: number;
        totalAmount: number;
        taxAmount: number;
      };
      purchases: {
        statuses: Array<{
          status: string;
          count: number;
          amount: number;
        }>;
        receivedCount: number;
        receivedAmount: number;
      };
      collections: {
        count: number;
        amount: number;
      };
      supplierPayments: {
        count: number;
        amount: number;
      };
      expenses: {
        count: number;
        incurredAmount: number;
        byPaymentStatus: Array<{
          status: string;
          count: number;
          amount: number;
        }>;
      };
      inventory: {
        units: number;
        value: number;
      };
    };

    const currencyMap = new Map<string, CurrencyTotals>();

    const getCurrency = (currency: string) => {
      let result = currencyMap.get(currency);

      if (!result) {
        result = {
          currency,
          sales: {
            count: 0,
            grossSales: 0,
            revenueExcludingTax: 0,
            taxCollected: 0,
          },
          returns: {
            count: 0,
            totalAmount: 0,
            taxAmount: 0,
          },
          purchases: {
            statuses: [],
            receivedCount: 0,
            receivedAmount: 0,
          },
          collections: {
            count: 0,
            amount: 0,
          },
          supplierPayments: {
            count: 0,
            amount: 0,
          },
          expenses: {
            count: 0,
            incurredAmount: 0,
            byPaymentStatus: [],
          },
          inventory: {
            units: 0,
            value: 0,
          },
        };

        currencyMap.set(currency, result);
      }

      return result;
    };

    for (const row of data.sales) {
      const result = getCurrency(row.currency);

      const subtotal = Number(row._sum.subtotal ?? 0);
      const discount = Number(row._sum.discountAmount ?? 0);

      result.sales.count = row._count;
      result.sales.grossSales = Number(row._sum.totalAmount ?? 0);
      result.sales.revenueExcludingTax = subtotal - discount;
      result.sales.taxCollected = Number(row._sum.taxAmount ?? 0);
    }

    for (const row of data.returns) {
      const result = getCurrency(row.currency);

      result.returns.count = row._count;
      result.returns.totalAmount = Number(row._sum.totalAmount ?? 0);
      result.returns.taxAmount = Number(row._sum.taxAmount ?? 0);
    }

    for (const row of data.purchases) {
      const result = getCurrency(row.currency);

      result.purchases.statuses.push({
        status: row.status,
        count: row._count,
        amount: Number(row._sum.totalAmount ?? 0),
      });
    }

    const purchaseCurrencyById = new Map(
      data.receivedPurchases.map((purchase) => [
        purchase.id,
        purchase.currency,
      ]),
    );

    for (const receipt of data.purchaseReceipts) {
      const currency = receipt.referenceId
        ? purchaseCurrencyById.get(receipt.referenceId)
        : undefined;

      if (!currency) continue;

      const result = getCurrency(currency);

      // purchaseReceipts is grouped by referenceId,
      // so each purchase is counted once, even when
      // it has multiple partial receipt movements.
      result.purchases.receivedCount += 1;

      // Report the actual received movement cost,
      // not the full purchase order value.
      result.purchases.receivedAmount += Number(
        receipt._sum.totalCost ?? 0,
      );
    }


    for (const row of data.saleCollections) {
      const result = getCurrency(row.currency);

      result.collections.count = row._count;
      result.collections.amount = Number(row._sum.amount ?? 0);
    }

    for (const row of data.supplierPayments) {
      const result = getCurrency(row.currency);

      result.supplierPayments.count = row._count;
      result.supplierPayments.amount = Number(row._sum.amount ?? 0);
    }

    for (const row of data.expenses) {
      const result = getCurrency(row.currency);
      const amount = Number(row._sum.amount ?? 0);

      result.expenses.incurredAmount += amount;
      result.expenses.count += row._count;

      result.expenses.byPaymentStatus.push({
        status: row.paymentStatus,
        count: row._count,
        amount,
      });
    }

    for (const row of data.inventoryBalances) {
      const result = getCurrency(row.currency);
      const units = Number(row._sum.quantity ?? 0);

      result.inventory.units += units;
      result.inventory.value +=
        units * Number(row.averageCost);
    }

    return {
      period: period
        ? {
            startDate: period.startDate,
            endDateExclusive: period.endDateExclusive,
            timezone: period.timezone,
            startDateLocal: period.startDateLocal,
            endDateLocalExclusive: period.endDateLocalExclusive,
          }
        : null,
      currencies: Array.from(currencyMap.values()).sort(
        (a, b) => a.currency.localeCompare(b.currency),
      ),
      inventoryIsCurrentPosition: true,
      supplierOutstandingBalanceAvailable: false,
      accountingProfitAvailable: false,
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

    const summary =
      await reportRepository.getHospitalFinancialSummary(
        businessId,
        period,
      );

    const invoiceStatuses = summary.invoiceStatuses.map((group) => ({
      currency: group.currency,
      status: group.status,
      count: group._count._all,
      subtotal: Number(group._sum.subtotal ?? 0),
      discountTotal: Number(group._sum.discountTotal ?? 0),
      taxTotal: Number(group._sum.taxTotal ?? 0),
      totalAmount: Number(group._sum.totalAmount ?? 0),
      amountPaid: Number(group._sum.amountPaid ?? 0),
    }));

    const paymentCollections = summary.paymentCollections.map((group) => ({
      currency: group.currency,
      paymentCount: group._count._all,
      amountCollected: Number(group._sum.amount ?? 0),
    }));

    const collectibleInvoices = summary.collectibleInvoices
      .map((invoice) => {
        const totalAmount = Number(invoice.totalAmount);
        const amountPaid = Number(invoice.amountPaid);
        const balanceDue = Math.max(0, totalAmount - amountPaid);

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          currency: invoice.currency,
          status: invoice.status,
          totalAmount,
          amountPaid,
          balanceDue,
          dueAt: invoice.dueAt,
          issuedAt: invoice.issuedAt,
          patientNumber: invoice.patient.patientNumber,
          patientName: [
            invoice.patient.firstName,
            invoice.patient.lastName,
          ]
            .filter(Boolean)
            .join(" "),
        };
      })
      .filter((invoice) => invoice.balanceDue > 0);

    const now = new Date();

    const overdueInvoices = collectibleInvoices.filter(
      (invoice) =>
        invoice.dueAt !== null &&
        invoice.dueAt < now,
    );

    return {
      period: {
       startDate: period.startDate,
       endDateExclusive: period.endDateExclusive,
       startDateLocal: period.startDateLocal,
       endDateLocalExclusive: period.endDateLocalExclusive,
       timezone: period.timezone,
     },
      invoiceStatuses,
      paymentCollections,
      outstanding: {
        invoices: collectibleInvoices,
        count: collectibleInvoices.length,
        totalsByCurrency: Object.entries(
          collectibleInvoices.reduce<Record<string, number>>(
            (totals, invoice) => {
              totals[invoice.currency] =
                (totals[invoice.currency] ?? 0) +
                invoice.balanceDue;
              return totals;
            },
            {},
          ),
        ).map(([currency, balanceDue]) => ({
          currency,
          balanceDue,
        })),
      },
      overdue: {
        invoices: overdueInvoices,
        count: overdueInvoices.length,
        totalsByCurrency: Object.entries(
          overdueInvoices.reduce<Record<string, number>>(
            (totals, invoice) => {
              totals[invoice.currency] =
                (totals[invoice.currency] ?? 0) +
                invoice.balanceDue;
              return totals;
            },
            {},
          ),
        ).map(([currency, balanceDue]) => ({
          currency,
          balanceDue,
        })),
      },
    };
  },

};