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
      className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5"
    >
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_140px_140px_auto] sm:items-end">
        <div>
          <label
            htmlFor="ingredient-product"
            className="block text-sm font-medium text-slate-900"
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
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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
            className="block text-sm font-medium text-slate-900"
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
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label
            htmlFor="ingredient-unit"
            className="block text-sm font-medium text-slate-900"
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
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <button
          type="submit"
          disabled={saving || products.length === 0}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add"}
        </button>
      </div>

      {products.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          No products are available yet. Add products to inventory first.
        </p>
      )}
    </form>
  );
}