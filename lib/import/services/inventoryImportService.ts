import type {
  ImportFieldDefinition,
  ImportRow,
} from "../types";

export interface InventoryImportRecord {
  rowNumber: number;
  values: Record<string, unknown>;
}

export interface InventoryImportPreparation {
  records: InventoryImportRecord[];
  totalRecords: number;
}

export function prepareInventoryImport(
  rows: ImportRow[],
  fields: ImportFieldDefinition[],
): InventoryImportPreparation {
  const allowedFields =
    new Set(
      fields.map(
        (field) => field.key,
      ),
    );

  const records =
    rows.map((row) => {
      const values:
        Record<string, unknown> =
        {};

      for (const field of fields) {
        if (!allowedFields.has(field.key)) {
          continue;
        }

        values[field.key] =
          row.values[field.key] ??
          "";
      }

      return {
        rowNumber:
          row.rowNumber,
        values,
      };
    });

  return {
    records,
    totalRecords:
      records.length,
  };
}