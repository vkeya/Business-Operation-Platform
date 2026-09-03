import type {
  ImportFieldDefinition,
  ImportFieldMapping,
  ImportSourceColumn,
} from "../types";
import {
  getFieldAliases,
} from "./fieldAliases";

function normalizeValue(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getWords(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean);
}

export function findExactFieldMatch(
  sourceColumn: ImportSourceColumn,
  fields: ImportFieldDefinition[],
): ImportFieldDefinition | undefined {
  const normalizedSource =
    normalizeValue(sourceColumn.label);

  return fields.find(
    (field) =>
      normalizeValue(field.key) ===
        normalizedSource ||
      normalizeValue(field.label) ===
        normalizedSource,
  );
}

export function findAliasFieldMatch(
  sourceColumn: ImportSourceColumn,
  fields: ImportFieldDefinition[],
): ImportFieldDefinition | undefined {
  const normalizedSource =
    normalizeValue(sourceColumn.label);

  return fields.find((field) => {
    const aliases =
      getFieldAliases(field.key);

    return aliases.some(
      (alias) =>
        normalizeValue(alias) ===
        normalizedSource,
    );
  });
}

export function findSuggestedFieldMatch(
  sourceColumn: ImportSourceColumn,
  fields: ImportFieldDefinition[],
): ImportFieldDefinition | undefined {
  const exactMatch =
    findExactFieldMatch(
      sourceColumn,
      fields,
    );

  if (exactMatch) {
    return exactMatch;
  }

  const aliasMatch =
    findAliasFieldMatch(
      sourceColumn,
      fields,
    );

  if (aliasMatch) {
    return aliasMatch;
  }

  const sourceWords =
    getWords(sourceColumn.label);

  return fields.find((field) => {
    const fieldWords = [
      ...getWords(field.key),
      ...getWords(field.label),
    ];

    return sourceWords.some(
      (sourceWord) =>
        fieldWords.includes(
          sourceWord,
        ),
    );
  });
}

export function suggestFieldMappings(
  sourceColumns: ImportSourceColumn[],
  fields: ImportFieldDefinition[],
): ImportFieldMapping[] {
  const usedTargetFields =
    new Set<string>();

  const mappings: ImportFieldMapping[] =
    [];

  for (
    const sourceColumn of sourceColumns
  ) {
    const match =
      findSuggestedFieldMatch(
        sourceColumn,
        fields,
      );

    if (
      match &&
      !usedTargetFields.has(
        match.key,
      )
    ) {
      mappings.push({
        sourceColumn:
          sourceColumn.key,
        targetField:
          match.key,
      });

      usedTargetFields.add(
        match.key,
      );
    }
  }

  return mappings;
}