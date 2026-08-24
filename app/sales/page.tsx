import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { saleService } from "@/lib/sales/saleService";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const business = await getCurrentBusiness();

  const t = await getTranslations();

  const sales = await saleService.list(
    business.id,
  );

  const completedSales = sales.filter(
    (sale) => sale.status === "COMPLETED",
  );

  const pendingSales = sales.filter(
    (sale) =>
      sale.status !== "COMPLETED" &&
      sale.status !== "CANCELLED",
  );

  const cancelledSales = sales.filter(
    (sale) => sale.status === "CANCELLED",
  );

  const revenueByCurrency =
    sales.reduce<Record<string, number>>(
      (totals, sale) => {
        if (sale.status === "CANCELLED") {
          return totals;
        }

        totals[sale.currency] =
          (totals[sale.currency] ?? 0) +
          sale.totalAmount;

        return totals;
      },
      {},
    );

  const revenueEntries =
    Object.entries(revenueByCurrency);

  const totalItems = sales.reduce(
    (total, sale) =>
      total + sale.items.length,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:px-8 sm:py-8">
        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                {t.sales.title}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                  completedSales.length > 0
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {completedSales.length}{" "}
                {t.sales.completed}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t.sales.title}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              {t.sales.description}
            </p>
          </div>

          <Link
            href="/sales/new"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            <span className="mr-2 text-emerald-600">
              +
            </span>
            {t.sales.recordSale}
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 right-32 h-56 w-56 rounded-full bg-sky-400/5 blur-3xl" />
      </section>

      {/* Sales KPIs */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t.sales.transactions}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {sales.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {t.sales.salesOnRecord}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">
            {t.sales.completed}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-900">
            {completedSales.length}
          </p>

          <p className="mt-2 text-xs text-emerald-700">
            {t.sales.completedTransactions}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600">
            {t.sales.pending}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-amber-900">
            {pendingSales.length}
          </p>

          <p className="mt-2 text-xs text-amber-700">
            {t.sales.stillInProgress}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t.sales.itemsSold}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {totalItems}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {t.sales.lineItemsAcrossSales}
          </p>
        </div>
      </section>

      {/* Revenue */}
      <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600">
            {t.sales.revenue}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            {t.sales.salesValue}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t.sales.salesValueDescription}
          </p>

          {revenueEntries.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-700">
                {t.sales.noRevenueRecorded}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {t.sales.completedSalesWillAppearHere}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {revenueEntries.map(
                ([currency, value]) => (
                  <div
                    key={currency}
                    className="rounded-xl bg-slate-50 p-5"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      {currency}
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {value.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t.sales.activity}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            {t.sales.salesHealth}
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {t.sales.completed}
              </span>

              <span className="text-sm font-semibold text-emerald-700">
                {completedSales.length}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width:
                    sales.length > 0
                      ? `${Math.min(
                          100,
                          (completedSales.length /
                            sales.length) *
                            100,
                        )}%`
                      : "0%",
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {t.sales.cancelled}
              </span>

              <span className="text-sm font-semibold text-slate-700">
                {cancelledSales.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sales register */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              {t.sales.salesRegister}
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {t.sales.recentSales}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {t.sales.reviewTransactions}
            </p>
          </div>

          {sales.length > 0 && (
            <Link
              href="/sales/new"
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
            >
              + {t.sales.recordAnotherSale}
            </Link>
          )}
        </div>

        {sales.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="rounded-2xl bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
                +
              </div>

              <p className="mt-5 text-lg font-semibold text-slate-950">
                {t.sales.noSalesYet}
              </p>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {t.sales.recordFirstSaleDescription}
              </p>

              <Link
                href="/sales/new"
                className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {t.sales.recordFirstSale}
              </Link>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {t.sales.sale}
                    </th>

                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {t.sales.items}
                    </th>

                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {t.sales.value}
                    </th>

                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {t.sales.status}
                    </th>

                    <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {t.sales.action}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sales.map((sale) => {
                    const isCompleted =
                      sale.status === "COMPLETED";

                    const isCancelled =
                      sale.status === "CANCELLED";

                    return (
                      <tr
                        key={sale.id}
                        className="group border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/sales/${sale.id}`}
                            className="font-semibold text-slate-900 transition hover:text-emerald-700"
                          >
                            {sale.referenceNumber}
                          </Link>

                          <p className="mt-1 text-xs text-slate-400">
                            {t.sales.saleTransaction}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                            {sale.items.length}{" "}
                            {sale.items.length === 1
                              ? t.sales.item
                              : t.sales.items}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900">
                            {sale.currency}{" "}
                            {sale.totalAmount.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700"
                                : isCancelled
                                  ? "bg-red-50 text-red-600"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : isCancelled
                                    ? "bg-red-500"
                                    : "bg-amber-500"
                              }`}
                            />

                            {sale.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/sales/${sale.id}`}
                            className="text-xs font-semibold text-slate-600 transition hover:text-slate-950"
                          >
                            {t.sales.viewSale} →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>

      {/* Operations connection */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {t.sales.salesInventoryConnection}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {t.sales.salesInventoryDescription}
            </p>
          </div>

          <Link
            href="/inventory"
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            {t.sales.openInventory} →
          </Link>
        </div>
      </section>
    </div>
  );
}