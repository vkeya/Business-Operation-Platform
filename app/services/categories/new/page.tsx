import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import CategoryForm from "./CategoryForm";

export const dynamic = "force-dynamic";

export default async function NewServiceCategoryPage() {
  const business = await getCurrentBusiness();

  if (business.type !== "boutique") {
    notFound();
  }

  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <div className="mx-auto max-w-4xl">
      <section className="flex flex-col gap-6 rounded-3xl bg-slate-950 px-6 py-7 shadow-sm sm:px-8 sm:py-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
            {t.services.categories}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {t.services.addCategory}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Create a category to organise your
            boutique services.
          </p>
        </div>

        <Link
          href="/services/categories"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          {t.common.cancel}
        </Link>
      </section>

      <div className="mt-8">
        <CategoryForm translations={t} />
      </div>
    </div>
  );
}