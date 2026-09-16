"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  getTaxConfigurationAction,
  updateTaxConfigurationAction,
} from "./actions";

import type { TaxConfiguration } from "@/lib/tax/taxConfigurationService";

export default function TaxSettingsPage() {
  const [configuration, setConfiguration] =
    useState<TaxConfiguration | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [name, setName] = useState("VAT");
  const [rate, setRate] = useState("0");
  const [pricingMode, setPricingMode] =
    useState<TaxConfiguration["pricingMode"]>("EXCLUSIVE");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadConfiguration() {
      try {
        setLoading(true);
        setError("");

        const result = await getTaxConfigurationAction();

        if (!mounted) return;

        setConfiguration(result);
        setEnabled(result.enabled);
        setName(result.name);
        setRate(String(result.rate));
        setPricingMode(result.pricingMode);
      } catch (loadError) {
        if (!mounted) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load tax configuration.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadConfiguration();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const numericRate = Number(rate);

      if (!name.trim()) {
        throw new Error("Tax name is required.");
      }

      if (
        !Number.isFinite(numericRate) ||
        numericRate < 0 ||
        numericRate > 100
      ) {
        throw new Error("Tax rate must be a number between 0 and 100.");
      }

      const result = await updateTaxConfigurationAction({
        enabled,
        name: name.trim(),
        rate: numericRate,
        pricingMode,
      });

      setConfiguration(result);
      setEnabled(result.enabled);
      setName(result.name);
      setRate(String(result.rate));
      setPricingMode(result.pricingMode);
      setSuccess("Tax configuration saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save tax configuration.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-6 py-8 text-white shadow-xl sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Settings / Tax
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Tax Configuration
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Configure the tax applied to sales for this business.
              </p>
            </div>

            <div
              className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] ${
                enabled
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {enabled ? "Tax Enabled" : "Tax Disabled"}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Loading tax configuration...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-900">
                    Enable tax
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Apply the configured tax to taxable sales.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEnabled((current) => !current)}
                  aria-pressed={enabled}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    enabled ? "bg-violet-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      enabled ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="tax-name"
                    className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
                  >
                    Tax name
                  </label>

                  <input
                    id="tax-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="VAT"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tax-rate"
                    className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
                  >
                    Tax rate (%)
                  </label>

                  <input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={rate}
                    onChange={(event) => setRate(event.target.value)}
                    placeholder="0"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="tax-pricing-mode"
                  className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
                >
                  Pricing mode
                </label>

                <select
                  id="tax-pricing-mode"
                  value={pricingMode}
                  onChange={(event) =>
                    setPricingMode(
                      event.target.value as TaxConfiguration["pricingMode"],
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                >
                  <option value="EXCLUSIVE">
                    Exclusive — tax added to price
                  </option>

                  <option value="INCLUSIVE">
                    Inclusive — tax included in price
                  </option>
                </select>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-800">
                  Current configuration
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {configuration
                    ? `${configuration.name} at ${configuration.rate}%`
                    : "No configuration loaded"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {pricingMode === "INCLUSIVE"
                    ? "Tax is extracted from the selling price."
                    : "Tax is calculated and added to the taxable amount."}
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                  {success}
                </div>
              )}

              <div className="flex justify-end border-t border-slate-100 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-12 rounded-xl bg-violet-600 px-6 text-xs font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Tax Configuration"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}