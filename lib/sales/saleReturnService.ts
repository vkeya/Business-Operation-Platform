import { prisma } from "@/lib/database/prisma";
import { taxConfigurationService } from "@/lib/tax/taxConfigurationService";
import { calculateTax } from "@/lib/tax/taxCalculationService";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";

interface SaleReturnItemInput {
  saleItemId: string;
  quantity: number;
}

interface CreateSaleReturnInput {
  businessId: string;
  saleId: string;
  warehouseId?: string | null;
  currency: string;
  exchangeRate?: number | null;
  items: SaleReturnItemInput[];
  reason?: string;
  notes?: string;
  createdBy: string;
}

export const saleReturnService = {
  async create(input: CreateSaleReturnInput) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.saleId) {
      throw new Error("Sale is required.");
    }

    if (!input.currency) {
      throw new Error("Currency is required.");
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    if (input.items.length === 0) {
      throw new Error(
        "At least one return item is required.",
      );
    }

    const sale = await prisma.sale.findFirst({
      where: {
        id: input.saleId,
        businessId: input.businessId,
      },
      include: {
        items: true,
      },
    });

    if (!sale) {
      throw new Error("Sale not found.");
    }

    if (sale.status !== "COMPLETED") {
      throw new Error(
        "Only completed sales can be returned.",
      );
    }

    if (sale.currency !== input.currency) {
      throw new Error(
        "Return currency must match the original sale currency.",
      );
    }

    const requestedItems = new Map(
      input.items.map((item) => [
        item.saleItemId,
        item.quantity,
      ]),
    );

    if (
      requestedItems.size !==
      input.items.length
    ) {
      throw new Error(
        "Duplicate sale items are not allowed.",
      );
    }

    const existingReturns =
      await prisma.saleReturnItem.findMany({
        where: {
          saleReturn: {
            businessId: input.businessId,
            saleId: input.saleId,
            status: "COMPLETED",
          },
        },
      });

    const returnedQuantities = new Map<
      string,
      number
    >();

    for (const item of existingReturns) {
      returnedQuantities.set(
        item.saleItemId,
        (returnedQuantities.get(
          item.saleItemId,
        ) ?? 0) + Number(item.quantity),
      );
    }

    const returnItems: Array<{
  saleItem: (typeof sale.items)[number];
  quantity: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}> = [];

    for (const requestItem of input.items) {
      if (requestItem.quantity <= 0) {
        throw new Error(
          "Return quantity must be greater than zero.",
        );
      }

      const saleItem = sale.items.find(
        (item) =>
          item.id === requestItem.saleItemId,
      );

      if (!saleItem) {
        throw new Error(
          `Sale item ${requestItem.saleItemId} was not found.`,
        );
      }

      const alreadyReturned =
        returnedQuantities.get(
          saleItem.id,
        ) ?? 0;

      const originalQuantity =
        Number(saleItem.quantity);

      if (
        alreadyReturned +
          requestItem.quantity >
        originalQuantity
      ) {
        throw new Error(
          `Return quantity for ${saleItem.productName} exceeds the quantity sold.`,
        );
      }

      const ratio =
        requestItem.quantity /
        originalQuantity;

      returnItems.push({
        saleItem,
        quantity: requestItem.quantity,
        subtotal:
          Number(saleItem.unitPrice) *
          requestItem.quantity,
        discountAmount:
          Number(saleItem.discountAmount) *
          ratio,
        taxAmount:
          Number(saleItem.taxAmount) *
          ratio,
        totalAmount:
          Number(saleItem.totalAmount) *
          ratio,
      });
    }

    const subtotal = returnItems.reduce(
      (total, item) =>
        total + item.subtotal,
      0,
    );

    const discountAmount =
      returnItems.reduce(
        (total, item) =>
          total + item.discountAmount,
        0,
      );

    const originalTaxAmount =
      returnItems.reduce(
        (total, item) =>
          total + item.taxAmount,
        0,
      );

    const taxConfiguration =
      await taxConfigurationService.get(
        input.businessId,
      );

    const taxCalculation = calculateTax({
      subtotal,
      discountAmount,
      taxEnabled:
        sale.taxAmount.toString() !== "0",
      taxRate:
        sale.taxRate !== null
          ? Number(sale.taxRate)
          : 0,
      pricingMode:
        sale.taxPricingMode ??
        taxConfiguration.pricingMode,
    });

    const taxAmount =
      originalTaxAmount > 0
        ? taxCalculation.taxAmount
        : 0;

    const totalAmount =
      taxAmount > 0
        ? taxCalculation.totalAmount
        : subtotal - discountAmount;

    const referenceNumber =
  await generateBusinessReference({
    businessId: input.businessId,
    referenceType: "SALE_RETURN",
    prefix: "RET",
  });

    const saleReturn = await prisma.$transaction(
  async (tx) => {
    return tx.saleReturn.create({
      data: {
        businessId: input.businessId,
        saleId: input.saleId,
        warehouseId:
          input.warehouseId ??
          sale.warehouseId ??
          null,
        referenceNumber,
        status: "COMPLETED",
        currency: input.currency,
        exchangeRate:
          input.exchangeRate ??
          sale.exchangeRate ??
          null,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        reason: input.reason?.trim() || null,
        notes: input.notes?.trim() || null,
        createdBy: input.createdBy,
        items: {
          create: returnItems.map(
            (item) => ({
              saleItemId:
                item.saleItem.id,
              productId:
                item.saleItem.productId,
              productName:
                item.saleItem.productName,
              sku:
                item.saleItem.sku ??
                null,
              quantity:
                item.quantity,
              unitPrice:
                Number(
                  item.saleItem.unitPrice,
                ),
              discountAmount:
                item.discountAmount,
              taxAmount:
                item.taxAmount,
              totalAmount:
                item.totalAmount,
              sellingUnitId:
                item.saleItem.sellingUnitId ??
                null,
            }),
          ),
        },
      },
      include: {
        items: true,
      },
    });
  },
);

if (!sale.warehouseId) {
  throw new Error(
    "Completed sale has no warehouse for stock return.",
  );
}

const { productService } =
  await import(
    "@/lib/inventory/productService"
  );

const { inventoryService } =
  await import(
    "@/lib/inventory/inventoryService"
  );

const inventoryItems: Array<{
  productId: string;
  quantity: number;
}> = [];

for (const item of returnItems) {
  if (item.saleItem.menuItemId) {
    continue;
  }

  let inventoryQuantity =
    item.quantity;

  if (item.saleItem.sellingUnitId) {
    const sellingUnit =
      await productService.findSellingUnitById(
        item.saleItem.productId,
        item.saleItem.sellingUnitId,
      );

    if (!sellingUnit) {
      throw new Error(
        `Selling unit not found for product "${item.saleItem.productName}".`,
      );
    }

    inventoryQuantity =
      item.quantity *
      Number(sellingUnit.quantity);
  }

  inventoryItems.push({
    productId:
      item.saleItem.productId,
    quantity:
      inventoryQuantity,
  });
}

if (inventoryItems.length > 0) {
  await inventoryService.returnStockBatch({
    businessId:
      input.businessId,
    warehouseId:
      sale.warehouseId,
    currency:
      input.currency,
    createdBy:
      input.createdBy,
    referenceType:
      "SALE_RETURN",
    referenceId:
      saleReturn.id,
    notes:
      `Stock returned from sale ${sale.referenceNumber}.`,
    items:
      inventoryItems,
  });
}

return saleReturn;
  },
};