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

      const sku =
        readString(values.sku)
          .toUpperCase();

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