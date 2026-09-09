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
    <div
      className={`group rounded-2xl border bg-white p-4 text-left transition ${
        outOfStock
          ? "border-slate-200 opacity-60"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 group-hover:text-violet-700">
          <Package className="h-5 w-5" />
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAdd}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed"
          aria-label={`Add ${product.name}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 line-clamp-2 text-sm font-semibold text-slate-900">
        {product.name}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {product.sku}
      </p>

      <div className="mt-4 flex items-end justify-between gap-2">
        <p className="text-sm font-bold text-slate-900">
          {product.currency}{" "}
          {product.sellingPrice.toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          )}
        </p>

        <p
          className={`text-[10px] font-semibold ${
            outOfStock
              ? "text-red-600"
              : "text-slate-400"
          }`}
        >
          {product.trackInventory
            ? `${product.availableQuantity} in stock`
            : "Not tracked"}
        </p>
      </div>

      {hasSellingUnits && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Selling unit
          </p>

          {product.sellingUnits.length === 1 ? (
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold text-slate-700">
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
                  if (
                    event.target.value
                  ) {
                    onAdd(
                      product,
                      event.target.value,
                    );

                    event.target.value =
                      "";
                  }
                }}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white disabled:cursor-not-allowed"
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

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}