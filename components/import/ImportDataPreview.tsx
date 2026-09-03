import type {
  ImportFieldDefinition,
  ImportRow,
} from "@/lib/import/types";

interface ImportDataPreviewProps {
  rows: ImportRow[];
  fields: ImportFieldDefinition[];
  maxRows?: number;
}

export default function ImportDataPreview({
  rows,
  fields,
  maxRows = 10,
}: ImportDataPreviewProps) {
  const visibleRows =
    rows.slice(0, maxRows);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Data preview
        </p>

        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          Review your mapped records
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Preview the first {visibleRows.length}{" "}
          {visibleRows.length === 1
            ? "record"
            : "records"}{" "}
          from your import file before continuing.
        </p>
      </div>

      {visibleRows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="whitespace-nowrap px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:px-6"
                >
                  Row
                </th>

                {fields.map((field) => (
                  <th
                    key={field.key}
                    scope="col"
                    className="whitespace-nowrap px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:px-6"
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleRows.map((row) => (
                <tr
                  key={row.rowNumber}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-500 sm:px-6">
                    {row.rowNumber}
                  </td>

                  {fields.map((field) => {
                    const value =
                      row.values[field.key];

                    return (
                      <td
                        key={field.key}
                        className="max-w-[220px] px-5 py-4 text-sm text-slate-700 sm:px-6"
                      >
                        {value === null ||
                        value === undefined ||
                        value === "" ? (
                          <span className="text-slate-300">
                            —
                          </span>
                        ) : (
                          String(value)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-8 text-sm text-slate-500 sm:px-6">
          No records are available for preview.
        </div>
      )}

      {rows.length > maxRows && (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500 sm:px-6">
          Showing the first {maxRows} of{" "}
          {rows.length} records.
        </div>
      )}
    </section>
  );
}