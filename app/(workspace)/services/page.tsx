import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productService } from "@/lib/inventory/productService";
import { productCategoryService } from "@/lib/inventory/productCategoryService";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";
import { notFound } from "next/navigation";
import ServiceCategories from "./ServiceCategories";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
const business = await getCurrentBusiness();

if (business.type !== "boutique") {
notFound();
}

const locale = await getLocale();
const t = getTranslations(locale);

const [services, categories] =
await Promise.all([
productService.listServices(
business.id,
),
productCategoryService.listCategories(
business.id,
),
]);

const activeServices = services.filter(
(service) => service.status === "ACTIVE",
);

return ( <div className="space-y-6">
{/* Services hero */} <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8"> <div className="pointer-events-none absolute inset-0"> <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" /> <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" /> </div>


    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            {t.navigation.services}
          </span>

          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold text-emerald-300">
            {t.services.serviceCatalogueLabel}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {t.services.title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          {t.services.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/services/categories"
          className="inline-flex w-fit items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Manage Categories
        </Link>

        <Link
          href="/services/new"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
        >
          <span className="mr-2 text-emerald-600">
            +
          </span>

          {t.services.addService}
        </Link>
      </div>
    </div>
  </section>

  {/* Service overview */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {t.services.serviceCatalogueLabel}
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        {t.services.yourServices}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {t.services.manageServicesDescription}
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.services.totalServices}
            </p>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-violet-900">
              {services.length}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xs font-bold text-violet-700">
            01
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {t.services.servicesInCatalogue}
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.services.activeServices}
            </p>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-emerald-900">
              {activeServices.length}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xs font-bold text-emerald-700">
            02
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {t.services.currentlyAvailable}
        </p>
      </div>
    </div>
  </section>

  {/* Categories */}
  <section>
    <ServiceCategories
      categories={categories}
      translations={t}
    />
  </section>

  {/* Service catalogue */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {t.services.catalogue}
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        {t.services.yourServices}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {t.services.manageServicesDescription}
      </p>
    </div>

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t.services.catalogue}
          </p>

          <p className="mt-1 font-semibold tracking-tight text-slate-900">
            {t.services.yourServices}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {t.services.manageServicesDescription}
          </p>
        </div>

        {services.length > 0 && (
          <Link
            href="/services/new"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-950"
          >
            + {t.services.addService}
          </Link>
        )}
      </div>

      {services.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-2xl font-semibold text-violet-600">
            +
          </div>

          <h3 className="mt-5 text-lg font-semibold text-slate-950">
            {t.services.noServicesYet}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {t.services.createFirstServiceDescription}
          </p>

          <Link
            href="/services/new"
            className="mt-6 inline-flex items-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {t.services.createFirstService}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">
                    {service.name}
                  </p>

                  {service.category && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      {service.category.name}
                    </span>
                  )}
                </div>

                {service.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-5 sm:gap-6">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {t.services.price}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {service.currency}{" "}
                    {service.sellingPrice.toFixed(2)}
                  </p>
                </div>

                <span
                  className={
                    service.status === "ACTIVE"
                      ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                      : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
                  }
                >
                  {service.status === "ACTIVE"
                    ? t.services.active
                    : t.services.inactive}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
</div>


);
}
