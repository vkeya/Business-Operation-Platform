"use client";

import { useState } from "react";
import CategoryEditor from "../CategoryEditor";
import type { TranslationSet } from "@/lib/i18n";

interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

interface CategoryManagementProps {
  categories: ServiceCategory[];
  translations: TranslationSet;
}

export default function CategoryManagement({
  categories,
  translations: t,
}: CategoryManagementProps) {
  const [categoryList, setCategoryList] =
    useState(categories);

  const [editingCategoryId, setEditingCategoryId] =
    useState<string | null>(null);

  const activeCategories = categoryList.filter(
    (category) => category.isActive,
  );

  const inactiveCategories = categoryList.filter(
    (category) => !category.isActive,
  );

  function handleSaved(
    updatedCategory: ServiceCategory,
  ) {
    setCategoryList((current) =>
      current.map((category) =>
        category.id === updatedCategory.id
          ? updatedCategory
          : category,
      ),
    );

    setEditingCategoryId(null);
  }

  function renderCategory(
    category: ServiceCategory,
  ) {
    const isEditing =
      editingCategoryId === category.id;

    if (isEditing) {
      return (
        <div
          key={category.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <CategoryEditor
            category={category}
            translations={t}
            onSaved={handleSaved}
          />

          <button
            type="button"
            onClick={() =>
              setEditingCategoryId(null)
            }
            className="mt-3 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            {t.common.cancel}
          </button>
        </div>
      );
    }

    return (
      <div
        key={category.id}
        className={
          category.isActive
            ? "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            : "rounded-2xl border border-slate-200 bg-slate-50 p-5"
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              className={
                category.isActive
                  ? "font-semibold text-slate-950"
                  : "font-semibold text-slate-700"
              }
            >
              {category.name}
            </h3>

            {category.description && (
              <p className="mt-2 text-sm leading-5 text-slate-500">
                {category.description}
              </p>
            )}
          </div>

          <span
            className={
              category.isActive
                ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                : "rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
            }
          >
            {category.isActive
              ? t.services.active
              : t.services.inactive}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingCategoryId(category.id)
          }
          className="mt-4 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          {t.common.edit}
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="mt-8">
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            {t.services.active}
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {t.services.activeCategories}
          </h2>
        </div>

        {activeCategories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500 shadow-sm">
            No active categories.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCategories.map(renderCategory)}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {t.services.inactive}
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {t.services.inactiveCategories}
          </h2>
        </div>

        {inactiveCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-sm text-slate-500">
            No inactive categories.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inactiveCategories.map(renderCategory)}
          </div>
        )}
      </section>
    </>
  );
}