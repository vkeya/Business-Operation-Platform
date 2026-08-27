"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  createRestaurantMenuItemAction,
} from "@/app/restaurant/actions";
import type { TranslationSet } from "@/lib/i18n";

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  currency: string;
}

interface MenuItemFormProps {
  menuId: string;
  currency: string;
  products: ProductOption[];
  translations: TranslationSet;
}

export default function MenuItemForm({
  menuId,
  currency,
  products,
  translations,
}: MenuItemFormProps) {
  const router = useRouter();
  const t = translations;

  const [productId, setProductId] =
    useState("");

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [sellingPrice, setSellingPrice] =
    useState("");

  const [isAvailable, setIsAvailable] =
    useState(true);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  function handleProductChange(
    value: string,
  ) {
    setProductId(value);

    if (!value) {
      return;
    }

    const product = products.find(
      (item) => item.id === value,
    );

    if (!product) {
      return;
    }

    setName(product.name);
    setSellingPrice(
      String(product.sellingPrice),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      await createRestaurantMenuItemAction({
        menuId,
        productId:
          productId || undefined,
        name,
        description:
          description || undefined,
        sellingPrice:
          Number(sellingPrice),
        currency,
        isAvailable,
      });

      router.push(
        `/restaurant/menu/${menuId}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.restaurantMenu.createMenuItemError,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
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
          {t.restaurantMenu.menuItemInformation}
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="productId"
              className="block text-sm font-medium text-slate-900"
            >
              {t.restaurantMenu.inventoryProduct}
            </label>

            <select
              id="productId"
              value={productId}
              onChange={(event) =>
                handleProductChange(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">
                {t.restaurantMenu.standaloneMenuItem}
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-slate-500">
              {t.restaurantMenu.inventoryProductDescription}
            </p>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-900"
            >
              {t.restaurantMenu.itemName}
            </label>

            <input
              id="name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder={
                t.restaurantMenu.itemNamePlaceholder
              }
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-900"
            >
              {t.restaurantMenu.descriptionLabel}
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
              placeholder={
                t.restaurantMenu.optionalDescription
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="sellingPrice"
              className="block text-sm font-medium text-slate-900"
            >
              {t.restaurantMenu.sellingPrice}
            </label>

            <div className="mt-2 flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 px-4 text-sm text-slate-500">
                {currency}
              </span>

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
                className="w-full rounded-r-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(event) =>
                setIsAvailable(
                  event.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300"
            />

            <span className="text-sm font-medium text-slate-900">
              {t.restaurantMenu.availableOnMenu}
            </span>
          </label>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/restaurant/menu/${menuId}`,
            )
          }
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          {t.restaurantMenu.cancel}
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? t.restaurantMenu.creatingMenuItem
            : t.restaurantMenu.addMenuItem}
        </button>
      </div>
    </form>
  );
}