"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  getTransferableContainersAction,
  transferStockAction,
} from "../action";
import type { TranslationSet } from "@/lib/i18n";

interface Product {
  id: string;
  name: string;
  sku: string;
  type: string;
  trackInventory: boolean;
  currency: string;
  inventoryMode: "DISCRETE" | "LIQUID";
}

interface TransferableContainer {
  id: string;
  containerType: string;
  status: "SEALED" | "OPEN";
  remainingQuantity: number;
  unit: string;
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

  const [containers, setContainers] =
    useState<TransferableContainer[]>([]);

  const [selectedContainerIds, setSelectedContainerIds] =
    useState<string[]>([]);

  const [loadingContainers, setLoadingContainers] =
    useState(false);

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

	useEffect(() => {
      let cancelled = false;

      setContainers([]);
      setSelectedContainerIds([]);

      if (
        selectedProduct?.inventoryMode !== "LIQUID" ||
        !productId ||
        !fromWarehouseId
      ) {
        setLoadingContainers(false);
        return;
      }

      async function loadContainers() {
        setLoadingContainers(true);
        setError("");

        try {
          const result =
            await getTransferableContainersAction(
              productId,
              fromWarehouseId,
            );

          if (!cancelled) {
            setContainers(result);
          }
        } catch (err) {
          if (!cancelled) {
            setContainers([]);
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load available containers.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingContainers(false);
          }
        }
      }

      void loadContainers();

      return () => {
        cancelled = true;
      };
    }, [
      productId,
      fromWarehouseId,
      selectedProduct?.inventoryMode,
    ]);

	const selectedContainers = containers.filter(
      (container) =>
        selectedContainerIds.includes(container.id),
    );

    const selectedContainerQuantity =
      selectedContainers.reduce(
        (total, container) =>
          total + container.remainingQuantity,
        0,
      );

  const pendingTransferRef = useRef<{
    operationId: string;
    requestKey: string;
  } | null>(null);

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
      selectedProduct?.inventoryMode === "LIQUID"
    ) {
      if (selectedContainerIds.length === 0) {
        setError(
          "Select at least one container to transfer.",
        );
        return;
      }
    } else if (
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

	const transferQuantity =
      selectedProduct.inventoryMode === "LIQUID"
        ? selectedContainerQuantity
        : parsedQuantity;

    const sortedContainerIds =
      selectedProduct.inventoryMode === "LIQUID"
        ? [...selectedContainerIds].sort()
        : [];

    const requestKey = JSON.stringify({
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity: transferQuantity,
      containerIds: sortedContainerIds,
      currency: selectedProduct.currency,
      notes: notes.trim() || undefined,
    });

    if (
      !pendingTransferRef.current ||
      pendingTransferRef.current.requestKey !== requestKey
    ) {
      pendingTransferRef.current = {
        operationId: crypto.randomUUID(),
        requestKey,
      };
    }

    const operationId =
      pendingTransferRef.current.operationId;

    await transferStockAction({
      operationId,
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity: transferQuantity,
      containerIds:
        selectedProduct.inventoryMode === "LIQUID"
          ? sortedContainerIds
          : undefined,
      currency: selectedProduct.currency,
      notes: notes.trim() || undefined,
    });

    pendingTransferRef.current = null;

    setSuccess(
      `${t.inventory.stockTransferredSuccessfully} ${transferQuantity} ${selectedProduct.name}.`,
    );

    setQuantity("");
    setNotes("");
    setSelectedContainerIds([]);
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

      {selectedProduct?.inventoryMode === "LIQUID" ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700">
              Select containers to transfer
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Entire containers will be moved. The remaining
              volume in each selected container will be included
              in the transfer.
            </p>
          </div>

          {loadingContainers && (
            <p className="text-sm text-slate-500">
              Loading available containers...
            </p>
          )}

          {!loadingContainers &&
            containers.length === 0 && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                No eligible containers with remaining volume
                were found in this source warehouse.
              </p>
            )}

          {!loadingContainers &&
            containers.length > 0 && (
              <div className="space-y-3">
                {containers.map((container) => {
                  const checked =
                    selectedContainerIds.includes(
                      container.id,
                    );

                  return (
                    <label
                      key={container.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={submitting || loadingContainers}
                        onChange={(event) => {
                          setSelectedContainerIds(
                            (current) =>
                              event.target.checked
                                ? [
                                    ...current,
                                    container.id,
                                  ]
                                : current.filter(
                                    (id) =>
                                      id !== container.id,
                                  ),
                          );
                        }}
                        className="mt-1"
                      />

                      <span className="flex-1">
                        <span className="block text-sm font-medium text-slate-900">
                          {container.containerType} —{" "}
                          {container.status}
                        </span>

                        <span className="mt-1 block text-sm text-slate-600">
                          Remaining volume:{" "}
                          {container.remainingQuantity}{" "}
                          {container.unit}
                        </span>

                        <span className="mt-1 block break-all text-xs text-slate-500">
                          Container ID: {container.id}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              Selected containers:{" "}
              <span className="font-medium text-slate-900">
                {selectedContainers.length}
              </span>
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Total transfer volume:{" "}
              <span className="font-semibold text-slate-900">
                {selectedContainerQuantity}
                {selectedContainers.length > 0
                  ? ` ${selectedContainers[0].unit}`
                  : ""}
              </span>
            </p>
          </div>
        </div>
      ) : (
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
              setQuantity(event.target.value)
            }
            required
            placeholder={t.inventory.enterQuantity}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
          />
        </div>
      )}

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