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
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="recipe-name"
          className="block text-sm font-medium text-slate-900"
        >
          Recipe name
        </label>

        <input
          id="recipe-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Chips & 1/4 Chicken Recipe"
          required
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <label
          htmlFor="recipe-description"
          className="block text-sm font-medium text-slate-900"
        >
          Description
        </label>

        <textarea
          id="recipe-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="Optional preparation description"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/restaurant/menu/${menuId}/items/${menuItemId}/recipe`,
            )
          }
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create recipe"}
        </button>
      </div>
    </form>
  );
}