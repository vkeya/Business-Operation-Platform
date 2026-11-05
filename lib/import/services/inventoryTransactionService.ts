import type { ImportRow } from "../types";

import { prisma } from "@/lib/database/prisma";
import { recordInventoryImportAudit } from "./inventoryImportAuditService";

const INVENTORY_IMPORT_BATCH_SIZE = 100;

export interface InventoryTransactionResult {
  importedCount: number;
  productIds: string[];
}

function readString(value: unknown): string {
  return String(value ?? "").trim();
}

function readNumber(value: unknown): number {
  return Number(value ?? 0);
}

function readBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = readString(value).toLowerCase();

  if (["false", "no", "0"].includes(normalized)) {
    return false;
  }

  return true;
}

export interface InventoryTransactionInput {
  businessId: string;
  createdBy: string;
  rows: ImportRow[];
}

interface PreparedInventoryRecord {
  rowNumber: number;
  name: string;
  sku: string;
  barcode?: string;
  type: "PRODUCT" | "SERVICE";
  description?: string;
  unit: string;
  quantity: number;
  unitCost: number;
  warehouseName: string;
  costPrice: number;
  sellingPrice: number;
  retailPrice?: number;
  wholesalePrice?: number;
  minimumPrice?: number;
  rate1Price?: number;
  rate2Price?: number;
  rate3Price?: number;
  rate4Price?: number;
  currency: string;
  taxRate?: number;
  taxCode?: string;
  trackInventory: boolean;
  minimumStock?: number;
  reorderLevel?: number;
  warehouseId?: string;
}

export async function executeInventoryImportTransaction(
  input: InventoryTransactionInput,
): Promise<InventoryTransactionResult> {
  const businessId = input.businessId.trim();
  const createdBy = input.createdBy.trim();

  if (!businessId) {
    throw new Error("Business ID is required.");
  }

  if (!createdBy) {
    throw new Error("Created by user ID is required.");
  }

  if (input.rows.length === 0) {
    return {
      importedCount: 0,
      productIds: [],
    };
  }

  /*
   * Prepare and validate the complete import before writing anything.
   * This keeps validation deterministic while allowing database writes to
   * happen in bounded transactions below.
   */
  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
    },
    select: {
      id: true,
      baseCurrency: true,
    },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  const warehouses = await prisma.warehouse.findMany({
    where: {
      businessId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (warehouses.length === 0) {
    throw new Error("No active warehouse exists for this business.");
  }

  const defaultWarehouse =
    warehouses.find(
      (warehouse) => warehouse.code.toUpperCase() === "MAIN",
    ) ?? warehouses[0];

  const records: PreparedInventoryRecord[] = input.rows.map((row) => {
    const values = row.values;

    const name = readString(values.name);

    const sourceProductId = readString(values.productId);

    const sku =
      readString(values.sku).toUpperCase() ||
      (sourceProductId
        ? `PROD-${sourceProductId}`.toUpperCase()
        : "");

    const unit = readString(values.unit);

    const currency =
      readString(values.currency) || business.baseCurrency;

    const warehouseName = readString(values.warehouse);

    const quantity =
      values.quantity === undefined ||
      readString(values.quantity) === ""
        ? 0
        : readNumber(values.quantity);

    const unitCost = readNumber(
      values.unitCost ?? values.costPrice,
    );

    if (!name) {
      throw new Error(
        `Row ${row.rowNumber}: Product name is required.`,
      );
    }

    if (!sku) {
      throw new Error(
        `Row ${row.rowNumber}: SKU or Product ID is required.`,
      );
    }

    if (!unit) {
      throw new Error(
        `Row ${row.rowNumber}: Unit is required.`,
      );
    }

    if (!Number.isFinite(quantity)) {
      throw new Error(
        `Row ${row.rowNumber}: Opening quantity must be a valid number.`,
      );
    }

    if (quantity < 0) {
      throw new Error(
        `Row ${row.rowNumber}: Opening quantity cannot be negative.`,
      );
    }

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      throw new Error(
        `Row ${row.rowNumber}: Unit cost must be a valid non-negative number.`,
      );
    }

    const warehouse =
      readString(values.type).toUpperCase() === "SERVICE" ||
      !readBoolean(values.trackInventory) ||
      quantity <= 0
        ? undefined
        : warehouses.find(
              (candidate) =>
                candidate.name.trim().toLowerCase() ===
                warehouseName.trim().toLowerCase(),
            ) ??
          warehouses.find(
            (candidate) =>
              candidate.code.trim().toLowerCase() ===
              warehouseName.trim().toLowerCase(),
          ) ??
          (!warehouseName
            ? defaultWarehouse
            : warehouses.length === 1
              ? warehouses[0]
              : undefined);

    if (
      readString(values.type).toUpperCase() !== "SERVICE" &&
      readBoolean(values.trackInventory) &&
      quantity > 0 &&
      !warehouse
    ) {
      throw new Error(
        `Row ${row.rowNumber}: Warehouse "${warehouseName}" was not found for this business. Select a valid warehouse mapping before importing.`,
      );
    }

    return {
      rowNumber: row.rowNumber,
      name,
      sku,
      barcode: readString(values.barcode) || undefined,
      type:
        readString(values.type).toUpperCase() === "SERVICE"
          ? "SERVICE"
          : "PRODUCT",
      description: readString(values.description) || undefined,
      unit,
      quantity,
      unitCost,
      warehouseName,
      costPrice: unitCost,
      sellingPrice: readNumber(values.sellingPrice),
      retailPrice:
        values.retailPrice === undefined ||
        readString(values.retailPrice) === ""
          ? undefined
          : readNumber(values.retailPrice),
      wholesalePrice:
        values.wholesalePrice === undefined ||
        readString(values.wholesalePrice) === ""
          ? undefined
          : readNumber(values.wholesalePrice),
      minimumPrice:
        values.minimumPrice === undefined ||
        readString(values.minimumPrice) === ""
          ? undefined
          : readNumber(values.minimumPrice),
      rate1Price:
        values.rate1Price === undefined ||
        readString(values.rate1Price) === ""
          ? undefined
          : readNumber(values.rate1Price),
      rate2Price:
        values.rate2Price === undefined ||
        readString(values.rate2Price) === ""
          ? undefined
          : readNumber(values.rate2Price),
      rate3Price:
        values.rate3Price === undefined ||
        readString(values.rate3Price) === ""
          ? undefined
          : readNumber(values.rate3Price),
      rate4Price:
        values.rate4Price === undefined ||
        readString(values.rate4Price) === ""
          ? undefined
          : readNumber(values.rate4Price),
      currency,
      taxRate:
        values.taxRate === undefined ||
        readString(values.taxRate) === ""
          ? undefined
          : readNumber(values.taxRate),
      taxCode: readString(values.taxCode) || undefined,
      trackInventory: readBoolean(values.trackInventory),
      minimumStock:
        values.minimumStock === undefined ||
        readString(values.minimumStock) === ""
          ? undefined
          : readNumber(values.minimumStock),
      reorderLevel:
        values.reorderLevel === undefined ||
        readString(values.reorderLevel) === ""
          ? undefined
          : readNumber(values.reorderLevel),
      warehouseId: warehouse?.id,
    };
  });

  const seenSkus = new Set<string>();

  for (const record of records) {
    if (seenSkus.has(record.sku)) {
      throw new Error(
        `Duplicate SKU "${record.sku}" found in the import file (row ${record.rowNumber}).`,
      );
    }

    seenSkus.add(record.sku);
  }

  const existingProducts = await prisma.product.findMany({
    where: {
      businessId,
      sku: {
        in: records.map((record) => record.sku),
      },
    },
    select: {
      sku: true,
    },
  });

  console.log(
    "[Inventory Import] Existing SKU check:",
    existingProducts,
  );

  if (existingProducts.length > 0) {
    const existingSkus = existingProducts
      .map((product) => product.sku)
      .join(", ");

    throw new Error(
      `The following SKU(s) already exist: ${existingSkus}.`,
    );
  }

  const productIds: string[] = [];

  for (
    let start = 0;
    start < records.length;
    start += INVENTORY_IMPORT_BATCH_SIZE
  ) {
    const batch = records.slice(
      start,
      start + INVENTORY_IMPORT_BATCH_SIZE,
    );

    const batchResult = await prisma.$transaction(
      async (tx) => {
        const createdProducts = await tx.product.createManyAndReturn({
          data: batch.map((record) => ({
            businessId,
            name: record.name,
            sku: record.sku,
            barcode: record.barcode,
            type: record.type,
            description: record.description,
            unit: record.unit,
            costPrice: record.costPrice,
            sellingPrice:
              record.retailPrice ?? record.sellingPrice,
            currency: record.currency,
            taxRate: record.taxRate,
            taxCode: record.taxCode,
            trackInventory: record.trackInventory,
            minimumStock: record.minimumStock,
            reorderLevel: record.reorderLevel,
          })),
          select: {
            id: true,
            sku: true,
          },
        });

        const productIdBySku = new Map(
          createdProducts.map((product) => [
            product.sku,
            product.id,
          ]),
        );

        const productPrices: Array<{
          productId: string;
          type:
            | "RETAIL"
            | "WHOLESALE"
            | "MINIMUM"
            | "RATE_1"
            | "RATE_2"
            | "RATE_3"
            | "RATE_4";
          price: number;
          currency: string;
        }> = [];

        const inventoryOpeningBalances: Array<{
          productId: string;
          warehouseId: string;
          quantity: number;
          unitCost: number;
          totalCost: number;
          currency: string;
        }> = [];

        for (const record of batch) {
          const productId = productIdBySku.get(record.sku);

          if (!productId) {
            throw new Error(
              `Unable to resolve the created product for SKU "${record.sku}".`,
            );
          }

          const prices = [
            {
              type: "RETAIL" as const,
              price: record.retailPrice,
            },
            {
              type: "WHOLESALE" as const,
              price: record.wholesalePrice,
            },
            {
              type: "MINIMUM" as const,
              price: record.minimumPrice,
            },
            {
              type: "RATE_1" as const,
              price: record.rate1Price,
            },
            {
              type: "RATE_2" as const,
              price: record.rate2Price,
            },
            {
              type: "RATE_3" as const,
              price: record.rate3Price,
            },
            {
              type: "RATE_4" as const,
              price: record.rate4Price,
            },
          ];

          for (const price of prices) {
            if (
              price.price === undefined ||
              !Number.isFinite(price.price)
            ) {
              continue;
            }

            productPrices.push({
              productId,
              type: price.type,
              price: price.price,
              currency: record.currency,
            });
          }

          if (
            record.type === "PRODUCT" &&
            record.trackInventory &&
            record.quantity > 0
          ) {
            if (!record.warehouseId) {
              throw new Error(
                `Row ${record.rowNumber}: Warehouse could not be resolved.`,
              );
            }

            inventoryOpeningBalances.push({
              productId,
              warehouseId: record.warehouseId,
              quantity: record.quantity,
              unitCost: record.unitCost,
              totalCost:
                record.quantity * record.unitCost,
              currency: record.currency,
            });
          }
        }

        if (productPrices.length > 0) {
          await tx.productPrice.createMany({
            data: productPrices,
          });
        }

        if (inventoryOpeningBalances.length > 0) {
          await tx.inventoryMovement.createMany({
            data: inventoryOpeningBalances.map((opening) => ({
              businessId,
              productId: opening.productId,
              warehouseId: opening.warehouseId,
              type: "RECEIPT" as const,
              quantity: opening.quantity,
              unitCost: opening.unitCost,
              totalCost: opening.totalCost,
              referenceType: "INVENTORY_IMPORT",
              createdBy,
              notes: "Opening inventory imported from spreadsheet.",
            })),
          });

          await tx.inventoryBalance.createMany({
            data: inventoryOpeningBalances.map((opening) => ({
              businessId,
              productId: opening.productId,
              warehouseId: opening.warehouseId,
              quantity: opening.quantity,
              reservedQuantity: 0,
              averageCost: opening.unitCost,
              currency: opening.currency,
            })),
          });
        }

        return createdProducts.map((product) => product.id);
      },
      {
        maxWait: 10000,
        timeout: 120000,
      },
    );

    productIds.push(...batchResult);
  }

  /*
   * The product/inventory writes are now committed in bounded transactions.
   * Record the single import-level audit event after all batches succeed.
   */
  await prisma.$transaction(async (tx) => {
    await recordInventoryImportAudit(tx, {
      businessId,
      createdBy,
      productIds,
      importedCount: productIds.length,
    });
  });

  return {
    importedCount: productIds.length,
    productIds,
  };
}
