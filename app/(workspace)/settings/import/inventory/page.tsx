"use client";

import {
  ChangeEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Package,
  Upload,
} from "lucide-react";

import ImportMappingReview from "@/components/import/ImportMappingReview";
import ImportDataPreview from "@/components/import/ImportDataPreview";

import {
  analyzeCsvImport,
  analyzeImportWithMappings,
  type ImportAnalysisResult,
} from "@/lib/import/services/importService";

import {
  inventoryImportDefinition,
} from "@/lib/import/definitions/inventory";

import {
  parseCsvImport,
} from "@/lib/import/parsers/csvParser";

import type {
  ImportFieldMapping,
  ImportRow,
  ImportSourceColumn,
} from "@/lib/import/types";

export default function InventoryImportPage() {
  const [analysis, setAnalysis] =
    useState<ImportAnalysisResult | null>(
      null,
    );

  const [columns, setColumns] =
    useState<ImportSourceColumn[]>(
      [],
    );
	
	const [importing, setImporting] =
  useState(false);

const [importResult, setImportResult] =
  useState<{
    importedCount: number;
  } | null>(null);

  const [rows, setRows] =
    useState<ImportRow[]>(
      [],
    );

  const [mappings, setMappings] =
    useState<ImportFieldMapping[]>(
      [],
    );

  const [fileName, setFileName] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);
	
	const handleImport = async () => {
  if (!analysis) {
    setError("Please select and analyze a CSV file first.");
    return;
  }

  if (analysis.preview.invalidRows > 0) {
  setError(
    `Please fix ${analysis.preview.invalidRows} invalid row${
      analysis.preview.invalidRows === 1 ? "" : "s"
    } before importing.`,
  );
  return;
}

  if (analysis.mappedRows.length === 0) {
    setError("There are no rows available to import.");
    return;
  }

  setError("");
  setImporting(true);

  try {
    const response = await fetch(
      "/api/import/inventory",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: analysis.mappedRows,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          "Inventory import failed.",
      );
    }

    setImportResult({
      importedCount:
        result.importedCount,
    });
  } catch (importError) {
    setError(
      importError instanceof Error
        ? importError.message
        : "Inventory import failed.",
    );
  } finally {
    setImporting(false);
  }
};

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setAnalysis(null);
	setImportResult(null);
    setColumns([]);
    setRows([]);
    setMappings([]);

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setError(
        "Please select a CSV file. Excel support will be added next.",
      );

      return;
    }

    setLoading(true);
    setFileName(file.name);

    try {
      const content =
        await file.text();

      const parsed =
        parseCsvImport(content);

      const result =
        analyzeCsvImport(
          content,
          inventoryImportDefinition,
        );

      setColumns(
        parsed.columns,
      );

      setRows(
        parsed.rows,
      );

      setMappings(
        result.mappings,
      );

      setAnalysis(
        result,
      );
    } catch {
      setError(
        "Unable to analyze this file. Please check the CSV format and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleMappingsChange(
    nextMappings: ImportFieldMapping[],
  ) {
    setMappings(
      nextMappings,
    );

    if (!rows.length) {
      return;
    }

    const mappedAnalysis =
      analyzeImportWithMappings(
        rows,
        inventoryImportDefinition.fields,
        nextMappings,
      );

    setAnalysis({
      mappings:
        nextMappings,
      mappedRows:
        mappedAnalysis.mappedRows,
      preview:
        mappedAnalysis.preview,
    });

    setError("");
  }

  return (
    <div className="space-y-6">
      <Link
        href="/settings/import"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to import data
      </Link>

      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                Data Import
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                Inventory
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Import inventory data
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Upload an inventory export and Teketeke will
              analyze the columns, suggest field mappings,
              and validate your records before anything is
              imported.
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Package className="h-6 w-6" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Step 1
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Upload your inventory file
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Start with a CSV export from your existing
            business software. Teketeke will analyze the
            file before any data is imported.
          </p>
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-violet-300 hover:bg-violet-50/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
            <Upload className="h-5 w-5" />
          </div>

          <span className="mt-4 text-sm font-semibold text-slate-900">
            {fileName
              ? fileName
              : "Choose a CSV file"}
          </span>

          <span className="mt-2 text-xs leading-5 text-slate-500">
            CSV files are supported in this first version.
          </span>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        {loading && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Analyzing inventory data...
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{error}</span>
          </div>
        )}
      </section>

      {analysis && (
        <>
          <ImportMappingReview
            columns={columns}
            fields={
              inventoryImportDefinition.fields
            }
            mappings={mappings}
            onChange={
              handleMappingsChange
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Total records
              </p>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                {analysis.preview.totalRows}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Valid records
              </p>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-emerald-600">
                {analysis.preview.validRows}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Invalid records
              </p>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-red-600">
                {analysis.preview.invalidRows}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Active mappings
              </p>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-violet-700">
                {mappings.length}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Step 3 · Validation
                  </p>

                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                    Import preview
                  </h2>
                </div>
              </div>
            </div>

            {analysis.preview.errors.length >
            0 ? (
              <div className="divide-y divide-slate-100">
                {analysis.preview.errors.map(
                  (item, index) => (
                    <div
                      key={`${item.row}-${item.field}-${index}`}
                      className="px-5 py-4 sm:px-6"
                    >
                      <p className="text-sm font-medium text-red-700">
                        Row {item.row}
                        {item.field
                          ? ` · ${item.field}`
                          : ""}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.message}
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="px-5 py-8 sm:px-6">
                <p className="text-sm font-semibold text-emerald-700">
                  No validation errors found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Your inventory data is ready for the next
                  import step.
                </p>
              </div>
            )}
          </section>

          <ImportDataPreview
            rows={analysis.mappedRows}
            fields={
              inventoryImportDefinition.fields
            }
          />

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
      <FileSpreadsheet className="h-5 w-5" />
    </div>

    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        Import status
      </p>

      <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
        Ready to import
      </h2>
    </div>
  </div>

  <div className="px-5 py-6 sm:px-6">
    <p className="text-sm leading-6 text-slate-500">
      Your inventory data has passed validation. Importing will
      create the product records in your active business.
    </p>

    <button
      type="button"
      onClick={handleImport}
      disabled={
        importing ||
        !analysis ||
        analysis.preview.invalidRows > 0
      }
      className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {importing
        ? "Importing..."
        : "Import Products"}
    </button>

    {importResult && (
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Import completed successfully
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            {importResult.importedCount} product
            {importResult.importedCount === 1
              ? ""
              : "s"}{" "}
            imported successfully.
          </p>
        </div>
      </div>
    )}
  </div>
</section>
        </>
      )}
    </div>
  );
}