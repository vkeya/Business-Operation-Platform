"use client";

import {
  Search,
  User,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import type { PosCustomer } from "@/lib/pos/posCustomerService";

interface PosCustomerSelectorProps {
  selectedCustomer: PosCustomer | null;
  onSelect: (
    customer: PosCustomer | null,
  ) => void;
}

export default function PosCustomerSelector({
  selectedCustomer,
  onSelect,
}: PosCustomerSelectorProps) {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] =
    useState<PosCustomer[]>([]);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedCustomer) {
      return;
    }

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setCustomers([]);
      setError("");
      return;
    }

    const controller =
      new AbortController();

    const timer = window.setTimeout(
      async () => {
        try {
          setLoading(true);
          setError("");

          const params =
            new URLSearchParams({
              q: trimmedQuery,
            });

          const response = await fetch(
            `/api/pos/customers?${params.toString()}`,
            {
              signal: controller.signal,
            },
          );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.error ||
                "Unable to search customers.",
            );
          }

          setCustomers(
            Array.isArray(result.customers)
              ? result.customers
              : [],
          );
        } catch (searchError) {
          if (
            searchError instanceof DOMException &&
            searchError.name === "AbortError"
          ) {
            return;
          }

          setError(
            searchError instanceof Error
              ? searchError.message
              : "Unable to search customers.",
          );
        } finally {
          setLoading(false);
        }
      },
      250,
    );

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, selectedCustomer]);

  function handleSelect(
    customer: PosCustomer,
  ) {
    onSelect(customer);
    setQuery("");
    setCustomers([]);
    setError("");
  }

  function handleClear() {
    onSelect(null);
    setQuery("");
    setCustomers([]);
    setError("");
  }

  if (selectedCustomer) {
    return (
      <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-700">
              <User className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {selectedCustomer.name}
              </p>

              {(selectedCustomer.phone ||
                selectedCustomer.email) && (
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {selectedCustomer.phone ||
                    selectedCustomer.email}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-600"
            aria-label="Remove customer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);

            if (error) {
              setError("");
            }
          }}
          placeholder="Search customer..."
          autoComplete="off"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
        />
      </div>

      {loading && (
        <p className="mt-2 text-xs text-slate-400">
          Searching customers...
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {!loading &&
        query.trim() &&
        customers.length === 0 &&
        !error && (
          <p className="mt-2 text-xs text-slate-400">
            No matching customers found.
          </p>
        )}

      {customers.length > 0 && (
        <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {customers.map((customer) => (
            <button
              key={customer.customerId}
              type="button"
              onClick={() =>
                handleSelect(customer)
              }
              className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                <User className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {customer.name}
                </p>

                {(customer.phone ||
                  customer.email) && (
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {customer.phone ||
                      customer.email}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] text-slate-400">
        Optional — leave blank for a walk-in
        customer.
      </p>
    </div>
  );
}