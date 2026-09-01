import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Plus,
  ShoppingCart,
  UserX,
  Users,
} from "lucide-react";

import { listCustomersAction } from "@/lib/customers/actions";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers =
    await listCustomersAction();

  const locale =
    await getLocale();

  const t =
    getTranslations(locale);

  const activeCustomers =
    customers.filter(
      (customer) => customer.isActive,
    );

  const customersWithSales =
    customers.filter(
      (customer) =>
        (customer._count?.sales ?? 0) > 0,
    );

  const inactiveCustomers =
    customers.filter(
      (customer) => !customer.isActive,
    );

  const metricCards = [
    {
      label: t.navigation.customers,
      value: customers.length,
      description:
        t.customers.customersOnRecord,
      icon: Users,
      tone: "text-violet-700",
      borderTone:
        "border-violet-200",
      valueTone:
        "text-violet-900",
    },
    {
      label: t.dashboard.active,
      value: activeCustomers.length,
      description:
        t.customers.currentlyActive,
      icon: CheckCircle2,
      tone: "text-emerald-700",
      borderTone:
        "border-emerald-200",
      valueTone:
        "text-emerald-900",
    },
    {
      label: t.customers.withSales,
      value: customersWithSales.length,
      description:
        t.customers
          .customersWithRecordedSales,
      icon: ShoppingCart,
      tone: "text-blue-700",
      borderTone:
        "border-blue-200",
      valueTone:
        "text-blue-900",
    },
    {
      label: t.customers.inactive,
      value: inactiveCustomers.length,
      description:
        "Customer records not currently active",
      icon: UserX,
      tone: "text-slate-700",
      borderTone:
        "border-slate-200",
      valueTone:
        "text-slate-900",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Customers hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                {t.navigation.customers}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-slate-300">
                {customers.length}{" "}
                {customers.length === 1
                  ? "customer"
                  : "customers"}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.navigation.customers}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {t.customers.description}
            </p>
          </div>

          <Link
            href="/customers/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
          >
            <Plus className="h-4 w-4 text-violet-600" />

            {t.customers.addCustomer}
          </Link>
        </div>
      </section>

      {/* Customer overview */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Customer overview
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Your customer relationships
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => {
            const Icon =
              metric.icon;

            return (
              <article
                key={metric.label}
                className={[
                  "rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
                  metric.borderTone,
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      {metric.label}
                    </p>

                    <p
                      className={[
                        "mt-4 text-2xl font-semibold tracking-tight",
                        metric.valueTone,
                      ].join(" ")}
                    >
                      {metric.value}
                    </p>
                  </div>

                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50",
                      metric.tone,
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {metric.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Customer records */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Customer workspace
              </p>

              <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
                {t.customers.customerRecords}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t.customers.viewCustomersAndDetails}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              {customers.length}{" "}
              {customers.length === 1
                ? "customer"
                : "customers"}
            </div>

            <Link
              href="/customers/new"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
            >
              {t.customers.addCustomer}

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-violet-600">
              <Users className="h-7 w-7" />
            </div>

            <h3 className="mt-5 font-semibold text-slate-900">
              {t.customers.noCustomersYet}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {t.customers.createFirstCustomer}
            </p>

            <Link
              href="/customers/new"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              {t.customers.addCustomer}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.navigation.customers}
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.customers.contact}
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.navigation.sales}
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.customers.creditLimit}
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.dashboard.reviewStatus}
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.common.viewDetails}
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => {
                  const salesCount =
                    customer._count?.sales ?? 0;

                  return (
                    <tr
                      key={customer.id}
                      className="group border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-sm font-bold text-violet-700">
                            {customer.name
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <Link
                              href={`/customers/${customer.id}`}
                              className="text-sm font-semibold text-slate-950 transition hover:text-violet-700"
                            >
                              {customer.name}
                            </Link>

                            {customer.taxNumber && (
                              <p className="mt-1 text-xs text-slate-400">
                                {t.customers.tax}:{" "}
                                {customer.taxNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {customer.phone || "—"}
                        </p>

                        {customer.email && (
                          <p className="mt-1 max-w-[240px] truncate text-xs text-slate-500">
                            {customer.email}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                          {salesCount}{" "}
                          {salesCount === 1
                            ? "sale"
                            : "sales"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {customer.creditLimit !==
                        null ? (
                          <p className="text-sm font-semibold text-slate-900">
                            {customer.currency ?? ""}
                            {customer.currency
                              ? " "
                              : ""}
                            {customer.creditLimit.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </p>
                        ) : (
                          <span className="text-sm text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                            customer.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              customer.isActive
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {customer.isActive
                            ? t.dashboard.active
                            : t.customers.inactive}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-violet-700"
                        >
                          {t.common.viewDetails}

                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}