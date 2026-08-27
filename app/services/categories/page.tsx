import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productCategoryService } from "@/lib/inventory/productCategoryService";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import CategoryManagement from "./CategoryManagement";

export const dynamic = "force-dynamic";

export default async function ServiceCategoriesPage() {
  const business = await getCurrentBusiness();

  if (business.type !== "boutique") {
    notFound();
  }

  const locale = await getLocale();
  const t = getTranslations(locale);

  const categories =
    await productCategoryService.listAllCategories(
      business.id,
    );

  const activeCategories = categories.filter(
    (category) => category.isActive,
  );

  const inactiveCategories = categories.filter(
    (category) => !category.isActive,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-6 rounded-3xl bg-slate-950 px-6 py-7 shadow-sm sm:px-8 sm:py-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
            {t.navigation.services}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {t.services.categories}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Manage the categories used to organise
            your boutique services.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
  <Link
    href="/services"
    className="inline-flex w-fit items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
  >
    {t.common.cancel}
  </Link>

  <Link
    href="/services/categories/new"
    className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
  >
    <span className="mr-2 text-emerald-600">
      +
    </span>
    {t.services.addCategory}
  </Link>
</div>
      </section>

      <CategoryManagement
  categories={categories}
  translations={t}
/>
    </div>
  );
}