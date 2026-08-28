"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  createProductSellingUnitAction,
  getProductDefaultsAction,
} from "../actions";
import { currencies } from "@/lib/currency/currencies";
import type { TranslationSet } from "@/lib/i18n";

interface NewProductFormProps {
  translations: TranslationSet;
}

interface SellingUnitInput {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  sellingPrice: string;
}

export default function NewProductForm({
  translations: t,
}: NewProductFormProps) {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [type, setType] = useState<"PRODUCT" | "SERVICE">("PRODUCT");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [currency, setCurrency] = useState("");
  const [trackInventory, setTrackInventory] = useState(true);
  const [minimumStock, setMinimumStock] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");

  const [sellingUnits, setSellingUnits] = useState<
    SellingUnitInput[]
  >([]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

useEffect(() => {
  let active = true;

  async function loadDefaults() {
    try {
      const defaults = await getProductDefaultsAction();

      if (active) {
        setCurrency(defaults.currency);
      }
    } catch (error) {
      console.error(
        "Failed to load product defaults:",
        error,
      );
    }
  }

  loadDefaults();

  return () => {
    active = false;
  };
}, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const product = await createProductAction({
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
      });

      await Promise.all(
        sellingUnits.map((sellingUnit) =>
          createProductSellingUnitAction(
            product.id,
            {
              name: sellingUnit.name.trim(),
              quantity: Number(sellingUnit.quantity),
              unit: sellingUnit.unit.trim(),
              sellingPrice: Number(
                sellingUnit.sellingPrice,
              ),
            },
          ),
        ),
      );

      router.push("/inventory/products");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.inventory.saveProductError,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          {t.inventory.title} / {t.inventory.productCatalogue}
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {t.inventory.addProduct}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {t.inventory.addProductDescription}
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
            {t.inventory.basicInformation}
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-900"
              >
                {t.inventory.productName}
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
                  setSku(event.target.value.toUpperCase())
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
                {t.inventory.barcode}
              </label>

              <input
                id="barcode"
                value={barcode}
                onChange={(event) =>
                  setBarcode(event.target.value)
                }
                placeholder={t.inventory.optional}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-slate-900"
              >
                {t.inventory.type}
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
                <option value="PRODUCT">{t.inventory.product}</option>
                <option value="SERVICE">{t.inventory.service}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-slate-900"
              >
                {t.inventory.unit}
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
                {t.inventory.description}
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={3}
                placeholder={t.inventory.optionalDescription}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {t.inventory.pricing}
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <label
                htmlFor="costPrice"
                className="block text-sm font-medium text-slate-900"
              >
                {t.inventory.costPrice}
              </label>

              <input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(event) =>
                  setCostPrice(event.target.value)
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
                {t.inventory.sellingPrice}
              </label>

              <input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={sellingPrice}
                onChange={(event) =>
                  setSellingPrice(event.target.value)
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
    {t.inventory.currency}
  </label>

  <select
    id="currency"
    value={currency}
    onChange={(event) =>
      setCurrency(event.target.value)
    }
    required
    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
  >
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Selling units
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add optional ways to sell this product, such as shots,
                glasses, draughts, packs, or bottles.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSellingUnits((current) => [
                  ...current,
                  {
                    id: crypto.randomUUID(),
                    name: "",
                    quantity: "",
                    unit,
                    sellingPrice: "",
                  },
                ])
              }
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Add selling unit
            </button>
          </div>

          {sellingUnits.length > 0 && (
            <div className="mt-5 space-y-4">
              {sellingUnits.map((sellingUnit) => (
                <div
                  key={sellingUnit.id}
                  className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-5"
                >
                  <input
                    value={sellingUnit.name}
                    onChange={(event) =>
                      setSellingUnits((current) =>
                        current.map((item) =>
                          item.id === sellingUnit.id
                            ? {
                                ...item,
                                name: event.target.value,
                              }
                            : item,
                        ),
                      )
                    }
                    placeholder="e.g. Shot"
                    required
                    className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <input
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={sellingUnit.quantity}
                    onChange={(event) =>
                      setSellingUnits((current) =>
                        current.map((item) =>
                          item.id === sellingUnit.id
                            ? {
                                ...item,
                                quantity: event.target.value,
                              }
                            : item,
                        ),
                      )
                    }
                    placeholder="Quantity"
                    required
                    className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <input
                    value={sellingUnit.unit}
                    onChange={(event) =>
                      setSellingUnits((current) =>
                        current.map((item) =>
                          item.id === sellingUnit.id
                            ? {
                                ...item,
                                unit: event.target.value,
                              }
                            : item,
                        ),
                      )
                    }
                    placeholder="Unit"
                    required
                    className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sellingUnit.sellingPrice}
                    onChange={(event) =>
                      setSellingUnits((current) =>
                        current.map((item) =>
                          item.id === sellingUnit.id
                            ? {
                                ...item,
                                sellingPrice: event.target.value,
                              }
                            : item,
                        ),
                      )
                    }
                    placeholder="Selling price"
                    required
                    className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setSellingUnits((current) =>
                        current.filter(
                          (item) =>
                            item.id !== sellingUnit.id,
                        ),
                      )
                    }
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {t.inventory.stockSettings}
          </h2>

          <label className="mt-5 flex items-start gap-3">
            <input
              type="checkbox"
              checked={trackInventory}
              onChange={(event) =>
                setTrackInventory(event.target.checked)
              }
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />

            <span>
              <span className="block text-sm font-medium text-slate-900">
                {t.inventory.trackStock}
              </span>

              <span className="mt-1 block text-sm text-slate-500">
                {t.inventory.trackStockDescription}
              </span>
            </span>
          </label>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="minimumStock"
                className="block text-sm font-medium text-slate-900"
              >
                {t.inventory.minimumStock}
              </label>

              <input
                id="minimumStock"
                type="number"
                min="0"
                step="0.01"
                value={minimumStock}
                onChange={(event) =>
                  setMinimumStock(event.target.value)
                }
                placeholder={t.inventory.optional}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="reorderLevel"
                className="block text-sm font-medium text-slate-900"
              >
                {t.inventory.reorderLevel}
              </label>

              <input
                id="reorderLevel"
                type="number"
                min="0"
                step="0.01"
                value={reorderLevel}
                onChange={(event) =>
                  setReorderLevel(event.target.value)
                }
                placeholder={t.inventory.optional}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
  ? t.inventory.saving
  : t.inventory.saveProduct}
          </button>
        </div>
      </form>
    </div>
  );
}