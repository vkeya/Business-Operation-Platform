import type {
  ImportRow,
  ImportSourceColumn,
} from "../types";

export interface ParsedCsvImport {
  columns: ImportSourceColumn[];
  rows: ImportRow[];
}

function normalizeColumnKey(
  value: string,
  index: number,
): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || `column_${index + 1}`;
}

function parseCsvLine(
  line: string,
): string[] {
  const values: string[] = [];

  let currentValue = "";
  let insideQuotes = false;

  for (
    let index = 0;
    index < line.length;
    index += 1
  ) {
    const character =
      line[index];

    if (character === "\"") {
      if (
        insideQuotes &&
        line[index + 1] === "\""
      ) {
        currentValue += "\"";
        index += 1;
        continue;
      }

      insideQuotes =
        !insideQuotes;

      continue;
    }

    if (
      character === "," &&
      !insideQuotes
    ) {
      values.push(
        currentValue.trim(),
      );

      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  values.push(
    currentValue.trim(),
  );

  return values;
}

export function parseCsvImport(
  content: string,
): ParsedCsvImport {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter(
      (line) =>
        line.trim().length > 0,
    );

  if (lines.length === 0) {
    return {
      columns: [],
      rows: [],
    };
  }

  const headers =
    parseCsvLine(lines[0]);

  const columns =
    headers.map(
      (label, index) => ({
        key:
          normalizeColumnKey(
            label,
            index,
          ),
        label:
          label.trim(),
        index,
      }),
    );

  const rows =
    lines
      .slice(1)
      .map(
        (line, rowIndex) => {
          const values =
            parseCsvLine(line);

          const rowValues:
            Record<string, unknown> =
            {};

          columns.forEach(
            (column, columnIndex) => {
              rowValues[
                column.key
              ] =
                values[columnIndex] ??
                "";
            },
          );

          return {
            rowNumber:
              rowIndex + 2,
            values:
              rowValues,
          };
        },
      );

  return {
    columns,
    rows,
  };
}