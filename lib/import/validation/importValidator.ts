import type {
  ImportFieldDefinition,
  ImportRow,
  ImportValidationError,
} from "../types";

function isEmpty(
  value: unknown,
): boolean {
  return (
    value === undefined ||
    value === null ||
    value === ""
  );
}

function isValidNumber(
  value: unknown,
): boolean {
  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value);
  }

  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return false;
  }

  const normalized =
    value
      .trim()
      .replace(/,/g, "");

  return (
    Number.isFinite(
      Number(normalized),
    )
  );
}

function isValidEmail(
  value: unknown,
): boolean {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim(),
  );
}

function isValidBoolean(
  value: unknown,
): boolean {
  if (
    typeof value === "boolean"
  ) {
    return true;
  }

  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return [
    "true",
    "false",
    "yes",
    "no",
    "1",
    "0",
  ].includes(
    value.trim().toLowerCase(),
  );
}

function isValidDate(
  value: unknown,
): boolean {
  if (
    value instanceof Date
  ) {
    return !Number.isNaN(
      value.getTime(),
    );
  }

  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return false;
  }

  const date =
    new Date(value);

  return !Number.isNaN(
    date.getTime(),
  );
}

function isValidFieldValue(
  value: unknown,
  type:
    | "string"
    | "number"
    | "currency"
    | "date"
    | "boolean"
    | "email"
    | "reference",
): boolean {
  switch (type) {
    case "number":
    case "currency":
      return isValidNumber(value);

    case "email":
      return isValidEmail(value);

    case "boolean":
      return isValidBoolean(value);

    case "date":
      return isValidDate(value);

    case "string":
    case "reference":
      return (
        typeof value === "string" ||
        typeof value === "number"
      );

    default:
      return true;
  }
}

export function validateImportRow(
  row: ImportRow,
  fields: ImportFieldDefinition[],
): ImportValidationError[] {
  const errors:
    ImportValidationError[] =
    [];

  for (
    const field of fields
  ) {
    const value =
      row.values[field.key];

    if (
      field.required &&
      isEmpty(value)
    ) {
      errors.push({
        row: row.rowNumber,
        field: field.key,
        value,
        message:
          `${field.label} is required.`,
      });

      continue;
    }

    if (
      isEmpty(value)
    ) {
      continue;
    }

    if (
      !isValidFieldValue(
        value,
        field.type,
      )
    ) {
      errors.push({
        row: row.rowNumber,
        field: field.key,
        value,
        message:
          `${field.label} has an invalid value.`,
      });
    }
  }

  return errors;
}

export function validateImportRows(
  rows: ImportRow[],
  fields: ImportFieldDefinition[],
): ImportValidationError[] {
  return rows.flatMap(
    (row) =>
      validateImportRow(
        row,
        fields,
      ),
  );
}