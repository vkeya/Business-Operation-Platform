
"use client";

import {
  FormEvent,
  useState,
} from "react";
import Link from "next/link";
import { adjustStockAction } from "../action";

interface Product {
  id: string;
  name: string;
  sku: string;
  type: string;
  trackInventory: boolean;
  currency: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface AdjustStockFormProps {
  products: Product[];
  warehouses: Warehouse[];
}

export default function AdjustStockForm({
  products,
  warehouses,
}: AdjustStockFormProps) {
  const [productId, setProductId] =
    useState("");

  const [warehouseId, setWarehouseId] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [notes, setNotes] =
    useState("");
	
	const [submitting, setSubmitting] =
  useState(false);

const [error, setError] =
  useState("");

const [success, setSuccess] =
  useState("");

  const selectedProduct =
    products.find(
      (product) => product.id === productId,
    );

 async function handleSubmit(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  setError("");
  setSuccess("");

  if (!productId) {
    setError("Please select a product.");
    return;
  }

  if (!warehouseId) {
    setError("Please select a warehouse.");
    return;
  }

  const parsedQuantity =
    Number(quantity);

  if (
    !Number.isFinite(parsedQuantity) ||
    parsedQuantity === 0
  ) {
    setError(
      "Adjustment quantity cannot be zero.",
    );
    return;
  }

  if (!selectedProduct) {
    setError(
      "Selected product was not found.",
    );
    return;
  }

  if (!notes.trim()) {
    setError(
      "Please provide a reason for the adjustment.",
    );
    return;
  }

  setSubmitting(true);

  try {
    await adjustStockAction({
      productId,
      warehouseId,
      quantity: parsedQuantity,
      currency: selectedProduct.currency,
      notes: notes.trim(),
    });

    setSuccess(
      `Stock adjusted by ${parsedQuantity} for ${selectedProduct.name}.`,
    );

    setQuantity("");
    setNotes("");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to adjust stock.",
    );
  } finally {
    setSubmitting(false);
  }
}

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6"
    >
	
	{error && (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {error}
  </div>
)}

{success && (
  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
    {success}
  </div>
)}
      <div>
        <label
          htmlFor="productId"
          className="block text-sm font-medium text-slate-700"
        >
          Product
        </label>

        <select
          id="productId"
          value={productId}
          onChange={(event) =>
            setProductId(event.target.value)
          }
          required
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
        >
          <option value="">
            Select a product
          </option>

          {products
            .filter(
              (product) =>
                product.type === "PRODUCT" &&
                product.trackInventory,
            )
            .map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name} — {product.sku}
              </option>
            ))}
        </select>
      </div>

      <div>
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
          required
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
        >
          <option value="">
            Select a warehouse
          </option>

          {warehouses.map((warehouse) => (
            <option
              key={warehouse.id}
              value={warehouse.id}
            >
              {warehouse.name} — {warehouse.code}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-slate-700"
        >
          Adjustment quantity
        </label>

        <input
          id="quantity"
          type="number"
          step="0.0001"
          value={quantity}
          onChange={(event) =>
            setQuantity(event.target.value)
          }
          required
          placeholder="e.g. -4 or +5"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
        />

        <p className="mt-2 text-xs text-slate-500">
          Use a negative number to reduce stock or a
          positive number to increase stock.
        </p>
      </div>

      {selectedProduct && (
        <p className="text-sm text-slate-500">
          Currency:{" "}
          <span className="font-medium text-slate-700">
            {selectedProduct.currency}
          </span>
        </p>
      )}

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700"
        >
          Reason / notes
        </label>

        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          required
          placeholder="Explain why the adjustment is being made"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <Link
          href="/inventory"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>

        <button
  type="submit"
  disabled={submitting}
  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
>
  {submitting
    ? "Adjusting..."
    : "Adjust stock"}
</button>
      </div>
    </form>
  );
}