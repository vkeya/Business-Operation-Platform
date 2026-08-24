import Link from "next/link";
import { listCustomersAction } from "@/lib/customers/actions";
import { getLocale } from "@/lib/i18n/locale";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomersAction();

  const locale = await getLocale();
  const t = getTranslations(locale);

  const activeCustomers = customers.filter(
    (customer) => customer.isActive,
  );

  const customersWithSales = customers.filter(
    (customer) => customer._count?.sales > 0,
  );

  const customerLabel =
    customers.length === 1
      ? t.navigation.customers
      : t.navigation.customers;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {t.common.yourBusiness} / {t.navigation.customers}
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {t.navigation.customers}
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage your customers and keep their sales history
            connected to your business.
          </p>
        </div>

        <Link
          href="/customers/new"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {t.common.add} {t.navigation.customers.toLowerCase()}
        </Link>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            {t.navigation.customers}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {customers.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Customers on record
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            {t.dashboard.active}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {activeCustomers.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Currently active
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            With sales
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {customersWithSales.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Customers with recorded sales
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Customer records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View customers and open their account details.
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {customers.length} {customerLabel}
          </span>
        </div>

        {customers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-semibold text-slate-500">
              C
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No customers yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create your first customer record so future sales can
              be connected to the right customer.
            </p>

            <Link
              href="/customers/new"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {t.common.add} {t.navigation.customers.toLowerCase()}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {t.navigation.customers}
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {t.navigation.sales}
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Credit limit
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {t.dashboard.reviewStatus}
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="text-sm font-semibold text-slate-900 hover:underline"
                        >
                          {customer.name}
                        </Link>

                        {customer.taxNumber && (
                          <p className="mt-1 text-xs text-slate-400">
                            Tax: {customer.taxNumber}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">
                          {customer.phone || "—"}
                        </p>

                        {customer.email && (
                          <p className="mt-1 max-w-[240px] truncate text-xs text-slate-500">
                            {customer.email}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {salesCount}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {customer.creditLimit !== null
                          ? `${customer.currency ?? ""}${customer.currency ? " " : ""}${customer.creditLimit.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}`
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            customer.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {customer.isActive
                            ? t.dashboard.active
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline"
                        >
                          {t.common.viewDetails}
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
