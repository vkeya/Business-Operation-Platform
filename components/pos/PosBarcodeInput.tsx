"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  Barcode,
  Loader2,
} from "lucide-react";

import type { PosProduct } from "@/lib/pos/posProductService";

interface PosBarcodeInputProps {
  warehouseId: string;
  onProductFound: (
    product: PosProduct,
  ) => void;
}

export default function PosBarcodeInput({
  warehouseId,
  onProductFound,
}: PosBarcodeInputProps) {
  const [barcode, setBarcode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [warehouseId]);

  async function handleSubmit() {
    const value = barcode.trim();

    if (!value) {
      return;
    }

    if (!warehouseId) {
      setError(
        "Please select a warehouse first.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        warehouseId,
        barcode: value,
      });

      const response = await fetch(
        `/api/pos/products/barcode?${params.toString()}`,
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Product not found.",
        );
      }

      if (!result.product) {
        throw new Error(
          "Product not found.",
        );
      }

      onProductFound(result.product);
      setBarcode("");
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Unable to find product.",
      );
    } finally {
      setLoading(false);

      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div>
      <div className="relative">
        <Barcode className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-600" />

        <input
          ref={inputRef}
          value={barcode}
          onChange={(event) => {
            setBarcode(event.target.value);
            if (error) {
              setError("");
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={loading || !warehouseId}
          placeholder={
            warehouseId
              ? "Scan or enter barcode..."
              : "Select a warehouse first"
          }
          autoComplete="off"
          className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-12 text-base font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        {loading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-violet-600" />
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
  Scan barcode or enter SKU • Press Enter to add
</p>
    </div>
  );
}