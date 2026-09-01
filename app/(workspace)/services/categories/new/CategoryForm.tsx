"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createServiceCategoryAction } from "../../actions";
import type { TranslationSet } from "@/lib/i18n";

interface CategoryFormProps {
  translations: TranslationSet;
}

export default function CategoryForm({
  translations: t,
}: CategoryFormProps) {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      await createServiceCategoryAction({
        name,
        description:
          description.trim() || undefined,
      });

      router.push("/services/categories");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the category.",
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
          {t.services.addCategory}
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="category-name"
              className="block text-sm font-medium text-slate-900"
            >
              {t.services.categoryName}
            </label>

            <input
              id="category-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              autoFocus
              placeholder="e.g. Hair Care"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="category-description"
              className="block text-sm font-medium text-slate-900"
            >
              {t.inventory.description}
            </label>

            <textarea
              id="category-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={4}
              placeholder="Optional category description"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={() =>
            router.push("/services/categories")
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
            : t.services.addCategory}
        </button>
      </div>
    </form>
  );
}