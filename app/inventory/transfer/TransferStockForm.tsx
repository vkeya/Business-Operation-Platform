"use client";

import {
  FormEvent,
  useState,
} from "react";
import Link from "next/link";
import { transferStockAction } from "../action";
import type { TranslationSet } from "@/lib/i18n";

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

interface TransferStockFormProps {
  products: Product[];
  warehouses: Warehouse[];
  translations: TranslationSet;
}

export default function TransferStockForm({
  products,
  warehouses,
  translations: t,
}: TransferStockFormProps) {
  const [productId, setProductId] =
    useState("");

  const [fromWarehouseId, setFromWarehouseId] =
    useState("");

  const [toWarehouseId, setToWarehouseId] =
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
      setError(
        t.inventory.selectProductRequired,
      );
      return;
    }

    if (!fromWarehouseId) {
      setError(
        t.inventory.selectSourceWarehouseRequired,
      );
      return;
    }

    if (!toWarehouseId) {
      setError(
        t.inventory.selectDestinationWarehouseRequired,
      );
      return;
    }

    if (
      fromWarehouseId ===
      toWarehouseId
    ) {
      setError(
        t.inventory.warehousesMustBeDifferent,
      );
      return;
    }

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setError(
        t.inventory.transferQuantityPositive,
      );
      return;
    }

    if (!selectedProduct) {
      setError(
        t.inventory.selectedProductNotFound,
      );
      return;
    }

    setSubmitting(true);

    try {
      await transferStockAction({
        productId,
        fromWarehouseId,
        toWarehouseId,
        quantity: parsedQuantity,
        currency:
          selectedProduct.currency,
        notes:
          notes.trim() || undefined,
      });

      setSuccess(
        `${t.inventory.stockTransferredSuccessfully} ${parsedQuantity} ${selectedProduct.name}.`,
      );

      setQuantity("");
      setNotes("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.inventory.transferStockError,
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
          {t.inventory.product}
        </label>

        <select
          id="productId"
          value={productId}
          onChange={(event) =>
            setProductId(
              event.target.value,
            )
          }
          required
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
        >
          <option value="">
            {t.inventory.selectProduct}
          </option>

          {products
            .filter(
              (product) =>
                product.type ===
                  "PRODUCT" &&
                product.trackInventory,
            )
            .map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name} —{" "}
                {product.sku}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="fromWarehouseId"
          className="block text-sm font-medium text-slate-700"
        >
          {t.inventory.fromWarehouse}
        </label>

        <select
          id="fromWarehouseId"
          value={fromWarehouseId}
          onChange={(event) =>
            setFromWarehouseId(
              event.target.value,
            )
          }
          required
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
        >
          <option value="">
            {t.inventory.selectSourceWarehouse}
          </option>

          {warehouses.map(
            (warehouse) => (
              <option
                key={warehouse.id}
                value={warehouse.id}
              >
                {warehouse.name} —{" "}
                {warehouse.code}
              </option>
            ),
          )}
        </select>
      </div>

      <div>
        <label
          htmlFor="toWarehouseId"
          className="block text-sm font-medium text-slate-700"
        >
          {t.inventory.toWarehouse}
        </label>

        <select
          id="toWarehouseId"
          value={toWarehouseId}
          onChange={(event) =>
            setToWarehouseId(
              event.target.value,
            )
          }
          required
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
        >
          <option value="">
            {t.inventory.selectDestinationWarehouse}
          </option>

          {warehouses.map(
            (warehouse) => (
              <option
                key={warehouse.id}
                value={warehouse.id}
              >
                {warehouse.name} —{" "}
                {warehouse.code}
              </option>
            ),
          )}
        </select>
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-slate-700"
        >
          {t.inventory.quantity}
        </label>

        <input
          id="quantity"
          type="number"
          step="0.0001"
          min="0.0001"
          value={quantity}
          onChange={(event) =>
            setQuantity(
              event.target.value,
            )
          }
          required
          placeholder={
            t.inventory.enterQuantity
          }
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
        />
      </div>

      {selectedProduct && (
        <p className="text-sm text-slate-500">
          {t.inventory.currency}:{" "}
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
          {t.inventory.notes}
        </label>

        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          placeholder={
            t.inventory.optionalTransferNotes
          }
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <Link
          href="/inventory"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {t.inventory.backToInventory}
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? t.inventory.transferring
            : t.inventory.transferStock}
        </button>
      </div>
    </form>
  );
}