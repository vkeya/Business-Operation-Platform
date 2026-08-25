import Link from "next/link";
import { getProductsAction } from "./listActions";
import ProductList from "./ProductList";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProductsAction();

  const locale = await getLocale();
  const t = getTranslations(locale);

  const activeProducts = products.filter(
    (product) => product.status === "ACTIVE",
  );

  const trackedProducts = products.filter(
    (product) => product.trackInventory,
  );

  const inactiveProducts =
    products.length - activeProducts.length;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:px-8 sm:py-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                {t.inventory.title}
              </span>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold text-emerald-300">
                {t.inventory.productCatalogueLabel}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t.inventory.productCatalogue}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              {t.inventory.productCatalogueDescription}
            </p>
          </div>

          <Link
            href="/inventory/products/new"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
          >
            <span className="mr-2 text-emerald-600">
              +
            </span>
            {t.inventory.addProduct}
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-32 h-56 w-56 rounded-full bg-sky-400/5 blur-3xl" />
      </section>

      {/* Summary */}
      <section
        aria-label={t.inventory.productSummary}
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {t.inventory.catalogue}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {products.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {t.inventory.productsAndServices}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {t.inventory.active}
            </p>

            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {activeProducts.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {t.inventory.currentlyAvailable}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {t.inventory.stockTracked}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {trackedProducts.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {t.inventory.productsConnectedToInventory}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {t.inventory.inactive}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {inactiveProducts}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {t.inventory.notCurrentlyAvailable}
          </p>
        </div>
      </section>

      {/* Product workspace */}
      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              {t.inventory.catalogue}
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {t.inventory.yourProducts}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {t.inventory.searchReviewEditProducts}
            </p>
          </div>

          {products.length > 0 && (
            <Link
              href="/inventory/products/new"
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
            >
              + {t.inventory.addAnotherProduct}
            </Link>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {products.length === 0 ? (
            <div className="px-6 py-16 text-center sm:px-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
                +
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                {t.inventory.productCatalogueEmpty}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {t.inventory.addFirstProductDescription}
              </p>

              <Link
                href="/inventory/products/new"
                className="mt-6 inline-flex items-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {t.inventory.addYourFirstProduct}
              </Link>
            </div>
          ) : (
            <ProductList products={products} />
          )}
        </div>
      </section>

      {/* Helpful operational footer */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {t.inventory.keepCatalogueAccurate}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {t.inventory.catalogueOperationsDescription}
            </p>
          </div>

          <Link
            href="/inventory"
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            {t.inventory.openInventory} →
          </Link>
        </div>
      </section>
    </div>
  );
}