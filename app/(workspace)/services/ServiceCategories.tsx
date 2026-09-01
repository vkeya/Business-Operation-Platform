"use client";

import { useState } from "react";
import { getServicesByCategoryAction } from "./actions";
import type { TranslationSet } from "@/lib/i18n";

interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

interface Service {
  id: string;
  name: string;
  description?: string | null;
  sellingPrice: number;
  currency: string;
  status: string;
}

interface ServiceCategoriesProps {
  categories: ServiceCategory[];
  translations: TranslationSet;
}

export default function ServiceCategories({
  categories,
  translations: t,
}: ServiceCategoriesProps) {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string | null>(null);

  const [services, setServices] =
    useState<Service[]>([]);

  const [loading, setLoading] =
    useState(false);

  async function handleCategoryClick(
    categoryId: string,
  ) {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
      setServices([]);
      return;
    }

    setSelectedCategoryId(categoryId);
    setLoading(true);

    try {
      const result =
        await getServicesByCategoryAction(
          categoryId,
        );

      setServices(
        result.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          sellingPrice: service.sellingPrice,
          currency: service.currency,
          status: service.status,
        })),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
          {t.services.serviceCategories}
        </p>

        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          {t.services.categories}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {t.services.categoriesDescription}
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-sm text-slate-500">
          No categories available.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const selected =
              selectedCategoryId === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  handleCategoryClick(category.id)
                }
                className={`rounded-2xl border p-5 text-left shadow-sm transition ${
                  selected
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow"
                }`}
              >
                <h3 className="font-semibold text-slate-950">
                  {category.name}
                </h3>

                {category.description && (
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {category.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedCategoryId && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="font-semibold text-slate-950">
              {
                categories.find(
                  (category) =>
                    category.id ===
                    selectedCategoryId,
                )?.name
              }
            </h3>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              {t.common.loading}
            </div>
          ) : services.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              {t.services.noServicesYet}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-950">
                      {service.name}
                    </p>

                    {service.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <p className="font-semibold text-slate-900">
                    {service.currency}{" "}
                    {service.sellingPrice.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}