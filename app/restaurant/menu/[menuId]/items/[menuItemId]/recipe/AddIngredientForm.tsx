"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { addRestaurantRecipeIngredientAction } from "@/app/restaurant/actions";

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  unit: string;
}

interface AddIngredientFormProps {
  recipeId: string;
  menuId: string;
  menuItemId: string;
  products: ProductOption[];
}

export default function AddIngredientForm({
  recipeId,
  menuId,
  menuItemId,
  products,
}: AddIngredientFormProps) {
  const router = useRouter();

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleProductChange(value: string) {
    setProductId(value);

    const product = products.find(
      (item) => item.id === value,
    );

    if (product && !unit) {
      setUnit(product.unit);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      await addRestaurantRecipeIngredientAction({
        recipeId,
        productId,
        quantity: Number(quantity),
        unit,
      });

      setProductId("");
      setQuantity("");
      setUnit("");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add ingredient.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6"
    >
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
          Recipe composition
        </p>

        <h3 className="mt-1 text-sm font-semibold text-slate-950">
          Add ingredient
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Select an inventory product and define the quantity used
          in this recipe.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-800">
            Unable to add ingredient
          </p>

          <p className="mt-1 text-sm leading-5 text-red-700">
            {error}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px_140px_auto] sm:items-end">
        <div>
          <label
            htmlFor="ingredient-product"
            className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500"
          >
            Ingredient
          </label>

          <select
            id="ingredient-product"
            value={productId}
            onChange={(event) =>
              handleProductChange(
                event.target.value,
              )
            }
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
          >
            <option value="">
              Select product
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
        </div>

        <div>
          <label
            htmlFor="ingredient-quantity"
            className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500"
          >
            Quantity
          </label>

          <input
            id="ingredient-quantity"
            type="number"
            min="0.0001"
            step="0.0001"
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value)
            }
            placeholder="0"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
          />
        </div>

        <div>
          <label
            htmlFor="ingredient-unit"
            className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500"
          >
            Unit
          </label>

          <input
            id="ingredient-unit"
            value={unit}
            onChange={(event) =>
              setUnit(event.target.value)
            }
            placeholder="kg"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
          />
        </div>

        <button
          type="submit"
          disabled={
            saving ||
            products.length === 0
          }
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add ingredient"}
        </button>
      </div>

      {products.length === 0 && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            No inventory products available
          </p>

          <p className="mt-1 text-sm leading-5 text-amber-800">
            Add products to inventory first before adding recipe
            ingredients.
          </p>
        </div>
      )}
    </form>
  );
}