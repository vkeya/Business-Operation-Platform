import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCustomerAction,
} from "@/lib/customers/actions";

export const dynamic = "force-dynamic";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{
    customerId: string;
  }>;
}) {
  const { customerId } = await params;

  const customer =
    await getCustomerAction(customerId);

  if (!customer) {
    notFound();
  }

  const completedSales =
    customer.sales.filter(
      (sale) => sale.status === "COMPLETED",
    );

  const totalSales =
    completedSales.reduce(
      (total, sale) =>
        total + sale.totalAmount.toNumber(),
      0,
    );

  const lastSale =
    completedSales[0] ?? null;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <Link
          href="/customers"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Customers
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Customers / Details
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {customer.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
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

              {customer.taxNumber && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  Tax: {customer.taxNumber}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/customers/${customer.id}/edit`}
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Edit customer
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Sales
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {customer.sales.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Sales on record
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Completed value
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {customer.currency ?? ""}
            {customer.currency ? " " : ""}
            {totalSales.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Completed sales
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Credit limit
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {customer.creditLimit !== null
              ? `${customer.currency ?? ""}${customer.currency ? " " : ""}${customer.creditLimit.toLocaleString()}`
              : "—"}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Configured customer limit
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Last sale
          </p>

          <p className="mt-3 text-sm font-semibold text-slate-900">
            {lastSale
              ? new Date(
                  lastSale.createdAt,
                ).toLocaleDateString()
              : "No sales yet"}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {lastSale
              ? lastSale.referenceNumber
              : "No completed sale"}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Customer information
          </h2>

          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Phone
              </dt>

              <dd className="mt-1 text-sm text-slate-700">
                {customer.phone || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Email
              </dt>

              <dd className="mt-1 break-words text-sm text-slate-700">
                {customer.email || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Address
              </dt>

              <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {customer.address || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Tax number
              </dt>

              <dd className="mt-1 text-sm text-slate-700">
                {customer.taxNumber || "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-2">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Sales history
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sales recorded against this customer.
            </p>
          </div>

          {customer.sales.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium text-slate-900">
                No sales yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Sales linked to this customer will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Reference
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customer.sales.map(
                    (sale) => (
                      <tr
                        key={sale.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/sales/${sale.id}`}
                            className="text-sm font-medium text-slate-900 hover:underline"
                          >
                            {sale.referenceNumber}
                          </Link>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(
                            sale.createdAt,
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {sale.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                          {sale.currency}{" "}
                          {sale.totalAmount
                            .toNumber()
                            .toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}