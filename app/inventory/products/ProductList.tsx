"use client";

import { useCallback, useState } from "react";
import ProductSearch from "./ProductSearch";

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
}

interface ProductListProps {
  products: Product[];
}

export default function ProductList({
  products: initialProducts,
}: ProductListProps) {
  const [products, setProducts] =
    useState(initialProducts);

  const handleResults = useCallback(
    (results: Product[]) => {
      setProducts(results);
    },
    [],
  );

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-semibold text-slate-900">
            Product list
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Products currently registered for this business.
          </p>
        </div>

        <ProductSearch
  onResults={handleResults}
  onClear={() => setProducts(initialProducts)}
/>
      </div>

      {products.length === 0 ? (
        <div className="px-5 py-16 text-center sm:px-6">
          <p className="text-base font-medium text-slate-900">
            No products found
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Try a different product name, SKU or barcode.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Product
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  SKU
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Type
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Selling price
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Stock
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {product.name}
                    </p>

                    {product.description && (
                      <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                        {product.description}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.sku}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.type === "PRODUCT"
                      ? "Product"
                      : "Service"}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {product.currency}{" "}
                    {product.sellingPrice.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.trackInventory
                      ? "Tracked"
                      : "Not tracked"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}