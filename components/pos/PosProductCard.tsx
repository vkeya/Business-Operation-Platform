"use client";

import {
  ChevronDown,
  Package,
  Plus,
} from "lucide-react";

import type { PosProduct } from "@/lib/pos/posProductService";

interface PosProductCardProps {
  product: PosProduct;
  onAdd: (
    product: PosProduct,
    sellingUnitId?: string,
  ) => void;
}

export default function PosProductCard({
  product,
  onAdd,
}: PosProductCardProps) {
  const outOfStock =
    product.trackInventory &&
    product.availableQuantity <= 0;

  const hasSellingUnits =
    product.sellingUnits.length > 0;

  function handleAdd() {
    if (outOfStock) {
      return;
    }

    if (product.sellingUnits.length === 1) {
      onAdd(
        product,
        product.sellingUnits[0].id,
      );
      return;
    }

    onAdd(product);
  }

  return (
    <article
      className={`group relative flex min-h-[190px] flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
        outOfStock
          ? "border-slate-200 opacity-60"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-violet-50 group-hover:text-violet-700">
          <Package className="h-5 w-5" />
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAdd}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm transition hover:bg-violet-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          aria-label={`Add ${product.name}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 min-w-0">
        <p className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">
          {product.name}
        </p>

        <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
          {product.sku}
        </p>
      </div>

      <div className="mt-auto pt-4">
        <div className="flex items-end justify-between gap-3">
          <p className="text-base font-extrabold tracking-tight text-slate-950">
            {product.currency}{" "}
            {product.sellingPrice.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
          </p>

          <span
            className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
              outOfStock
                ? "bg-red-50 text-red-600"
                : product.trackInventory
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {product.trackInventory
              ? outOfStock
                ? "Out of stock"
                : `${product.availableQuantity} in stock`
              : "Not tracked"}
          </span>
        </div>
      </div>

      {hasSellingUnits && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Selling unit
          </p>

          {product.sellingUnits.length === 1 ? (
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-bold text-slate-700">
                {product.sellingUnits[0].name}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                {product.sellingUnits[0].quantity}{" "}
                {product.sellingUnits[0].unit}
              </p>
            </div>
          ) : (
            <div className="relative">
              <select
                defaultValue=""
                disabled={outOfStock}
                onChange={(event) => {
                  if (event.target.value) {
                    onAdd(
                      product,
                      event.target.value,
                    );

                    event.target.value = "";
                  }
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-9 text-xs font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white disabled:cursor-not-allowed"
              >
                <option value="">
                  Select unit
                </option>

                {product.sellingUnits.map(
                  (unit) => (
                    <option
                      key={unit.id}
                      value={unit.id}
                    >
                      {unit.name} —{" "}
                      {product.currency}{" "}
                      {unit.sellingPrice.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </option>
                  ),
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          )}
        </div>
      )}
    </article>
  );
}