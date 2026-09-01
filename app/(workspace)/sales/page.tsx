import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { saleService } from "@/lib/sales/saleService";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
const locale = await getLocale();
const t = getTranslations(locale);

const business = await getCurrentBusiness();

const sales = await saleService.list(
business.id,
);

const completedSales = sales.filter(
(sale) => sale.status === "COMPLETED",
);

const pendingSales = sales.filter(
(sale) =>
sale.status !== "COMPLETED" &&
sale.status !== "CANCELLED" &&
sale.status !== "REVERSED",
);

const cancelledSales = sales.filter(
(sale) => sale.status === "CANCELLED",
);

const reversedSales = sales.filter(
(sale) => sale.status === "REVERSED",
);

const revenueByCurrency =
sales.reduce<Record<string, number>>(
(totals, sale) => {
if (
sale.status === "CANCELLED" ||
sale.status === "REVERSED"
) {
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

const metricCards = [
{
label: t.sales.transactions,
value: sales.length,
description: t.sales.salesOnRecord,
tone: "text-slate-700",
borderTone: "border-slate-200",
valueTone: "text-slate-900",
icon: "01",
},
{
label: t.sales.completed,
value: completedSales.length,
description: t.sales.completedTransactions,
tone: "text-emerald-700",
borderTone: "border-emerald-200",
valueTone: "text-emerald-900",
icon: "02",
},
{
label: t.sales.pending,
value: pendingSales.length,
description: t.sales.stillInProgress,
tone: "text-amber-700",
borderTone: "border-amber-200",
valueTone: "text-amber-900",
icon: "03",
},
{
label: t.sales.reversed,
value: reversedSales.length,
description: t.sales.reversed,
tone: "text-violet-700",
borderTone: "border-violet-200",
valueTone: "text-violet-900",
icon: "04",
},
{
label: t.sales.itemsSold,
value: totalItems,
description: t.sales.lineItemsAcrossSales,
tone: "text-blue-700",
borderTone: "border-blue-200",
valueTone: "text-blue-900",
icon: "05",
},
];

return ( <div className="space-y-6">
{/* Sales hero */} <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8"> <div className="pointer-events-none absolute inset-0"> <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" /> <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" /> </div>


    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
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

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.sales.title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          {t.sales.description}
        </p>
      </div>

      <Link
        href="/sales/new"
        className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
      >
        <span className="text-violet-600">
          +
        </span>

        {t.sales.recordSale}
      </Link>
    </div>
  </section>

  {/* Sales overview */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {t.sales.activity}
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        {t.sales.salesHealth}
      </h2>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metricCards.map((metric) => (
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
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xs font-bold",
                metric.tone,
              ].join(" ")}
            >
              {metric.icon}
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {metric.description}
          </p>
        </article>
      ))}
    </div>
  </section>

  {/* Revenue and sales health */}
  <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {t.sales.revenue}
        </p>

        <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
          {t.sales.salesValue}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {t.sales.salesValueDescription}
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {revenueEntries.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">
              {t.sales.noRevenueRecorded}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {t.sales.completedSalesWillAppearHere}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {revenueEntries.map(
              ([currency, value]) => (
                <div
                  key={currency}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {currency}
                  </p>

                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
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
    </div>

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {t.sales.activity}
        </p>

        <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
          {t.sales.salesHealth}
        </h2>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
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
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {t.sales.salesRegister}
        </p>

        <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
          {t.sales.recentSales}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {t.sales.reviewTransactions}
        </p>
      </div>

      {sales.length > 0 ? (
        <Link
          href="/sales/new"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-950"
        >
          + {t.sales.recordAnotherSale}
        </Link>
      ) : (
        <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
          {sales.length}{" "}
          {t.sales.transactions}
        </div>
      )}
    </div>

    {sales.length === 0 ? (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-2xl font-semibold text-violet-600">
          +
        </div>

        <p className="mt-5 text-lg font-semibold text-slate-900">
          {t.sales.noSalesYet}
        </p>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {t.sales.recordFirstSaleDescription}
        </p>

        <Link
          href="/sales/new"
          className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {t.sales.recordFirstSale}
        </Link>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {t.sales.sale}
              </th>

              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {t.sales.items}
              </th>

              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {t.sales.value}
              </th>

              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {t.sales.status}
              </th>

              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
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

              const isReversed =
                sale.status === "REVERSED";

              return (
                <tr
                  key={sale.id}
                  className="group border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0"
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
                            : isReversed
                              ? "bg-violet-50 text-violet-700"
                              : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isCompleted
                            ? "bg-emerald-500"
                            : isCancelled
                              ? "bg-red-500"
                              : isReversed
                                ? "bg-violet-500"
                                : "bg-amber-500"
                        }`}
                      />

                      {isCompleted
                        ? t.sales.completed
                        : isCancelled
                          ? t.sales.cancelled
                          : isReversed
                            ? t.sales.reversed
                            : t.sales.pending}
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
    )}
  </section>

  {/* Operations connection */}
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {t.sales.activity}
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-900">
          {t.sales.salesInventoryConnection}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {t.sales.salesInventoryDescription}
        </p>
      </div>

      <Link
        href="/inventory"
        className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-950"
      >
        {t.sales.openInventory} →
      </Link>
    </div>
  </section>
</div>


);
}
