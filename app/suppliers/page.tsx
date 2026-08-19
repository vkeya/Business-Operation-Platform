import Link from "next/link";
import { getSuppliersAction } from "./action";

export default async function SuppliersPage() {
  const suppliers = await getSuppliersAction();

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.isActive,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Purchasing / Suppliers
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Suppliers
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage the suppliers your business purchases from.
          </p>
        </div>

        <Link
          href="/suppliers/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add supplier
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Suppliers
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {suppliers.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Suppliers on record
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Active
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {activeSuppliers.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Currently available for purchasing
          </p>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {suppliers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-slate-900">
              No suppliers yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add your first supplier to start managing purchases.
            </p>

            <Link
              href="/suppliers/new"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add supplier
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Supplier
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Currency
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Payment terms
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {supplier.name}
                      </p>

                      {supplier.taxNumber && (
                        <p className="mt-1 text-xs text-slate-500">
                          Tax: {supplier.taxNumber}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {supplier.phone || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {supplier.email || "—"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {supplier.currency || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {supplier.paymentTermsDays !== null
                        ? `${supplier.paymentTermsDays} days`
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {supplier.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
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