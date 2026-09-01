import Link from "next/link";
import {
Building2,
CheckCircle2,
Clock3,
Mail,
Plus,
Users,
} from "lucide-react";

import { getSuppliersAction } from "./action";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
const suppliers =
await getSuppliersAction();

const locale =
await getLocale();

const t =
getTranslations(locale);

const activeSuppliers =
suppliers.filter(
(supplier) => supplier.isActive,
);

const inactiveSuppliers =
suppliers.filter(
(supplier) => !supplier.isActive,
);

const suppliersWithEmail =
suppliers.filter(
(supplier) =>
Boolean(supplier.email),
);

const suppliersWithTerms =
suppliers.filter(
(supplier) =>
supplier.paymentTermsDays !== null &&
supplier.paymentTermsDays > 0,
);

return ( <div className="space-y-6">
{/* Hero */} <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8"> <div className="pointer-events-none absolute inset-0"> <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />


      <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
    </div>

    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            {t.suppliers.breadcrumb}
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-slate-300">
            {suppliers.length}{" "}
            {suppliers.length === 1
              ? t.suppliers.supplier
              : t.suppliers.title}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {t.suppliers.title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          {t.suppliers.description}
        </p>
      </div>

      <Link
        href="/suppliers/new"
        className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
      >
        <Plus className="h-4 w-4 text-violet-600" />

        {t.suppliers.addSupplier}
      </Link>
    </div>
  </section>

  {/* Supplier overview */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {t.suppliers.supplierManagement}
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        {t.suppliers.yourSupplierNetwork}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {t.suppliers.supplierNetworkDescription}
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total suppliers */}
      <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Suppliers
            </p>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-violet-900">
              {suppliers.length}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {t.suppliers.suppliersOnRecord}
        </p>
      </div>

      {/* Active */}
      <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.suppliers.active}
            </p>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-emerald-900">
              {activeSuppliers.length}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {t.suppliers.availableForPurchasing}
        </p>
      </div>

      {/* Contactable */}
      <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.suppliers.contactable}
            </p>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-sky-900">
              {suppliersWithEmail.length}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-sky-700">
            <Mail className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {t.suppliers.suppliersWithEmail}
        </p>
      </div>

      {/* Payment terms */}
      <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {t.suppliers.paymentTerms}
            </p>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-amber-900">
              {suppliersWithTerms.length}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-amber-700">
            <Clock3 className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {t.suppliers.suppliersWithCreditTerms}
        </p>
      </div>
    </div>
  </section>

  {/* Supplier network details */}
  <section className="grid gap-4 lg:grid-cols-2">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold tracking-tight text-slate-900">
            {t.suppliers.activeSuppliersTitle}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t.suppliers.readyForPurchasing}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 px-5 py-4">
        <p className="text-2xl font-semibold text-slate-900">
          {activeSuppliers.length}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {t.suppliers.activeSuppliersDescription}
        </p>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Clock3 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold tracking-tight text-slate-900">
            {t.suppliers.paymentTerms}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t.suppliers.supplierCreditInformation}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 px-5 py-4">
        <p className="text-2xl font-semibold text-slate-900">
          {suppliersWithTerms.length}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {t.suppliers.paymentTermsDescription}
        </p>
      </div>
    </div>
  </section>

  {/* Supplier register */}
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Building2 className="h-5 w-5" />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t.suppliers.supplierRegister}
          </p>

          <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
            {t.suppliers.supplierDirectory}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t.suppliers.supplierDirectoryDescription}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
        {suppliers.length}{" "}
        {suppliers.length === 1
          ? t.suppliers.supplier
          : t.suppliers.title}
      </div>
    </div>

    {suppliers.length === 0 ? (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-violet-600">
          <Building2 className="h-7 w-7" />
        </div>

        <p className="mt-5 text-lg font-semibold text-slate-900">
          {t.suppliers.noSuppliersYet}
        </p>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {t.suppliers.addFirstSupplierDescription}
        </p>

        <Link
          href="/suppliers/new"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {t.suppliers.addFirstSupplier}
        </Link>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {t.suppliers.supplier}
              </th>

              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {t.suppliers.contact}
              </th>

              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {t.suppliers.currency}
              </th>

              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {t.suppliers.paymentTerms}
              </th>

              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {t.suppliers.status}
              </th>

              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
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
                      {supplier.phone ||
                        t.suppliers.noPhone}
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
                          {supplier.paymentTermsDays}{" "}
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
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {t.suppliers.supplierManagement}
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-900">
          {t.suppliers.purchasingConnection}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {t.suppliers.purchasingConnectionDescription}
        </p>
      </div>

      <Link
        href="/purchases"
        className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-950"
      >
        {t.suppliers.openPurchases} →
      </Link>
    </div>
  </section>
</div>


);
}
