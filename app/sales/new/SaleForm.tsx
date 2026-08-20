"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createSaleAction } from "@/lib/sales/actions";

interface Product {
  id: string;
  name: string;
  sku: string;
  type: string;
  trackInventory: boolean;
  sellingPrice: number;
  currency: string;
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
}

interface SaleItem {
  id: string;
  productId: string;
  menuItemId: string;
  quantity: string;
}

export default function SaleForm({
  products,
  warehouses,
  restaurantMenuItems,
  currency: defaultCurrency,
}: SaleFormProps) {
  const router = useRouter();
  
  const [warehouseId, setWarehouseId] =
  useState("");

  const [referenceNumber, setReferenceNumber] =
    useState("");

  const [currency, setCurrency] =
    useState(defaultCurrency);

  const [notes, setNotes] =
    useState("");

  const [items, setItems] =
    useState<SaleItem[]>([
      {
  id: crypto.randomUUID(),
  productId: "",
  menuItemId: "",
  quantity: "",
}
    ]);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
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

        const unitPrice =
          menuItem?.sellingPrice ??
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

  function updateItem(
    id: string,
    field:
  | "productId"
  | "menuItemId"
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
  quantity: "",
}
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!referenceNumber.trim()) {
      setError(
        "Please enter a sale reference.",
      );
      return;
    }

    if (!currency) {
      setError("Please select a currency.");
      return;
    }
	
	if (!warehouseId) {
  setError(
    "Please select a warehouse.",
  );
  return;
}

    if (items.length === 0) {
      setError(
        "Add at least one sale item.",
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
        "Please select a product for every line.",
      );
    }

    const quantity =
      Number(item.quantity);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        "Sale quantities must be greater than zero.",
      );
    }

    const unitPrice =
      menuItem?.sellingPrice ??
      product.sellingPrice;

    return {
      productId:
        product.id,
      menuItemId:
        menuItem?.id || undefined,
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
          referenceNumber:
            referenceNumber.trim(),
		  warehouseId,	
          currency,
          notes:
            notes.trim() || undefined,
          
          items: saleItems,
          subtotal,
          discountAmount: 0,
          taxAmount: 0,
          totalAmount: subtotal,
        });

      router.push(
        `/sales/${sale.id}`,
      );
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create sale.",
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
          Sale details
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="referenceNumber"
              className="block text-sm font-medium text-slate-700"
            >
              Reference number
            </label>

            <input
              id="referenceNumber"
              value={referenceNumber}
              onChange={(event) =>
                setReferenceNumber(
                  event.target.value,
                )
              }
              placeholder="SALE-001"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-slate-700"
            >
              Currency
            </label>

            <input
              id="currency"
              value={currency}
              onChange={(event) =>
                setCurrency(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>
		
		<div className="mt-5">
  <label
    htmlFor="warehouseId"
    className="block text-sm font-medium text-slate-700"
  >
    Warehouse
  </label>

  <select
    id="warehouseId"
    value={warehouseId}
    onChange={(event) =>
      setWarehouseId(event.target.value)
    }
    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
  >
    <option value="">
      Select warehouse
    </option>

    {warehouses.map((warehouse) => (
      <option
        key={warehouse.id}
        value={warehouse.id}
      >
        {warehouse.name} ({warehouse.code})
      </option>
    ))}
  </select>
</div>

        <div className="mt-5">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-slate-700"
          >
            Notes
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
              Sale items
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select products and quantities.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Add item
          </button>
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

const unitPrice =
  menuItem?.sellingPrice ??
  product?.sellingPrice ??
  0;

const lineTotal =
  Number(item.quantity || 0) *
  unitPrice;

            return (
              <div
                key={item.id}
                className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_140px_140px_auto]"
              >
                <div>
  <label className="block text-sm font-medium text-slate-700">
    {restaurantMenuItems.length > 0
      ? "Menu item / Product"
      : "Product"}
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
      const value = event.target.value;

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

      if (value.startsWith("menu:")) {
        const menuItemId =
          value.replace("menu:", "");

        const menuItem =
          restaurantMenuItems.find(
            (menuItem) =>
              menuItem.id === menuItemId,
          );

        updateItem(
          item.id,
          "menuItemId",
          menuItemId,
        );

        updateItem(
          item.id,
          "productId",
          menuItem?.product?.id ?? "",
        );

        return;
      }

      const productId =
        value.replace("product:", "");

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
      Select item
    </option>

    {restaurantMenuItems.length > 0 && (
      <optgroup label="Restaurant menu">
        {restaurantMenuItems.map(
          (menuItem) => (
            <option
              key={`menu-${menuItem.id}`}
              value={`menu:${menuItem.id}`}
            >
              {menuItem.menu.name} —{" "}
              {menuItem.name} —{" "}
              {menuItem.currency}{" "}
              {menuItem.sellingPrice.toFixed(2)}
            </option>
          ),
        )}
      </optgroup>
    )}

    <optgroup label="Inventory products">
      {inventoryProducts.map(
        (product) => (
          <option
            key={`product-${product.id}`}
            value={`product:${product.id}`}
          >
            {product.name} —{" "}
            {product.currency}{" "}
            {product.sellingPrice.toFixed(2)}
          </option>
        ),
      )}
    </optgroup>
  </select>
</div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Quantity
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
                    Total
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
                    disabled={items.length === 1}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Sale total
          </p>

          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {currency}{" "}
            {subtotal.toFixed(2)}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : "Record sale"}
        </button>
      </section>
    </form>
  );
}