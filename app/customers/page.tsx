import Link from "next/link";
import { listCustomersAction } from "@/lib/customers/actions";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomersAction();

  const activeCustomers = customers.filter(
    (customer) => customer.isActive,
  );

  const customersWithSales = customers.filter(
    (customer) => customer._count?.sales > 0,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Business / Customers
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Customers
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
          Add customer
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Customers
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
            Active
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
        {customers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
              C
            </div>

            <p className="mt-5 font-semibold text-slate-900">
              No customers yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add your first customer to start keeping customer
              records connected to your sales.
            </p>

            <Link
              href="/customers/new"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add your first customer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Credit
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Sales
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="font-semibold text-slate-900 hover:text-emerald-700"
                      >
                        {customer.name}
                      </Link>

                      {customer.taxNumber && (
                        <p className="mt-1 text-xs text-slate-500">
                          Tax: {customer.taxNumber}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {customer.phone || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {customer.email || "—"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {customer.creditLimit !== null
                        ? `${customer.currency || ""} ${customer.creditLimit.toLocaleString()}`
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {customer._count?.sales ?? 0}
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
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
                      >
                        View details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}