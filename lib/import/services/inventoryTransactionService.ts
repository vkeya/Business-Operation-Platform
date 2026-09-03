import type { ImportRow } from "../types";

import { prisma } from "@/lib/database/prisma";
import { recordInventoryImportAudit } from "./inventoryImportAuditService";

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

  return prisma.$transaction(async (tx) => {
    const business = await tx.business.findUnique({
      where: {
        id: businessId,
      },
      select: {
        id: true,
      },
    });

    if (!business) {
      throw new Error("Business not found.");
    }

    const records = input.rows.map((row) => {
      const values = row.values;

      const name = readString(values.name);
      const sku = readString(values.sku).toUpperCase();
      const unit = readString(values.unit);
      const currency = readString(values.currency);

      if (!name) {
        throw new Error(
          `Row ${row.rowNumber}: Product name is required.`,
        );
      }

      if (!sku) {
        throw new Error(
          `Row ${row.rowNumber}: SKU is required.`,
        );
      }

      if (!unit) {
        throw new Error(
          `Row ${row.rowNumber}: Unit is required.`,
        );
      }

      if (!currency) {
        throw new Error(
          `Row ${row.rowNumber}: Currency is required.`,
        );
      }

      return {
        rowNumber: row.rowNumber,
        name,
        sku,
        barcode:
          readString(values.barcode) || undefined,
        type:
          readString(values.type).toUpperCase() === "SERVICE"
            ? ("SERVICE" as const)
            : ("PRODUCT" as const),
        description:
          readString(values.description) || undefined,
        unit,
        costPrice: readNumber(values.costPrice),
        sellingPrice: readNumber(values.sellingPrice),
        currency,
        taxRate:
          values.taxRate === undefined ||
          readString(values.taxRate) === ""
            ? undefined
            : readNumber(values.taxRate),
        taxCode:
          readString(values.taxCode) || undefined,
        trackInventory: readBoolean(
          values.trackInventory,
        ),
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

    const existingProducts = await tx.product.findMany({
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

    if (existingProducts.length > 0) {
      const existingSkus = existingProducts
        .map((product) => product.sku)
        .join(", ");

      throw new Error(
        `The following SKU(s) already exist: ${existingSkus}.`,
      );
    }

    const productIds: string[] = [];

    for (const record of records) {
      const product = await tx.product.create({
        data: {
          businessId,
          name: record.name,
          sku: record.sku,
          barcode: record.barcode,
          type: record.type,
          description: record.description,
          unit: record.unit,
          costPrice: record.costPrice,
          sellingPrice: record.sellingPrice,
          currency: record.currency,
          taxRate: record.taxRate,
          taxCode: record.taxCode,
          trackInventory: record.trackInventory,
          minimumStock: record.minimumStock,
          reorderLevel: record.reorderLevel,
        },
        select: {
          id: true,
        },
      });

      productIds.push(product.id);
    }
	
	await recordInventoryImportAudit(tx, {
  businessId,
  createdBy,
  productIds,
  importedCount: productIds.length,
});

    return {
      importedCount: productIds.length,
      productIds,
    };
  });
}