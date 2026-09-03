"use client";

import type {
  ImportFieldDefinition,
  ImportFieldMapping,
  ImportSourceColumn,
} from "@/lib/import/types";

interface ImportMappingReviewProps {
  columns: ImportSourceColumn[];
  fields: ImportFieldDefinition[];
  mappings: ImportFieldMapping[];
  onChange: (
    mappings: ImportFieldMapping[],
  ) => void;
}

export default function ImportMappingReview({
  columns,
  fields,
  mappings,
  onChange,
}: ImportMappingReviewProps) {
  function getMapping(
    sourceColumn: string,
  ) {
    return mappings.find(
      (mapping) =>
        mapping.sourceColumn ===
        sourceColumn,
    );
  }

  function handleMappingChange(
    sourceColumn: string,
    targetField: string,
  ) {
    const existingMapping =
      getMapping(sourceColumn);

    if (!targetField) {
      onChange(
        mappings.filter(
          (mapping) =>
            mapping.sourceColumn !==
            sourceColumn,
        ),
      );

      return;
    }

    const remainingMappings =
      mappings.filter(
        (mapping) =>
          mapping.sourceColumn !==
            sourceColumn &&
          mapping.targetField !==
            targetField,
      );

    const nextMapping: ImportFieldMapping =
      {
        sourceColumn,
        targetField,
      };

    if (existingMapping) {
      onChange([
        ...remainingMappings,
        nextMapping,
      ]);

      return;
    }

    onChange([
      ...remainingMappings,
      nextMapping,
    ]);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Step 2
        </p>

        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          Review column mapping
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Teketeke suggested these mappings based on your
          spreadsheet headers. Review and adjust them before
          continuing.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {columns.map(
          (column) => {
            const mapping =
              getMapping(
                column.key,
              );

            return (
              <div
                key={column.key}
                className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:px-6"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {column.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Spreadsheet column
                  </p>
                </div>

                <select
                  value={
                    mapping?.targetField ??
                    ""
                  }
                  onChange={(event) =>
                    handleMappingChange(
                      column.key,
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                >
                  <option value="">
                    Do not import this column
                  </option>

                  {fields.map(
                    (field) => (
                      <option
                        key={field.key}
                        value={field.key}
                      >
                        {field.label}
                        {field.required
                          ? " *"
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </div>
            );
          },
        )}

        {columns.length === 0 && (
          <div className="px-5 py-8 text-sm text-slate-500 sm:px-6">
            No spreadsheet columns were detected.
          </div>
        )}
      </div>
    </section>
  );
}