import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { saleService } from "@/lib/sales/saleService";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const business = await getCurrentBusiness();

  const sales = await saleService.list(
    business.id,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Business / Sales
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Sales
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Record and manage sales transactions.
          </p>
        </div>

        <Link
          href="/sales/new"
          className="inline-flex w-fit rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Record a sale
        </Link>
      </div>

      {sales.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="rounded-xl bg-slate-50 p-8 text-center">
            <p className="font-medium text-slate-900">
              No sales yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Record your first sale to start tracking
              revenue and transactions.
            </p>

            <Link
              href="/sales/new"
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Record a sale
            </Link>
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent sales
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {sales.length}{" "}
              {sales.length === 1
                ? "sale"
                : "sales"}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {sales.map((sale) => (
                <Link
                  key={sale.id}
                  href={`/sales/${sale.id}`}
                  className="block p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {sale.referenceNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {sale.items.length}{" "}
                        {sale.items.length === 1
                          ? "item"
                          : "items"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-500">
                        {sale.status}
                      </span>

                      <span className="font-semibold text-slate-900">
                        {sale.currency}{" "}
                        {sale.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}