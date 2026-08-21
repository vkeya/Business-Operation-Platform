"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createRestaurantRecipeAction } from "@/app/restaurant/actions";

interface RecipeFormProps {
  menuId: string;
  menuItemId: string;
}

export default function RecipeForm({
  menuId,
  menuItemId,
}: RecipeFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      await createRestaurantRecipeAction({
        menuItemId,
        name,
        description: description || undefined,
      });

      router.push(
        `/restaurant/menu/${menuId}/items/${menuItemId}/recipe`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create recipe.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
          Recipe setup
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
          Create recipe
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Define the recipe used to prepare this menu item.
          You can add ingredients and quantities after the recipe
          has been created.
        </p>
      </div>

      <div className="space-y-6 px-6 py-7 sm:px-8">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-800">
              Unable to create recipe
            </p>

            <p className="mt-1 text-sm leading-5 text-red-700">
              {error}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="recipe-name"
            className="block text-sm font-semibold text-slate-900"
          >
            Recipe name
          </label>

          <p className="mt-1 text-xs text-slate-500">
            Give the preparation recipe a clear operational name.
          </p>

          <input
            id="recipe-name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. Chips & 1/4 Chicken Recipe"
            required
            className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
          />
        </div>

        <div>
          <label
            htmlFor="recipe-description"
            className="block text-sm font-semibold text-slate-900"
          >
            Description
          </label>

          <p className="mt-1 text-xs text-slate-500">
            Optional preparation notes or instructions for the kitchen.
          </p>

          <textarea
            id="recipe-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={5}
            placeholder="Optional preparation description"
            className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/restaurant/menu/${menuId}/items/${menuItemId}/recipe`,
            )
          }
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create recipe"}
        </button>
      </div>
    </form>
  );
}