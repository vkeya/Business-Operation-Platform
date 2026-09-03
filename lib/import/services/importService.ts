import type {
  ImportDefinition,
  ImportFieldDefinition,
  ImportFieldMapping,
  ImportPreview,
  ImportRow,
} from "../types";

import {
  suggestFieldMappings,
} from "../mapping/fieldMapper";

import {
  buildImportPreview,
} from "../preview/importPreview";

import {
  parseCsvImport,
} from "../parsers/csvParser";

export interface ImportAnalysisResult {
  mappings: ImportFieldMapping[];
  mappedRows: ImportRow[];
  preview: ImportPreview;
}

export interface ImportMappedAnalysisResult {
  mappedRows: ImportRow[];
  preview: ImportPreview;
}

function applyMappings(
  rows: ImportRow[],
  mappings: ImportFieldMapping[],
): ImportRow[] {
  return rows.map((row) => {
    const mappedValues:
      Record<string, unknown> = {};

    for (
      const mapping of mappings
    ) {
      mappedValues[
        mapping.targetField
      ] =
        row.values[
          mapping.sourceColumn
        ];
    }

    return {
      rowNumber:
        row.rowNumber,
      values:
        mappedValues,
    };
  });
}

export function analyzeImportWithMappings(
  rows: ImportRow[],
  fields: ImportFieldDefinition[],
  mappings: ImportFieldMapping[],
): ImportMappedAnalysisResult {
  const mappedRows =
    applyMappings(
      rows,
      mappings,
    );

  const preview =
    buildImportPreview(
      mappedRows,
      fields,
    );

  return {
    mappedRows,
    preview,
  };
}

export function analyzeCsvImport(
  content: string,
  definition: ImportDefinition,
): ImportAnalysisResult {
  const parsed =
    parseCsvImport(content);

  const mappings =
    suggestFieldMappings(
      parsed.columns,
      definition.fields,
    );

  const analysis =
    analyzeImportWithMappings(
      parsed.rows,
      definition.fields,
      mappings,
    );

  return {
    mappings,
    mappedRows:
      analysis.mappedRows,
    preview:
      analysis.preview,
  };
}