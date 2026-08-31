"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createSaleAction } from "@/lib/sales/actions";

import type { TranslationSet } from "@/lib/i18n";

interface ProductSellingUnit {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  sellingPrice: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  type: string;
  trackInventory: boolean;
  sellingPrice: number;
  currency: string;
  sellingUnits?: ProductSellingUnit[];
}

interface RestaurantMenuItem {
  id: string;
  name: string;
  sellingPrice: number;
  currency: string;
  product: {
    id: string;
  } | null;
  menu: {
    id: string;
    name: string;
  };
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface SaleFormProps {
  products: Product[];
  warehouses: Warehouse[];
  restaurantMenuItems: RestaurantMenuItem[];
  currency: string;
  translations: TranslationSet;
  }


interface SaleItem {
  id: string;
  productId: string;
  menuItemId: string;
  sellingUnitId: string;
  quantity: string;
}

export default function SaleForm({
  products,
  warehouses,
  restaurantMenuItems,
  currency: defaultCurrency,
  translations,
}: SaleFormProps) {
  const router = useRouter();
  const t = translations;

  const [warehouseId, setWarehouseId] =
    useState("");

  const currency = defaultCurrency;

  const [notes, setNotes] =
    useState("");

  const [items, setItems] =
    useState<SaleItem[]>([
      {
        id: crypto.randomUUID(),
        productId: "",
        menuItemId: "",
        sellingUnitId: "",
        quantity: "",
      },
    ]);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [discountAmount, setDiscountAmount] =
    useState("");

  const [taxRate, setTaxRate] =
  useState("");

  const [barcode, setBarcode] =
  useState("");

  const inventoryProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.type === "PRODUCT" &&
          product.trackInventory,
      ),
    [products],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => {
          const product =
            inventoryProducts.find(
              (product) =>
                product.id === item.productId,
            );

          const menuItem =
            restaurantMenuItems.find(
              (menuItem) =>
                menuItem.id === item.menuItemId,
            );

          const sellingUnit =
            product?.sellingUnits?.find(
              (sellingUnit) => sellingUnit.id === item.sellingUnitId,
            );

          const unitPrice =
            menuItem?.sellingPrice ??
            sellingUnit?.sellingPrice ??
            product?.sellingPrice ??
            0;

          return (
            total +
            Number(item.quantity || 0) *
              unitPrice
          );
        },
        0,
      ),
    [
      items,
      inventoryProducts,
      restaurantMenuItems,
    ],
  );

  const discount = Math.min(
    Math.max(
      Number(discountAmount || 0),
      0,
    ),
    subtotal,
  );

  const taxableAmount =
  subtotal - discount;

const taxPercentage = Math.max(
  Number(taxRate || 0),
  0,
);

const taxAmount =
  taxableAmount *
  (taxPercentage / 100);

const totalAmount =
  taxableAmount + taxAmount;

  function updateItem(
    id: string,
    field:
      | "productId"
      | "menuItemId"
      | "sellingUnitId"
      | "quantity",
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        productId: "",
        menuItemId: "",
        sellingUnitId: "",
        quantity: "",
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter(
            (item) => item.id !== id,
          ),
    );
  }

  function handleBarcodeScan() {
  const scannedBarcode =
    barcode.trim();

  if (!scannedBarcode) {
    return;
  }

  const product =
    inventoryProducts.find(
      (item) =>
        item.barcode === scannedBarcode,
    );

  if (!product) {
    setError(
      `No product found for barcode "${scannedBarcode}".`,
    );

    return;
  }

  setError("");

  setItems((current) => {
    const existingItem =
      current.find(
        (item) =>
          item.productId === product.id &&
          !item.menuItemId,
      );

    if (existingItem) {
      return current.map((item) =>
        item.id === existingItem.id
          ? {
              ...item,
              quantity: String(
                Number(item.quantity || 0) + 1,
              ),
            }
          : item,
      );
    }

    const emptyItem =
      current.find(
        (item) =>
          !item.productId &&
          !item.menuItemId,
      );

    if (emptyItem) {
      return current.map((item) =>
        item.id === emptyItem.id
          ? {
              ...item,
              productId: product.id,
              menuItemId: "",
              quantity: "1",
            }
          : item,
      );
    }

    return [
      ...current,
      {
        id: crypto.randomUUID(),
        productId: product.id,
        menuItemId: "",
        sellingUnitId: "",
        quantity: "1",
      },
    ];
  });

  setBarcode("");
}

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!warehouseId) {
      setError(
        t.saleForm.warehouseRequired,
      );
      return;
    }

    if (items.length === 0) {
      setError(
        t.saleForm.itemRequired,
      );
      return;
    }

    const saleItems = items.map(
      (item) => {
        const product =
          inventoryProducts.find(
            (product) =>
              product.id === item.productId,
          );

        const menuItem =
          restaurantMenuItems.find(
            (menuItem) =>
              menuItem.id === item.menuItemId,
          );

        if (!product) {
          throw new Error(
            t.saleForm.productRequired,
          );
        }

        const quantity =
          Number(item.quantity);

        if (
          !Number.isFinite(quantity) ||
          quantity <= 0
        ) {
          throw new Error(
            t.saleForm.quantityRequired,
          );
        }

        const sellingUnit =
          product.sellingUnits?.find(
            (sellingUnit) => sellingUnit.id === item.sellingUnitId,
          );

        const unitPrice =
          menuItem?.sellingPrice ??
          sellingUnit?.sellingPrice ??
          product.sellingPrice;

        return {
          productId:
            product.id,
          menuItemId:
            menuItem?.id || undefined,
          sellingUnitId:
            sellingUnit?.id || undefined,
          productName:
            menuItem?.name ??
            product.name,
          sku:
            product.sku || undefined,
          quantity,
          unitPrice,
          discountAmount: 0,
          taxAmount: 0,
          totalAmount:
            quantity * unitPrice,
        };
      },
    );

    try {
      setSubmitting(true);

      const sale =
        await createSaleAction({

          warehouseId,
          currency,
          notes:
            notes.trim() || undefined,
          items: saleItems,
          subtotal,
          discountAmount: discount,
          taxAmount,
          totalAmount,
        });

      router.push(
        `/sales/${sale.id}`,
      );

      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : t.saleForm.createSaleError,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {t.saleForm.saleDetails}
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">


          <div>
  <p className="block text-sm font-medium text-slate-700">
    {t.saleForm.currency}
  </p>

  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700">
    {currency}
  </div>
</div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="warehouseId"
            className="block text-sm font-medium text-slate-700"
          >
            {t.saleForm.warehouse}
          </label>

          <select
            id="warehouseId"
            value={warehouseId}
            onChange={(event) =>
              setWarehouseId(
                event.target.value,
              )
            }
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          >
            <option value="">
              {t.saleForm.selectWarehouse}
            </option>

            {warehouses.map(
              (warehouse) => (
                <option
                  key={warehouse.id}
                  value={warehouse.id}
                >
                  {warehouse.name} (
                  {warehouse.code})
                </option>
              ),
            )}
          </select>
        </div>

        <div className="mt-5">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-slate-700"
          >
            {t.saleForm.notes}
          </label>

          <textarea
            id="notes"
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t.saleForm.saleItems}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {t.saleForm.selectProducts}
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t.saleForm.addItem}
          </button>
        </div>

		<div className="mt-6">
  <label
    htmlFor="barcode"
    className="block text-sm font-medium text-slate-700"
  >
    Scan barcode
  </label>

  <input
    id="barcode"
    value={barcode}
    onChange={(event) =>
      setBarcode(event.target.value)
    }
    onKeyDown={(event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleBarcodeScan();
  }
}}
    placeholder="Scan or enter product barcode"
    autoComplete="off"
    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
  />
</div>

        <div className="mt-6 space-y-4">
          {items.map((item) => {
            const product =
              inventoryProducts.find(
                (product) =>
                  product.id === item.productId,
              );

            const menuItem =
              restaurantMenuItems.find(
                (menuItem) =>
                  menuItem.id === item.menuItemId,
              );

            const sellingUnit =
              product?.sellingUnits?.find(
                (sellingUnit) => sellingUnit.id === item.sellingUnitId,
              );

            const unitPrice =
              menuItem?.sellingPrice ??
              sellingUnit?.sellingPrice ??
              product?.sellingPrice ??
              0;

            const lineTotal =
              Number(item.quantity || 0) *
              unitPrice;

            return (
              <div
                key={item.id}
                className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_180px_140px_140px_auto]"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {restaurantMenuItems.length >
                    0
                      ? t.saleForm.menuItemProduct
                      : t.saleForm.product}
                  </label>

                  <select
                    value={
                      item.menuItemId
                        ? `menu:${item.menuItemId}`
                        : item.productId
                          ? `product:${item.productId}`
                          : ""
                    }
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      if (!value) {
                        updateItem(
                          item.id,
                          "productId",
                          "",
                        );

                        updateItem(
                          item.id,
                          "menuItemId",
                          "",
                        );

                        return;
                      }

                      if (
                        value.startsWith(
                          "menu:",
                        )
                      ) {
                        const menuItemId =
                          value.replace(
                            "menu:",
                            "",
                          );

                        const menuItem =
                          restaurantMenuItems.find(
                            (menuItem) =>
                              menuItem.id ===
                              menuItemId,
                          );

                        updateItem(
                          item.id,
                          "menuItemId",
                          menuItemId,
                        );

                        updateItem(
                          item.id,
                          "productId",
                          menuItem?.product?.id ??
                            "",
                        );

                        return;
                      }

                      const productId =
                        value.replace(
                          "product:",
                          "",
                        );

                      updateItem(
                        item.id,
                        "menuItemId",
                        "",
                      );

                      updateItem(
                        item.id,
                        "productId",
                        productId,
                      );
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                  >
                    <option value="">
                      {t.saleForm.selectItem}
                    </option>

                    {restaurantMenuItems.length >
                      0 && (
                      <optgroup
                        label={
                          t.saleForm.restaurantMenu
                        }
                      >
                        {restaurantMenuItems.map(
                          (menuItem) => (
                            <option
                              key={`menu-${menuItem.id}`}
                              value={`menu:${menuItem.id}`}
                            >
                              {
                                menuItem.menu
                                  .name
                              }{" "}
                              —{" "}
                              {
                                menuItem.name
                              }{" "}
                              —{" "}
                              {
                                menuItem.currency
                              }{" "}
                              {menuItem.sellingPrice.toFixed(
                                2,
                              )}
                            </option>
                          ),
                        )}
                      </optgroup>
                    )}

                    <optgroup
                      label={
                        t.saleForm.inventoryProducts
                      }
                    >
                      {inventoryProducts.map(
                        (product) => (
                          <option
                            key={`product-${product.id}`}
                            value={`product:${product.id}`}
                          >
                            {product.name} —{" "}
                            {product.currency}{" "}
                            {product.sellingPrice.toFixed(
                              2,
                            )}
                          </option>
                        ),
                      )}
                    </optgroup>
                  </select>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700">
                     Selling unit
                   </label>
                   <select
                     value={item.sellingUnitId}
                     onChange={(event) =>
                       updateItem(item.id, "sellingUnitId", event.target.value)
                     }
                     disabled={
                       !product ||
                       Boolean(item.menuItemId) ||
                       (product.sellingUnits?.length ?? 0) === 0
                     }
                     className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:bg-slate-50"
                   >
                     <option value="">Base unit</option>
                     {product?.sellingUnits?.map((sellingUnit) => (
                       <option key={sellingUnit.id} value={sellingUnit.id}>
                         {sellingUnit.name} — {sellingUnit.quantity}{" "}
                         {sellingUnit.unit} — {currency}{" "}
                         {sellingUnit.sellingPrice.toFixed(2)}
                       </option>
                     ))}
                   </select>
                 </div>

                 <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t.saleForm.quantity}
                  </label>

                  <input
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(
                        item.id,
                        "quantity",
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t.saleForm.total}
                  </label>

                  <div className="mt-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900">
                    {currency}{" "}
                    {lineTotal.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.id)
                    }
                    disabled={
                      items.length === 1
                    }
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t.saleForm.remove}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
  <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
    <div className="grid flex-1 gap-4 sm:grid-cols-4">
      <div>
        <p className="text-sm text-slate-500">
          Subtotal
        </p>

        <p className="mt-1 text-lg font-semibold text-slate-900">
          {currency}{" "}
          {subtotal.toFixed(2)}
        </p>
      </div>

      <div>
        <label className="block text-sm text-slate-500">
          Discount
        </label>

        <div className="mt-1 flex max-w-xs rounded-xl border border-slate-300 bg-white">
          <span className="flex items-center border-r border-slate-200 px-3 text-sm text-slate-500">
            {currency}
          </span>

          <input
            type="number"
            min="0"
            max={subtotal}
            step="0.01"
            value={discountAmount}
            onChange={(event) =>
              setDiscountAmount(
                event.target.value,
              )
            }
            placeholder="0.00"
            className="w-full rounded-r-xl px-4 py-2.5 text-sm outline-none"
          />
        </div>
      </div>

	  <div>
  <label className="block text-sm text-slate-500">
    Tax (%)
  </label>

  <input
    type="number"
    min="0"
    step="0.01"
    value={taxRate}
    onChange={(event) =>
      setTaxRate(
        event.target.value,
      )
    }
    placeholder="0"
    className="mt-1 w-full max-w-xs rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
  />

  <p className="mt-2 text-sm text-slate-500">
    {currency}{" "}
    {taxAmount.toFixed(2)}
  </p>
</div>

      <div>
        <p className="text-sm text-slate-500">
          {t.saleForm.saleTotal}
        </p>

        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {currency}{" "}
          {totalAmount.toFixed(2)}
        </p>
      </div>
    </div>

    <button
      type="submit"
      disabled={submitting}
      className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {submitting
        ? t.saleForm.saving
        : t.sales.recordSale}
    </button>
  </div>
</section>
    </form>
  );
}