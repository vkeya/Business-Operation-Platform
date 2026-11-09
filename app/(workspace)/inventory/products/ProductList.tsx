"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";
import ProductSearch from "./ProductSearch";
import {
  deleteProductsAction,
} from "./actions";
import { getTranslations } from "@/lib/i18n";
import {
  getAllInventoryBalancesAction,
  getAvailableContainerCountsAction,
  getProductContainersAction,
} from "./listActions";
import type { ProductConfiguration } from "@/lib/business/productConfiguration";

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  type: string;
  sellingPrice: number;
  currency: string;
  trackInventory: boolean;
  inventoryMode?: "DISCRETE" | "LIQUID";
  status: string;
  attributes: unknown;
}

interface ProductContainer {
  id: string;
  containerType: string;
  status: string;
  capacityQuantity: number;
  remainingQuantity: number;
  unit: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  receivedAt: Date | string;
  openedAt: Date | string | null;
  closedAt: Date | string | null;
}

interface ProductContainerDetails {
  containers: ProductContainer[];
  loading: boolean;
  error: string;
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

  const [containerCounts, setContainerCounts] =
  useState<
    Record<
      string,
      {
        total: number;
        byType: Record<string, number>;
      }
    >
  >({});

  const [expandedProductId, setExpandedProductId] =
  useState<string | null>(null);

  const [containerDetails, setContainerDetails] =
    useState<Record<string, ProductContainerDetails>>({});

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [deleting, setDeleting] =
    useState(false);

  const [archiveError, setArchiveError] =
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
      const [balances, counts] = await Promise.all([
       getAllInventoryBalancesAction(),
       getAvailableContainerCountsAction(),
     ]);


      const totals: Record<string, number> = {};

      for (const balance of balances) {
        totals[balance.productId] =
          (totals[balance.productId] ?? 0) +
          balance.quantity;
      }

      if (active) {
        setStockTotals(totals);
		setContainerCounts(counts);
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

  async function handleArchiveSelected() {
    if (selectedIds.length === 0 || deleting) {
      return;
    }

    const confirmed = window.confirm(
  `Archive ${selectedIds.length} selected product${
    selectedIds.length === 1 ? "" : "s"
  }? The products will be removed from active inventory and POS, but their SKU, barcode, and history will be preserved.`,
);

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setArchiveError("");

    try {
      await deleteProductsAction(selectedIds);

      window.location.reload();
    } catch (error) {
      setArchiveError(
  error instanceof Error
    ? error.message
    : "Failed to archive selected products.",
);
    } finally {
      setDeleting(false);
    }
  }

async function toggleProductStock(productId: string) {
  if (expandedProductId === productId) {
    setExpandedProductId(null);
    return;
  }

  setExpandedProductId(productId);

  if (containerDetails[productId]) {
    return;
  }

  setContainerDetails((current) => ({
    ...current,
    [productId]: {
      containers: [],
      loading: true,
      error: "",
    },
  }));

  try {
    const containers =
      await getProductContainersAction(productId);

    setContainerDetails((current) => ({
      ...current,
      [productId]: {
        containers,
        loading: false,
        error: "",
      },
    }));
  } catch {
    setContainerDetails((current) => ({
      ...current,
      [productId]: {
        containers: [],
        loading: false,
        error: "Unable to load container details.",
      },
    }));
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
              onClick={handleArchiveSelected}
              disabled={deleting}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting
  ? "Archiving..."
  : `Archive Selected (${selectedIds.length})`}
            </button>
          )}
        </div>
      </div>

      {archiveError && (
        <div className="border-b border-rose-100 bg-rose-50 px-5 py-4 sm:px-6">
          <p className="text-sm font-medium text-rose-700">
            {archiveError}
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
                const isLiquid =
                  product.inventoryMode === "LIQUID";

                const availableContainers =
                  containerCounts[product.id];

                const stock = isLiquid
                  ? availableContainers?.total ?? 0
                  : stockTotals[product.id] ?? 0;

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
				<Fragment key={product.id}>
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
                            <p className={`text-sm font-semibold ${
                              stockIsLow
                                ? "text-amber-700"
                                : "text-slate-800"
                            }`}>
                              {stock}
                              {isLiquid
                                ? ` ${stock === 1 ? "container" : "containers"}`
                                : ""}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              {isLiquid
                                ? "Physical stock"
                                : t.inventory.tracked}
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
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleProductStock(product.id)}
                          className="inline-flex items-center rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                        >
                          {expandedProductId === product.id
                            ? "Hide stock"
                            : "View stock"}
                        </button>

						<Link
                          href={`/inventory/products/${product.id}`}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 opacity-80 shadow-sm transition hover:border-slate-300 hover:bg-slate-950 hover:text-white hover:opacity-100"
                        >
                          {t.inventory.edit}
                        </Link>

                        {product.barcode && (
                          <Link
                            href={`/inventory/barcode-labels?productId=${product.id}`}
                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            Print Labels
                          </Link>
                        )}
                      </div>
                                          </td>
                                        </tr>

						{expandedProductId === product.id && (
  <tr className="border-b border-slate-200 bg-slate-50">
    <td colSpan={9} className="px-6 py-5">
      {containerDetails[product.id]?.loading ? (
        <p className="text-sm text-slate-500">
          Loading container details…
        </p>
      ) : containerDetails[product.id]?.error ? (
        <p className="text-sm text-red-600">
          {containerDetails[product.id].error}
        </p>
      ) : (
        (() => {
          const details =
            containerDetails[product.id]?.containers ?? [];

          const sealed = details.filter(
            (container) => container.status === "SEALED",
          );

          const open = details.filter(
            (container) => container.status === "OPEN",
          );

          const empty = details.filter(
            (container) => container.status === "EMPTY",
          );

          const totalRemainingMl = details.reduce(
            (total, container) =>
              total +
              (container.unit.toLowerCase() === "l"
                ? container.remainingQuantity * 1000
                : container.remainingQuantity),
            0,
          );

          return (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Sealed containers
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {sealed.length}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Open containers
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {open.length}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Empty containers
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {empty.length}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Remaining liquid
                  </p>
                  <p className="mt-1 text-lg font-semibold text-emerald-700">
                    {totalRemainingMl.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 },
                    )}{" "}
                    ml
                  </p>
                </div>
              </div>

              {details.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No container records exist for this product yet.
                  Receive stock to create container records.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Container</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Capacity</th>
                        <th className="px-4 py-3">Remaining</th>
                        <th className="px-4 py-3">Warehouse</th>
                      </tr>
                    </thead>

                    <tbody>
                      {details.map((container) => (
                        <tr
                          key={container.id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {container.containerType.replace(
                              /_/g,
                              " ",
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {container.status}
                          </td>

                          <td className="px-4 py-3">
                            {container.capacityQuantity.toLocaleString()}{" "}
                            {container.unit}
                          </td>

                          <td className="px-4 py-3 font-medium">
                            {container.remainingQuantity.toLocaleString()}{" "}
                            {container.unit}
                          </td>

                          <td className="px-4 py-3">
                            {container.warehouseName}
                            {container.warehouseCode
                              ? ` (${container.warehouseCode})`
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()
      )}
       </td>
  </tr>
)}
                 </Fragment>
                );
              })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </>
                        );
                      }
