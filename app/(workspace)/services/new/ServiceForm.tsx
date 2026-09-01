"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  createServiceAction,
  getServiceDefaultsAction,
  getServiceCategoriesAction,
} from "../actions";
import type { TranslationSet } from "@/lib/i18n";

interface ServiceFormProps {
  translations: TranslationSet;
}

interface ServiceCategory {
  id: string;
  name: string;
}

export default function ServiceForm({
  translations: t,
}: ServiceFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] =
    useState("");
  const [costPrice, setCostPrice] =
    useState("0");
  const [sellingPrice, setSellingPrice] =
    useState("");
  const [currency, setCurrency] =
    useState("");
  const [unit, setUnit] =
    useState("service");
  const [taxRate, setTaxRate] =
    useState("");
  const [categories, setCategories] =
    useState<ServiceCategory[]>([]);
  const [categoryId, setCategoryId] =
    useState("");
  const [error, setError] =
    useState("");
  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const result =
          await getServiceCategoriesAction();

        setCategories(
          result.map((category) => ({
            id: category.id,
            name: category.name,
          })),
        );
      } catch {
        // Category loading should not prevent
        // the service form from being used.
      }
    }

    loadCategories();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const defaults =
        await getServiceDefaultsAction();

      const serviceCurrency =
        currency || defaults.currency;

      await createServiceAction({
        name,
        sku,
        description:
          description || undefined,
        unit,
        costPrice:
          Number(costPrice) || 0,
        sellingPrice:
          Number(sellingPrice),
        currency: serviceCurrency,
        taxRate:
          taxRate
            ? Number(taxRate)
            : undefined,
        minimumStock: undefined,
        reorderLevel: undefined,
        categoryId:
          categoryId || undefined,
        barcode: undefined,
        taxCode: undefined,
      });

      router.push("/services");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the service.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
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
          {t.services.addService}
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="service-name"
              className="block text-sm font-medium text-slate-900"
            >
              Service name
            </label>

            <input
              id="service-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              placeholder="e.g. Manicure"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="service-category"
              className="block text-sm font-medium text-slate-900"
            >
              {t.services.categories}
            </label>

            <select
              id="service-category"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">
  {t.services.selectCategory}
</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="service-sku"
              className="block text-sm font-medium text-slate-900"
            >
              SKU
            </label>

            <input
              id="service-sku"
              value={sku}
              onChange={(event) =>
                setSku(event.target.value)
              }
              required
              placeholder="e.g. SVC-MANICURE"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="service-description"
              className="block text-sm font-medium text-slate-900"
            >
              {t.inventory.description}
            </label>

            <textarea
              id="service-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={3}
              placeholder="Optional service description"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="service-unit"
              className="block text-sm font-medium text-slate-900"
            >
              {t.inventory.unit}
            </label>

            <input
              id="service-unit"
              value={unit}
              onChange={(event) =>
                setUnit(event.target.value)
              }
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="service-cost"
                className="block text-sm font-medium text-slate-900"
              >
                {t.inventory.costPrice}
              </label>

              <input
                id="service-cost"
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
                htmlFor="service-price"
                className="block text-sm font-medium text-slate-900"
              >
                {t.inventory.sellingPrice}
              </label>

              <input
                id="service-price"
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
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="service-currency"
                className="block text-sm font-medium text-slate-900"
              >
                {t.inventory.currency}
              </label>

              <input
                id="service-currency"
                value={currency}
                onChange={(event) =>
                  setCurrency(
                    event.target.value
                      .toUpperCase(),
                  )
                }
                placeholder="USD"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="service-tax"
                className="block text-sm font-medium text-slate-900"
              >
                Tax rate
              </label>

              <input
                id="service-tax"
                type="number"
                min="0"
                step="0.01"
                value={taxRate}
                onChange={(event) =>
                  setTaxRate(
                    event.target.value,
                  )
                }
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-800">
              {t.services.description}
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700">
              Services do not use inventory stock tracking.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={() =>
            router.push("/services")
          }
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          {t.common.cancel}
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? t.inventory.saving
            : t.services.addService}
        </button>
      </div>
    </form>
  );
}