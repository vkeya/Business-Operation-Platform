"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Barcode, CheckCircle2, Loader2 } from "lucide-react";

import type { PosProduct } from "@/lib/pos/posProductService";

interface PosBarcodeInputProps {
  warehouseId: string;
  onProductFound: (
    product: PosProduct,
    sellingUnitId?: string,
  ) => void;
}

export default function PosBarcodeInput({
  warehouseId,
  onProductFound,
}: PosBarcodeInputProps) {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const focusScanner = useCallback(() => {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, []);

  useEffect(() => {
    focusScanner();
  }, [focusScanner, warehouseId]);

  const lookupBarcode = useCallback(async () => {
    const value = barcode.trim();

    if (!value) {
      focusScanner();
      return;
    }

    if (!warehouseId) {
      setError("Select a warehouse before scanning a product.");
      focusScanner();
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const params = new URLSearchParams({
        warehouseId,
        barcode: value,
      });

      const response = await fetch(
        `/api/pos/products/barcode?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            `No product found for barcode "${value}".`,
        );
      }

      const product = result.product as PosProduct | undefined;

      if (!product) {
        throw new Error(
          `No product found for barcode "${value}".`,
        );
      }

      onProductFound(product);

      setBarcode("");
      setMessage(`${product.name} added to transaction.`);
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Unable to find the scanned product.",
      );
      setBarcode("");
    } finally {
      setLoading(false);
      focusScanner();
    }
  }, [
    barcode,
    warehouseId,
    onProductFound,
    focusScanner,
  ]);

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      void lookupBarcode();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setBarcode("");
      setError("");
      setMessage("");
      focusScanner();
    }
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setBarcode(event.target.value);
    setError("");
    setMessage("");
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Barcode className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <label
            htmlFor="pos-barcode-scanner"
            className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400"
          >
            Barcode scanner
          </label>

          <input
            ref={inputRef}
            id="pos-barcode-scanner"
            value={barcode}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="off"
            inputMode="none"
            placeholder={
              warehouseId
                ? "Scan barcode and press Enter..."
                : "Select a warehouse first..."
            }
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-bold tracking-wide text-slate-900 outline-none transition placeholder:text-sm placeholder:font-medium placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 disabled:cursor-wait disabled:opacity-70"
          />
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 sm:flex">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">
            Ready
          </span>
        </div>
      </div>

      <div className="mt-2 flex min-h-5 items-center justify-between gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
          USB / Bluetooth scanner • Enter submits scan
        </p>

        {message && (
          <p className="truncate text-[10px] font-semibold text-emerald-600">
            {message}
          </p>
        )}

        {error && (
          <p className="truncate text-[10px] font-semibold text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
