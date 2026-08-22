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
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
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

      <section className="grid gap-5 sm:grid-cols-3">
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

      {/* Remaining customer table and empty state unchanged */}
    </div>
  );
}