"use client";

import { useState } from "react";
import { updateServiceCategoryAction } from "./actions";
import type { TranslationSet } from "@/lib/i18n";

interface CategoryEditorProps {
  category: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
  };
  translations: TranslationSet;
  onSaved: (
    category: {
      id: string;
      name: string;
      description: string | null;
      isActive: boolean;
    },
  ) => void;
}

export default function CategoryEditor({
  category,
  translations: t,
  onSaved,
}: CategoryEditorProps) {
  const [name, setName] =
    useState(category.name);

  const [description, setDescription] =
    useState(category.description ?? "");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");
	
  const [isActive, setIsActive] =
  useState(category.isActive);

  async function handleSave() {
    setError("");
    setSaving(true);

    try {
      await updateServiceCategoryAction(
  category.id,
  {
    name,
    description,
    isActive,
  },
);

      onSaved({
  id: category.id,
  name: name.trim(),
  description:
    description.trim() || null,
  isActive,
});
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the category.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor={`category-name-${category.id}`}
          className="block text-sm font-medium text-slate-900"
        >
          {t.services.categories}
        </label>

        <input
          id={`category-name-${category.id}`}
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <label
          htmlFor={`category-description-${category.id}`}
          className="block text-sm font-medium text-slate-900"
        >
          {t.inventory.description}
        </label>

        <textarea
          id={`category-description-${category.id}`}
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          rows={3}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>
	  
	  <div>
  <p className="text-sm font-medium text-slate-900">
    {t.services.categoryStatus}
  </p>

  <label className="mt-2 flex items-center gap-3">
    <input
      type="checkbox"
      checked={isActive}
      onChange={(event) =>
        setIsActive(event.target.checked)
      }
      className="h-4 w-4 rounded border-slate-300"
    />

    <span className="text-sm text-slate-600">
      {isActive
        ? t.services.activateCategory
        : t.services.deactivateCategory}
    </span>
  </label>
</div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? t.inventory.saving
            : t.common.save}
        </button>
      </div>
    </div>
  );
}