export type ImportEntityType =
  | "inventory"
  | "suppliers"
  | "customers"
  | "purchases"
  | "sales"
  | "expenses"
  | "payments"
  | "accounting";

export type ImportFileType =
  | "csv"
  | "xlsx"
  | "xls";

export type ImportStatus =
  | "draft"
  | "uploaded"
  | "mapped"
  | "validated"
  | "ready"
  | "importing"
  | "completed"
  | "failed";

export type ImportFieldType =
  | "string"
  | "number"
  | "currency"
  | "date"
  | "boolean"
  | "email"
  | "reference";

export interface ImportFieldDefinition {
  key: string;
  label: string;
  type: ImportFieldType;
  required?: boolean;
  description?: string;
}

export interface ImportSourceColumn {
  key: string;
  label: string;
  index: number;
}

export interface ImportFieldMapping {
  sourceColumn: string;
  targetField: string;
}

export interface ImportValidationError {
  row: number;
  field?: string;
  message: string;
  value?: unknown;
}

export interface ImportValidationWarning {
  row: number;
  field?: string;
  message: string;
}

export interface ImportRow {
  rowNumber: number;
  values: Record<string, unknown>;
}

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningRows: number;
  rows: ImportRow[];
  errors: ImportValidationError[];
  warnings: ImportValidationWarning[];
}

export interface ImportConfiguration {
  entityType: ImportEntityType;
  fileType: ImportFileType;
  fields: ImportFieldDefinition[];
  mappings: ImportFieldMapping[];
}

export interface ImportResult {
  status: "completed" | "failed";
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: ImportValidationError[];
}

export interface ImportDefinition {
  entityType: ImportEntityType;
  label: string;
  description: string;
  fields: ImportFieldDefinition[];
}