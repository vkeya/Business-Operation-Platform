import Link from "next/link";
import { getSuppliersAction } from "./action";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await getSuppliersAction();
  
  const locale = await getLocale();
  const t = getTranslations(locale);

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.isActive,
  );

  const inactiveSuppliers = suppliers.filter(
    (supplier) => !supplier.isActive,
  );

  const suppliersWithEmail = suppliers.filter(
    (supplier) => Boolean(supplier.email),
  );

  const suppliersWithTerms = suppliers.filter(
    (supplier) =>
      supplier.paymentTermsDays !== null &&
      supplier.paymentTermsDays > 0,
  );

  return (
   <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:px-8 sm:py-8">
        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                {t.suppliers.breadcrumb}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                  activeSuppliers.length > 0
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {activeSuppliers.length}{" "}
                {activeSuppliers.length === 1
                  ? t.suppliers.activeSupplier
                  : t.suppliers.activeSuppliers}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t.suppliers.title}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              {t.suppliers.description}
            </p>
          </div>

          <Link
            href="/suppliers/new"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            <span className="mr-2 text-emerald-600">
              +
            </span>
            {t.suppliers.addSupplier}
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 right-32 h-56 w-56 rounded-full bg-sky-400/5 blur-3xl" />
      </section>

      {/* Supplier KPIs */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Suppliers
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {suppliers.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {t.suppliers.suppliersOnRecord}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">
            {t.suppliers.active}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-900">
            {activeSuppliers.length}
          </p>

          <p className="mt-2 text-xs text-emerald-700">
            {t.suppliers.availableForPurchasing}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t.suppliers.contactable}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {suppliersWithEmail.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {t.suppliers.suppliersWithEmail}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t.suppliers.paymentTerms}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {suppliersWithTerms.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {t.suppliers.suppliersWithCreditTerms}
          </p>
        </div>
      </section>

      {/* Supplier relationship overview */}
      <section>
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            {t.suppliers.supplierManagement}
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            {t.suppliers.yourSupplierNetwork}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t.suppliers.supplierNetworkDescription}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                ✓
              </span>

              <div>
                <p className="font-semibold text-slate-900">
                  {t.suppliers.activeSuppliersTitle}
                </p>

                <p className="text-xs text-slate-500">
                  {t.suppliers.readyForPurchasing}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              {t.suppliers.activeSuppliersDescription}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                $
              </span>

              <div>
                <p className="font-semibold text-slate-900">
                  {t.suppliers.paymentTerms}
                </p>

                <p className="text-xs text-slate-500">
                  {t.suppliers.supplierCreditInformation}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              {t.suppliers.paymentTermsDescription}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                @
              </span>

              <div>
                <p className="font-semibold text-slate-900">
                  {t.suppliers.contactDetails}
                </p>

                <p className="text-xs text-slate-500">
                  {t.suppliers.keepSupplierInformationCurrent}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              {t.suppliers.contactDetailsDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Supplier register */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600">
              {t.suppliers.supplierRegister}
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              {t.suppliers.supplierDirectory}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {t.suppliers.supplierDirectoryDescription}
            </p>
          </div>

          {suppliers.length > 0 && (
            <Link
              href="/suppliers/new"
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
            >
              + {t.suppliers.addAnotherSupplier}
            </Link>
          )}
        </div>

        {suppliers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
              +
            </div>

            <p className="mt-5 text-lg font-semibold text-slate-950">
              {t.suppliers.noSuppliersYet}
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {t.suppliers.addFirstSupplierDescription}
            </p>

            <Link
              href="/suppliers/new"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {t.suppliers.addFirstSupplier}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {t.suppliers.supplier}
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {t.suppliers.contact}
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {t.suppliers.currency}
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {t.suppliers.paymentTerms}
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {t.suppliers.status}
                  </th>

                  <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {t.suppliers.action}
                  </th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier) => {
                  const initials =
                    supplier.name
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) =>
                        part.charAt(0),
                      )
                      .join("")
                      .toUpperCase();

                  return (
                    <tr
                      key={supplier.id}
                      className="group border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 transition group-hover:bg-slate-950 group-hover:text-white">
                            {initials || "S"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {supplier.name}
                            </p>

                            {supplier.taxNumber && (
                              <p className="mt-1 text-xs text-slate-400">
                                {t.suppliers.tax}:{" "}
                                {supplier.taxNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {supplier.phone || t.suppliers.noPhone}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {supplier.email ||
                            t.suppliers.noEmail}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          {supplier.currency || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {supplier.paymentTermsDays !==
                        null ? (
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {
                                supplier.paymentTermsDays
                              }{" "}
                              {t.suppliers.days}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {t.suppliers.creditTerms}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            {t.suppliers.immediate}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            supplier.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              supplier.isActive
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {supplier.isActive
                            ? t.suppliers.active
                            : t.suppliers.inactive}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-semibold text-slate-400">
                          {t.suppliers.supplier}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Purchasing connection */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {t.suppliers.purchasingConnection}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {t.suppliers.purchasingConnectionDescription}
            </p>
          </div>

          <Link
            href="/purchases"
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            {t.suppliers.openPurchases} →
          </Link>
        </div>
      </section>
    </div>
  );
}