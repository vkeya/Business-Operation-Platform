"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  createPurchaseAction,
} from "../action";

interface Product {
  id: string;
  name: string;
  sku: string;
  type: string;
  trackInventory: boolean;
  currency: string;
  unit: string;
  attributes?: unknown;
}

interface Supplier {
  id: string;
  name: string;
  currency: string | null;
  paymentTermsDays: number | null;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface PurchaseFormProps {
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  currency: string;
  initialProductId?: string;
}

interface PurchaseItem {
  id: string;
  productId: string;
  quantity: string;
  unitCost: string;
}

function getProductVolume(
  product?: Product,
) {
  if (!product) {
    return null;
  }

  if (
    !product.attributes ||
    typeof product.attributes !== "object" ||
    Array.isArray(product.attributes)
  ) {
    return null;
  }

  const attributes =
    product.attributes as Record<
      string,
      unknown
    >;

  const volume =
    attributes.volume;

  const numericVolume =
    typeof volume === "number"
      ? volume
      : typeof volume === "string"
        ? Number(volume)
        : NaN;

  if (
    !Number.isFinite(numericVolume) ||
    numericVolume <= 0
  ) {
    return null;
  }

  return {
    quantity: numericVolume,
    unit: product.unit,
  };
}

export default function PurchaseForm({
  products,
  suppliers,
  warehouses,
  currency: defaultCurrency,
  initialProductId,
}: PurchaseFormProps) {
  const router = useRouter();

  const [supplierId, setSupplierId] =
    useState("");

  const [warehouseId, setWarehouseId] =
    useState("");

  const [referenceNumber, setReferenceNumber] =
    useState("");

  const [supplierInvoiceNumber, setSupplierInvoiceNumber] =
    useState("");

  const [currency, setCurrency] =
    useState(defaultCurrency);

  const [notes, setNotes] =
    useState("");

  const [items, setItems] =
  useState<PurchaseItem[]>([
    {
      id: crypto.randomUUID(),
      productId:
        initialProductId ?? "",
      quantity: "",
      unitCost: "",
    },
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
        (total, item) =>
          total +
          Number(item.quantity || 0) *
            Number(item.unitCost || 0),
        0,
      ),
    [items],
  );

  function updateItem(
    id: string,
    field: "productId" | "quantity" | "unitCost",
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
        quantity: "",
        unitCost: "",
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!supplierId) {
      setError("Please select a supplier.");
      return;
    }

    if (!referenceNumber.trim()) {
      setError(
        "Please enter a purchase reference.",
      );
      return;
    }

    if (!currency) {
      setError("Please select a currency.");
      return;
    }

    if (items.length === 0) {
      setError(
        "Add at least one purchase item.",
      );
      return;
    }

    for (const item of items) {
      if (!item.productId) {
        setError(
          "Please select a product for every purchase item.",
        );
        return;
      }

      const quantity = Number(
        item.quantity,
      );

      const unitCost = Number(
        item.unitCost,
      );

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        setError(
          "Purchase quantities must be greater than zero.",
        );
        return;
      }

      if (
        !Number.isFinite(unitCost) ||
        unitCost < 0
      ) {
        setError(
          "Unit costs cannot be negative.",
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      await createPurchaseAction({
        supplierId,
        warehouseId:
          warehouseId || undefined,
        referenceNumber:
          referenceNumber.trim(),
        supplierInvoiceNumber:
          supplierInvoiceNumber.trim() ||
          undefined,
        currency,
        notes:
          notes.trim() || undefined,
        items: items.map((item) => {
          const product =
            inventoryProducts.find(
              (candidate) =>
                candidate.id ===
                item.productId,
            );

          const quantity = Number(
            item.quantity,
          );

          const unitCost = Number(
            item.unitCost,
          );

          return {
            productId: item.productId,
            productName:
              product?.name ?? "",
            sku:
              product?.sku || undefined,
            quantity,
            unitCost,
            discountAmount: 0,
            taxAmount: 0,
            totalAmount:
              quantity * unitCost,
          };
        }),
        subtotal,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: subtotal,
      });

      router.push("/purchases");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create the purchase.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          Purchase details
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="supplierId"
              className="block text-sm font-medium text-slate-700"
            >
              Supplier
            </label>

            <select
              id="supplierId"
              value={supplierId}
              onChange={(event) =>
                setSupplierId(
                  event.target.value,
                )
              }
              required
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            >
              <option value="">
                Select supplier
              </option>

              {suppliers
                .filter(
                  (supplier) =>
                    supplier.id &&
                    supplier.name,
                )
                .map((supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="warehouseId"
              className="block text-sm font-medium text-slate-700"
            >
              Receiving warehouse
            </label>

            <select
              id="warehouseId"
              value={warehouseId}
              onChange={(event) =>
                setWarehouseId(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            >
              <option value="">
                Select warehouse
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
              htmlFor="referenceNumber"
              className="block text-sm font-medium text-slate-700"
            >
              Purchase reference
            </label>

            <input
              id="referenceNumber"
              value={referenceNumber}
              onChange={(event) =>
                setReferenceNumber(
                  event.target.value,
                )
              }
              placeholder="e.g. PO-0001"
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="supplierInvoiceNumber"
              className="block text-sm font-medium text-slate-700"
            >
              Supplier invoice
            </label>

            <input
              id="supplierInvoiceNumber"
              value={supplierInvoiceNumber}
              onChange={(event) =>
                setSupplierInvoiceNumber(
                  event.target.value,
                )
              }
              placeholder="Optional"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
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
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase text-slate-900"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Purchase items
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add the products being purchased.
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

        <div className="mt-5 space-y-4">
         {items.map((item) => {
  const selectedProduct =
    inventoryProducts.find(
      (product) =>
        product.id === item.productId,
    );

  const productVolume =
    getProductVolume(
      selectedProduct,
    );

  const purchaseQuantity =
    Number(item.quantity || 0);

  const inventoryQuantity =
    productVolume
      ? purchaseQuantity *
        productVolume.quantity
      : purchaseQuantity;

  const lineTotal =
    purchaseQuantity *
    Number(item.unitCost || 0);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="grid gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <label
                      htmlFor={`product-${item.id}`}
                      className="block text-sm font-medium text-slate-700"
                    >
                      Product
                    </label>

                    <select
                      id={`product-${item.id}`}
                      value={item.productId}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "productId",
                          event.target.value,
                        )
                      }
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                    >
                      <option value="">
                        Select product
                      </option>

                      {inventoryProducts.map(
                        (product) => (
                          <option
                            key={product.id}
                            value={product.id}
                          >
                            {product.name} —{" "}
                            {product.sku}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`quantity-${item.id}`}
                      className="block text-sm font-medium text-slate-700"
                    >
                      Quantity
                    </label>

                    <input
                      id={`quantity-${item.id}`}
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
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
                    />
					{productVolume && (
  <p className="mt-1 text-xs text-slate-500">
    {purchaseQuantity || 0} ×{" "}
    {productVolume.quantity}{" "}
    {productVolume.unit} ={" "}
    {inventoryQuantity.toLocaleString()}{" "}
    {productVolume.unit} stock
  </p>
)}
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`unitCost-${item.id}`}
                      className="block text-sm font-medium text-slate-700"
                    >
                      Unit cost
                    </label>

                    <input
                      id={`unitCost-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "unitCost",
                          event.target.value,
                        )
                      }
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Line total
                    </label>

                    <p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
                      {currency}{" "}
                      {lineTotal.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </p>
                  </div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.id)
                    }
                    className="mt-3 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Remove item
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <div className="ml-auto max-w-sm space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Subtotal
            </span>

            <span className="font-medium text-slate-900">
              {currency}{" "}
              {subtotal.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="font-semibold text-slate-900">
              Total
            </span>

            <span className="text-xl font-semibold text-slate-900">
              {currency}{" "}
              {subtotal.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </span>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
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
          placeholder="Optional purchase notes"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
        />
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push("/purchases")
          }
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Saving..."
            : "Save draft"}
        </button>
      </div>
    </form>
  );
}