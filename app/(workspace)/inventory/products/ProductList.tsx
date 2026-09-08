"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import ProductSearch from "./ProductSearch";
import {
  getAllInventoryBalancesAction,
} from "./listActions";
import {
  deleteProductsAction,
} from "./actions";
import { getTranslations } from "@/lib/i18n";
import type { ProductConfiguration } from "@/lib/business/productConfiguration";

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  type: string;
  sellingPrice: number;
  currency: string;
  trackInventory: boolean;
  status: string;
  attributes: unknown;
}

interface ProductListProps {
  products: Product[];
  configuration: ProductConfiguration;
}

function getProductAttributeValue(
  attributes: unknown,
  attributeId: string,
): string | null {
  if (
    !attributes ||
    typeof attributes !== "object" ||
    Array.isArray(attributes)
  ) {
    return null;
  }

  const record = attributes as Record<
    string,
    unknown
  >;

  const value = record[attributeId];

  return typeof value === "string"
    ? value
    : null;
}

export default function ProductList({
  products: initialProducts,
  configuration,
}: ProductListProps) {
  const t = getTranslations();

  const [products, setProducts] =
    useState(initialProducts);

  const [stockTotals, setStockTotals] =
    useState<Record<string, number>>({});

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  const handleResults = useCallback(
    (results: Product[]) => {
      setProducts(results);
      setSelectedIds([]);
    },
    [],
  );

  useEffect(() => {
    let active = true;

    async function loadStock() {
      const balances =
        await getAllInventoryBalancesAction();

      const totals: Record<string, number> = {};

      for (const balance of balances) {
        totals[balance.productId] =
          (totals[balance.productId] ?? 0) +
          balance.quantity;
      }

      if (active) {
        setStockTotals(totals);
      }
    }

    loadStock();

    return () => {
      active = false;
    };
  }, []);

  const allSelected =
    products.length > 0 &&
    products.every((product) =>
      selectedIds.includes(product.id),
    );

  const someSelected =
    selectedIds.length > 0 && !allSelected;

  function toggleProduct(productId: string) {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(
      products.map((product) => product.id),
    );
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0 || deleting) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected product${
        selectedIds.length === 1 ? "" : "s"
      }? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteProductsAction(selectedIds);

      window.location.reload();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete selected products.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* List header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-slate-950">
              {t.inventory.productCatalogue}
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {products.length}
            </span>

            {selectedIds.length > 0 && (
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                {selectedIds.length} selected
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {t.inventory.searchReviewEditProducts}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <ProductSearch
            onResults={handleResults}
            onClear={() => {
              setProducts(initialProducts);
              setSelectedIds([]);
            }}
          />

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting
                ? "Deleting..."
                : `Delete Selected (${selectedIds.length})`}
            </button>
          )}
        </div>
      </div>

      {deleteError && (
        <div className="border-b border-rose-100 bg-rose-50 px-5 py-4 sm:px-6">
          <p className="text-sm font-medium text-rose-700">
            {deleteError}
          </p>
        </div>
      )}

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="px-5 py-16 text-center sm:px-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
            —
          </div>

          <p className="mt-4 text-base font-semibold text-slate-900">
            {t.inventory.noProductsFound}
          </p>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {t.inventory.productSearchEmptyDescription}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                <th className="w-12 px-4 py-3.5">
                  <input
                    type="checkbox"
                    aria-label="Select all products"
                    checked={allSelected}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate =
                          someSelected;
                      }
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </th>

                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {t.inventory.product}
                </th>

                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  SKU
                </th>

                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Attributes
                </th>

                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {t.inventory.type}
                </th>

                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {t.inventory.sellingPrice}
                </th>

                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {t.inventory.stock}
                </th>

                <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {t.inventory.status}
                </th>

                <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {t.inventory.action}
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const stock =
                  stockTotals[product.id] ?? 0;

                const isActive =
                  product.status === "ACTIVE";

                const stockIsLow =
                  product.trackInventory &&
                  stock <= 0;

                const visibleAttributes =
                  configuration.attributes.filter(
                    (attribute) => {
                      const value =
                        getProductAttributeValue(
                          product.attributes,
                          attribute.id,
                        );

                      return Boolean(value?.trim());
                    },
                  );

                const isSelected =
                  selectedIds.includes(product.id);

                return (
                  <tr
                    key={product.id}
                    className={`group border-b border-slate-100 last:border-0 transition ${
                      isSelected
                        ? "bg-violet-50/50"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* Select */}
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${product.name}`}
                        checked={isSelected}
                        onChange={() =>
                          toggleProduct(product.id)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold uppercase text-slate-500 transition group-hover:bg-slate-950 group-hover:text-white">
                          {product.name
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {product.name}
                          </p>

                          {product.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-600">
                        {product.sku}
                      </span>
                    </td>

                    {/* Attributes */}
                    <td className="px-6 py-4">
                      {visibleAttributes.length > 0 ? (
                        <div className="flex max-w-xs flex-wrap gap-1.5">
                          {visibleAttributes.map(
                            (attribute) => (
                              <span
                                key={attribute.id}
                                className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                              >
                                {attribute.label}:{" "}
                                {getProductAttributeValue(
                                  product.attributes,
                                  attribute.id,
                                )}
                              </span>
                            ),
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {product.type === "PRODUCT"
                          ? "Product"
                          : "Service"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {product.currency}{" "}
                        {product.sellingPrice.toFixed(2)}
                      </p>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      {product.trackInventory ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              stockIsLow
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />

                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                stockIsLow
                                  ? "text-amber-700"
                                  : "text-slate-800"
                              }`}
                            >
                              {stock}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              {t.inventory.tracked}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          {t.inventory.notTracked}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />

                        {product.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/inventory/products/${product.id}`}
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 opacity-80 shadow-sm transition hover:border-slate-300 hover:bg-slate-950 hover:text-white hover:opacity-100"
                      >
                        {t.inventory.edit}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}