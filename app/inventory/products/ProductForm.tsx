"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
} from "./actions";
import { currencies } from "@/lib/currency/currencies";

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  type: "PRODUCT" | "SERVICE";
  description: string | null;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currency: string;
  trackInventory: boolean;
  minimumStock: number | null;
  reorderLevel: number | null;
};

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product;
}

export default function ProductForm({
  mode,
  product,
}: ProductFormProps) {
  const router = useRouter();

  const isEdit = mode === "edit";

  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [barcode, setBarcode] = useState(
    product?.barcode ?? "",
  );
  const [type, setType] = useState<
    "PRODUCT" | "SERVICE"
  >(product?.type ?? "PRODUCT");
  const [description, setDescription] = useState(
    product?.description ?? "",
  );
  const [unit, setUnit] = useState(
    product?.unit ?? "pcs",
  );
  const [costPrice, setCostPrice] = useState(
    product?.costPrice?.toString() ?? "",
  );
  const [sellingPrice, setSellingPrice] = useState(
    product?.sellingPrice?.toString() ?? "",
  );
  const [currency, setCurrency] = useState(
    product?.currency ?? "",
  );
  const [trackInventory, setTrackInventory] =
    useState(product?.trackInventory ?? true);
  const [minimumStock, setMinimumStock] = useState(
    product?.minimumStock?.toString() ?? "",
  );
  const [reorderLevel, setReorderLevel] = useState(
    product?.reorderLevel?.toString() ?? "",
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const input = {
        name,
        sku,
        barcode: barcode || undefined,
        type,
        description: description || undefined,
        unit,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        currency,
        trackInventory,
        minimumStock:
          minimumStock === ""
            ? undefined
            : Number(minimumStock),
        reorderLevel:
          reorderLevel === ""
            ? undefined
            : Number(reorderLevel),
      };

      if (isEdit) {
        if (!product?.id) {
          throw new Error(
            "Product ID is required for editing.",
          );
        }

        await updateProductAction(
          product.id,
          input,
        );
      } else {
        await createProductAction(input);
      }

      router.push("/inventory/products");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Unable to update the product."
            : "Unable to save the product.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Stock / Products
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {isEdit ? "Edit product" : "Add product"}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {isEdit
            ? "Update the product information, pricing and stock settings."
            : "Add a product or service to your business."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Basic information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-900"
              >
                Product name
              </label>

              <input
                id="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Coca-Cola 500ml"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-slate-900"
              >
                SKU
              </label>

              <input
                id="sku"
                value={sku}
                onChange={(event) =>
                  setSku(
                    event.target.value.toUpperCase(),
                  )
                }
                placeholder="COKE-500"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="barcode"
                className="block text-sm font-medium text-slate-900"
              >
                Barcode
              </label>

              <input
                id="barcode"
                value={barcode}
                onChange={(event) =>
                  setBarcode(event.target.value)
                }
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-slate-900"
              >
                Type
              </label>

              <select
                id="type"
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value as
                      | "PRODUCT"
                      | "SERVICE",
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="PRODUCT">
                  Product
                </option>
                <option value="SERVICE">
                  Service
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-slate-900"
              >
                Unit
              </label>

              <input
                id="unit"
                value={unit}
                onChange={(event) =>
                  setUnit(event.target.value)
                }
                placeholder="pcs, kg, litre..."
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-900"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={3}
                placeholder="Optional description"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Pricing
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <label
                htmlFor="costPrice"
                className="block text-sm font-medium text-slate-900"
              >
                Cost price
              </label>

              <input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(event) =>
                  setCostPrice(
                    event.target.value,
                  )
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="sellingPrice"
                className="block text-sm font-medium text-slate-900"
              >
                Selling price
              </label>

              <input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={sellingPrice}
                onChange={(event) =>
                  setSellingPrice(
                    event.target.value,
                  )
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-slate-900"
              >
                Currency
              </label>

              <select
                id="currency"
                value={currency}
                onChange={(event) =>
                  setCurrency(
                    event.target.value,
                  )
                }
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {!currency && (
                  <option value="">
                    Select currency
                  </option>
                )}

                {currencies.map((option) => (
                  <option
                    key={option.code}
                    value={option.code}
                  >
                    {option.code} — {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Stock settings
          </h2>

          <label className="mt-5 flex items-start gap-3">
            <input
              type="checkbox"
              checked={trackInventory}
              onChange={(event) =>
                setTrackInventory(
                  event.target.checked,
                )
              }
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />

            <span>
              <span className="block text-sm font-medium text-slate-900">
                Track stock for this item
              </span>

              <span className="mt-1 block text-sm text-slate-500">
                Turn this off for services or items
                that do not need inventory tracking.
              </span>
            </span>
          </label>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="minimumStock"
                className="block text-sm font-medium text-slate-900"
              >
                Minimum stock
              </label>

              <input
                id="minimumStock"
                type="number"
                min="0"
                step="0.01"
                value={minimumStock}
                onChange={(event) =>
                  setMinimumStock(
                    event.target.value,
                  )
                }
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="reorderLevel"
                className="block text-sm font-medium text-slate-900"
              >
                Reorder level
              </label>

              <input
                id="reorderLevel"
                type="number"
                min="0"
                step="0.01"
                value={reorderLevel}
                onChange={(event) =>
                  setReorderLevel(
                    event.target.value,
                  )
                }
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              router.push("/inventory/products")
            }
            disabled={saving}
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? isEdit
                ? "Saving changes..."
                : "Saving..."
              : isEdit
                ? "Save changes"
                : "Save product"}
          </button>
        </div>
      </form>
    </div>
  );
}