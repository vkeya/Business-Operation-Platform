import type {
  ImportRow,
} from "../types";

export interface InventoryDatabaseImportRecord {
  rowNumber: number;
  name: string;
  sku: string;
  barcode?: string;
  type: "PRODUCT" | "SERVICE";
  description?: string;
  unit: string;
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
}

export interface InventoryDatabaseImportPreparation {
  records: InventoryDatabaseImportRecord[];
  duplicateSkus: string[];
}

function readString(
  value: unknown,
): string {
  return String(value ?? "").trim();
}

function readNumber(
  value: unknown,
): number {
  return Number(value ?? 0);
}

function readBoolean(
  value: unknown,
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized =
    readString(value).toLowerCase();

  if (
    ["false", "no", "0"].includes(
      normalized,
    )
  ) {
    return false;
  }

  return true;
}

export function prepareInventoryDatabaseImport(
  rows: ImportRow[],
): InventoryDatabaseImportPreparation {
  const seenSkus =
    new Set<string>();

  const duplicateSkus =
    new Set<string>();

  const records =
    rows.map((row) => {
      const values =
        row.values;

      const sourceProductId =
  readString(values.productId);

const sku =
  readString(values.sku)
    .toUpperCase() ||
  (sourceProductId
    ? `PROD-${sourceProductId}`.toUpperCase()
    : "");

      if (seenSkus.has(sku)) {
        duplicateSkus.add(sku);
      }

      seenSkus.add(sku);

      return {
        rowNumber:
          row.rowNumber,
        name:
          readString(
            values.name,
          ),
        sku,
        barcode:
          readString(
            values.barcode,
          ) || undefined,
        type:
  readString(values.type).toUpperCase() ===
  "SERVICE"
    ? ("SERVICE" as const)
    : ("PRODUCT" as const),
        description:
          readString(
            values.description,
          ) || undefined,
        unit:
          readString(
            values.unit,
          ),
        costPrice:
          readNumber(
            values.costPrice,
          ),
        sellingPrice:
          readNumber(
            values.sellingPrice,
          ),
		          retailPrice:
          values.retailPrice ===
          undefined
            ? undefined
            : readNumber(
                values.retailPrice,
              ),
        wholesalePrice:
          values.wholesalePrice ===
          undefined
            ? undefined
            : readNumber(
                values.wholesalePrice,
              ),
        minimumPrice:
          values.minimumPrice ===
          undefined
            ? undefined
            : readNumber(
                values.minimumPrice,
              ),
        rate1Price:
          values.rate1Price ===
          undefined
            ? undefined
            : readNumber(
                values.rate1Price,
              ),
        rate2Price:
          values.rate2Price ===
          undefined
            ? undefined
            : readNumber(
                values.rate2Price,
              ),
        rate3Price:
          values.rate3Price ===
          undefined
            ? undefined
            : readNumber(
                values.rate3Price,
              ),
        rate4Price:
          values.rate4Price ===
          undefined
            ? undefined
            : readNumber(
                values.rate4Price,
              ),
        currency:
          readString(
            values.currency,
          ),
        taxRate:
          values.taxRate ===
          undefined
            ? undefined
            : readNumber(
                values.taxRate,
              ),
        taxCode:
          readString(
            values.taxCode,
          ) || undefined,
        trackInventory:
          readBoolean(
            values.trackInventory,
          ),
        minimumStock:
          values.minimumStock ===
          undefined
            ? undefined
            : readNumber(
                values.minimumStock,
              ),
        reorderLevel:
          values.reorderLevel ===
          undefined
            ? undefined
            : readNumber(
                values.reorderLevel,
              ),
      };
    });

  return {
    records,
    duplicateSkus:
      Array.from(
        duplicateSkus,
      ),
  };
}