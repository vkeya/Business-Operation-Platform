"use client";

import {
  FormEvent,
  useState,
} from "react";
import Link from "next/link";
import { receiveStockAction } from "../action";

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

interface ReceiveStockFormProps {
  products: Product[];
  warehouses: Warehouse[];
}

export default function ReceiveStockForm({
  products,
  warehouses,
}: ReceiveStockFormProps) {
  const [productId, setProductId] =
    useState("");

  const [warehouseId, setWarehouseId] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [unitCost, setUnitCost] =
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

    const parsedUnitCost =
      Number(unitCost);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setError(
        "Quantity must be greater than zero.",
      );
      return;
    }

    if (
      !Number.isFinite(parsedUnitCost) ||
      parsedUnitCost < 0
    ) {
      setError(
        "Unit cost cannot be negative.",
      );
      return;
    }

    if (!selectedProduct) {
      setError("Selected product was not found.");
      return;
    }

    setSubmitting(true);

    try {
      await receiveStockAction({
        productId,
        warehouseId,
        quantity: parsedQuantity,
        unitCost: parsedUnitCost,
        currency: selectedProduct.currency,
        notes: notes.trim() || undefined,
      });

      setSuccess(
        `Successfully received ${parsedQuantity} ${selectedProduct.name}.`,
      );

      setQuantity("");
      setUnitCost("");
      setNotes("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to receive stock.",
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-slate-700"
          >
            Quantity
          </label>

          <input
            id="quantity"
            type="number"
            min="0.0001"
            step="0.0001"
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value)
            }
            required
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="unitCost"
            className="block text-sm font-medium text-slate-700"
          >
            Unit cost
          </label>

          <input
            id="unitCost"
            type="number"
            min="0"
            step="0.0001"
            value={unitCost}
            onChange={(event) =>
              setUnitCost(event.target.value)
            }
            required
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
          />
        </div>
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
          Notes
        </label>

        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          placeholder="Optional receipt notes"
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
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Receiving..."
            : "Receive stock"}
        </button>
      </div>
    </form>
  );
}