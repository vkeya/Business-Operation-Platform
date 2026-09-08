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

  // Only suggest a fallback when the source and target
  // share a meaningful multi-word phrase. A single shared
  // word is too weak and can produce incorrect mappings such
  // as "Purchase Unit" -> "Unit Cost".
  const sourceWords =
    getWords(sourceColumn.label);

  if (sourceWords.length < 2) {
    return undefined;
  }

  return fields.find((field) => {
    const fieldWords = Array.from(
      new Set([
        ...getWords(field.key),
        ...getWords(field.label),
      ]),
    );

    const sharedWords =
      sourceWords.filter((word) =>
        fieldWords.includes(word),
      );

    return sharedWords.length >= 2;
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