import type {
  ImportFieldDefinition,
  ImportPreview,
  ImportRow,
  ImportValidationError,
  ImportValidationWarning,
} from "../types";
import {
  validateImportRows,
} from "../validation/importValidator";

function getRowsWithErrors(
  errors: ImportValidationError[],
): Set<number> {
  return new Set(
    errors.map(
      (error) => error.row,
    ),
  );
}

function getRowsWithWarnings(
  warnings: ImportValidationWarning[],
): Set<number> {
  return new Set(
    warnings.map(
      (warning) => warning.row,
    ),
  );
}

export function buildImportPreview(
  rows: ImportRow[],
  fields: ImportFieldDefinition[],
  warnings: ImportValidationWarning[] = [],
): ImportPreview {
  const errors =
    validateImportRows(
      rows,
      fields,
    );

  const errorRows =
    getRowsWithErrors(
      errors,
    );

  const warningRows =
    getRowsWithWarnings(
      warnings,
    );

  const validRows =
    rows.filter(
      (row) =>
        !errorRows.has(
          row.rowNumber,
        ),
    ).length;

  const invalidRows =
    errorRows.size;

  return {
    totalRows:
      rows.length,

    validRows,

    invalidRows,

    warningRows:
      warningRows.size,

    rows,

    errors,

    warnings,
  };
}