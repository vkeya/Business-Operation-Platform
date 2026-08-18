"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  getCurrencyDefaultsAction,
  getExchangeRateAction,
} from "./actions";
import { currencies } from "@/lib/currency/currencies";

export default function CurrencyPage() {
  const [fromCurrency, setFromCurrency] = useState("");
const [toCurrency, setToCurrency] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  const [source, setSource] = useState("");
  const [effectiveAt, setEffectiveAt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

useEffect(() => {
  let active = true;

  async function loadDefaults() {
    try {
      const defaults =
        await getCurrencyDefaultsAction();

      if (active) {
        setFromCurrency(defaults.baseCurrency);
        setToCurrency("USD");
      }
    } catch (error) {
      console.error(
        "Failed to load currency defaults:",
        error,
      );
    }
  }

  loadDefaults();

  return () => {
    active = false;
  };
}, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setRate(null);
    setLoading(true);

    try {
      const quote = await getExchangeRateAction(
        fromCurrency,
        toCurrency,
      );

      setRate(quote.rate);
      setSource(quote.source);
      setEffectiveAt(quote.effectiveAt);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve exchange rate.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Settings / Currency
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Exchange rates
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Check the latest available exchange rate between two
          currencies.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 sm:grid-cols-2"
        >
          <div>
            <label
              htmlFor="fromCurrency"
              className="block text-sm font-medium text-slate-900"
            >
              From
            </label>

            <select
              id="fromCurrency"
              value={fromCurrency}
              onChange={(event) =>
                setFromCurrency(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {currencies.map((currency) => (
  <option
    key={currency.code}
    value={currency.code}
  >
    {currency.code} — {currency.name}
  </option>
))}
            </select>
          </div>

          <div>
            <label
              htmlFor="toCurrency"
              className="block text-sm font-medium text-slate-900"
            >
              To
            </label>

            <select
              id="toCurrency"
              value={toCurrency}
              onChange={(event) =>
                setToCurrency(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {currencies.map((currency) => (
  <option
    key={currency.code}
    value={currency.code}
  >
    {currency.code} — {currency.name}
  </option>
))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading || fromCurrency === toCurrency}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Checking..." : "Get exchange rate"}
            </button>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {rate !== null && (
          <div className="mt-8 rounded-2xl bg-slate-50 p-6">
            <p className="text-sm font-medium text-slate-500">
              Current rate
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              1 {fromCurrency} = {rate} {toCurrency}
            </p>

            <div className="mt-4 space-y-1 text-xs text-slate-500">
              <p>Source: {source}</p>

              <p>
                Effective:{" "}
                {effectiveAt
                  ? new Date(effectiveAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}