"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import BarcodeLabel from "@/components/barcode/BarcodeLabel";

import { searchBarcodeLabelProductsAction } from "@/app/(workspace)/inventory/barcode-labels/actions";

type LabelSize = "50x25" | "38x25";

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  sellingPrice: number;
  currency: string;
  categoryName: string | null;
  availableQuantity: number;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface BarcodeLabelWorkspaceProps {
  warehouses: Warehouse[];
  businessName: string;
}

export function BarcodeLabelWorkspace({
  warehouses,
  businessName,
}: BarcodeLabelWorkspaceProps) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [warehouseId, setWarehouseId] = useState(
  warehouses[0]?.id ?? "",
);

const [productId, setProductId] = useState<string | null>(null);

 useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  setProductId(params.get("productId"));
}, []);

  const [selectedProducts, setSelectedProducts] =
  useState<Record<string, number>>({});

  const [labelSize, setLabelSize] =
  useState<LabelSize>("50x25");

const [showProductName, setShowProductName] =
  useState(true);

const [showBarcode, setShowBarcode] =
  useState(true);

const [showSku, setShowSku] =
  useState(true);

const [showPrice, setShowPrice] =
  useState(true);

const [showCategory, setShowCategory] =
  useState(false);

const [showBusinessName, setShowBusinessName] =
  useState(false);
  
 

  function toggleProduct(product: Product) {
  setSelectedProducts((current) => {
    if (product.id in current) {
      const next = { ...current };
      delete next[product.id];
      return next;
    }

    return {
      ...current,
      [product.id]: product.availableQuantity,
    };
  });
}

function updateCopies(productId: string, copies: number) {
  setSelectedProducts((current) => ({
    ...current,
    [productId]: Math.max(0, copies),
  }));
}

function toggleAllProducts() {
  if (products.every((product) => product.id in selectedProducts)) {
    setSelectedProducts({});
    return;
  }

  setSelectedProducts(
    Object.fromEntries(
      products.map((product) => [
        product.id,
        selectedProducts[product.id] ??
          product.availableQuantity,
      ]),
    ),
  );
}

const selectedLabelCount = Object.values(
  selectedProducts,
).reduce((total, copies) => total + copies, 0);

const allProductsSelected =
  products.length > 0 &&
  products.every(
    (product) => product.id in selectedProducts,
  );

  async function handleSearch() {
  setLoading(true);

  try {
    const result = await searchBarcodeLabelProductsAction(
      warehouseId,
      search,
    );

    setProducts(result);

    if (productId) {
      const product = result.find((item) => item.id === productId);

      if (product) {
        setSelectedProducts({
          [product.id]: product.availableQuantity,
        });
      }
    }
  } finally {
    setLoading(false);
  }
}
  
  function handlePrint() {
  if (selectedLabelCount === 0) {
    return;
  }

  const printArea = document.querySelector(".barcode-print-area");

  if (!printArea) {
    return;
  }

  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (!printWindow) {
    return;
  }

  const pageSize =
    labelSize === "50x25"
      ? "50mm 25mm"
      : "38mm 25mm";


  printWindow.document.open();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Barcode Labels</title>
       

        <style>
  @page {
    size: ${pageSize};
    margin: 0;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    width: ${labelSize === "50x25" ? "50mm" : "38mm"};
    background: #fff !important;
  }

  .barcode-print-document {
    width: ${labelSize === "50x25" ? "50mm" : "38mm"};
    margin: 0;
    padding: 0;
  }

  .barcode-label {
    width: ${labelSize === "50x25" ? "50mm" : "38mm"};
    height: 25mm;
    margin: 0;
    padding: 0.7mm;
    box-sizing: border-box;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.3mm;

    font-family: Arial, sans-serif;
    font-size: 2.7mm;
    line-height: 1;

    break-inside: avoid;
    page-break-inside: avoid;
    break-after: page;
    page-break-after: always;
  }

  .barcode-label:last-child {
    break-after: auto;
    page-break-after: auto;
  }

  .barcode-product-name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .barcode-business,
  .barcode-category {
    font-size: 2.2mm;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .barcode-bars {
    width: 100%;
    height: 10mm;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .barcode-bars svg {
    display: block;
    width: 100%;
    max-width: 100%;
    height: 9mm;
  }

  .barcode-number {
    font-family: monospace;
    font-size: 2.3mm;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
  }

  .barcode-footer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 1mm;
    width: 100%;
    font-size: 2.3mm;
    line-height: 1;
  }

  .barcode-footer span {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .barcode-footer span:last-child {
    text-align: right;
  }
</style>
      </head>

      <body>
        <div class="barcode-print-document">
          ${printArea.innerHTML}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.focus();

  setTimeout(() => {
    printWindow.print();

    setTimeout(() => {
      printWindow.close();
    }, 1000);
  }, 500);
}

  return (
  <div className="space-y-8">
    {/* Hero */}
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 px-7 py-8 text-white shadow-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              Inventory
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              Barcode Labels
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Barcode Labels
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Select products, choose label quantities and print barcode labels
            for your physical inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          disabled={selectedLabelCount === 0}
          className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Print Labels
        </button>
      </div>
    </section>

    {/* Activity */}
    <section>
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Activity
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          Label health
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Products
          </p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {Object.keys(selectedProducts).length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Products selected
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Labels
          </p>
          <p className="mt-4 text-3xl font-semibold text-emerald-700">
            {selectedLabelCount}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Labels ready to print
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Warehouse
          </p>
          <p className="mt-4 text-lg font-semibold text-amber-700">
            {warehouses.find((w) => w.id === warehouseId)?.name ?? "Not selected"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Stock source for labels
          </p>
        </div>
      </div>
    </section>

    {/* Search */}
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Inventory
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Find products
        </h2>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <select
          value={warehouseId}
          onChange={(event) => setWarehouseId(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 lg:w-64"
        >
          <option value="">Select warehouse</option>

          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name} ({warehouse.code})
            </option>
          ))}
        </select>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void handleSearch();
            }
          }}
          placeholder="Search product, SKU or barcode..."
          className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
        />

        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={loading || !warehouseId}
          className="h-11 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </section>

    {/* Selection summary */}
    {Object.keys(selectedProducts).length > 0 && (
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {Object.keys(selectedProducts).length} product(s) selected
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {selectedLabelCount} label(s) ready for printing
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          disabled={selectedLabelCount === 0}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Print Labels
        </button>
      </section>
    )}

    {/* Label settings */}
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Configuration
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Label settings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose the label size and information printed on each label.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Label size
          </label>

          <select
            value={labelSize}
            onChange={(event) =>
              setLabelSize(event.target.value as LabelSize)
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="50x25">50 × 25 mm</option>
            <option value="38x25">38 × 25 mm</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {[
            ["Product Name", showProductName, setShowProductName],
            ["Barcode", showBarcode, setShowBarcode],
            ["SKU", showSku, setShowSku],
            ["Price", showPrice, setShowPrice],
            ["Category", showCategory, setShowCategory],
            ["Business Name", showBusinessName, setShowBusinessName],
          ].map(([label, checked, setter]) => (
            <label
              key={String(label)}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={Boolean(checked)}
                onChange={(event) =>
                  (setter as Dispatch<SetStateAction<boolean>>)(
                    event.target.checked,
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              {String(label)}
            </label>
          ))}
        </div>
      </div>
    </section>

    {/* Products */}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Products
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Select inventory
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="px-6 py-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allProductsSelected}
                    onChange={toggleAllProducts}
                  />
                  <span>Select</span>
                </label>
              </th>

              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Barcode</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-right">Stock</th>
              <th className="px-6 py-4 text-right">Labels</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b last:border-b-0 hover:bg-slate-50/70"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={product.id in selectedProducts}
                    onChange={() => toggleProduct(product)}
                  />
                </td>

                <td className="px-6 py-4 font-medium text-slate-900">
                  {product.name}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {product.sku}
                </td>

                <td className="px-6 py-4 font-mono text-slate-600">
                  {product.barcode}
                </td>

                <td className="px-6 py-4 text-right">
                  {product.currency}{" "}
                  {product.sellingPrice.toLocaleString()}
                </td>

                <td className="px-6 py-4 text-right">
                  {product.availableQuantity}
                </td>

                <td className="px-6 py-4 text-right">
                  <input
                    type="number"
                    min="0"
                    value={
                      selectedProducts[product.id] ??
                      product.availableQuantity
                    }
                    onChange={(event) =>
                      updateCopies(
                        product.id,
                        Number(event.target.value),
                      )
                    }
                    disabled={!(product.id in selectedProducts)}
                    className="h-9 w-24 rounded-lg border border-slate-200 px-2 text-right"
                  />
                </td>
              </tr>
            ))}

            {!loading && products.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center text-slate-400"
                >
                  Search for products with barcodes to begin printing labels.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>

    {/* Preview */}
    {Object.keys(selectedProducts).length > 0 && (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Preview
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Label preview
          </h2>
        </div>

        <div className="barcode-print-area">
          {products
            .filter(
              (product) =>
                product.id in selectedProducts &&
                selectedProducts[product.id] > 0,
            )
            .flatMap((product) =>
              Array.from(
                {
                  length: selectedProducts[product.id],
                },
                (_, index) => (
                  <BarcodeLabel
                    key={`${product.id}-${index}`}
                    productName={product.name}
                    barcode={product.barcode}
                    sku={product.sku}
                    sellingPrice={product.sellingPrice}
                    currency={product.currency}
                    categoryName={product.categoryName}
					businessName={businessName}
                    size={labelSize}
                    showProductName={showProductName}
                    showBarcode={showBarcode}
                    showSku={showSku}
                    showPrice={showPrice}
                    showCategory={showCategory}
                    showBusinessName={showBusinessName}
                  />
                ),
              ),
            )}
        </div>
      </section>
    )}
  </div>
);
}