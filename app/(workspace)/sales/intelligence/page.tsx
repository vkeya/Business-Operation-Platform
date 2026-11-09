import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { requireSalesIntelligence } from "@/lib/intelligence/intelligenceAccessService";
import {
  salesIntelligenceService,
} from "@/lib/intelligence/salesIntelligenceService";

export const dynamic = "force-dynamic";

function formatMoney(
  currency: string | null,
  value: number | null,
) {
  if (value === null) {
    return "Multiple currencies";
  }

  return `${currency ?? ""} ${value.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`.trim();
}

function formatPercentage(value: number | null) {
  if (value === null) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export default async function SalesIntelligencePage() {
  const business = await getCurrentBusiness();

  await requireSalesIntelligence(business.id);

  const intelligence =
    await salesIntelligenceService.getOverview(
      business.id,
    );

  const current = intelligence.current;
  const previous = intelligence.previous;

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            SmatPic Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Sales Intelligence
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Understand sales performance, customer activity and
            product performance over the last {intelligence.lookbackDays} days.
          </p>
        </div>

        <Link
          href="/sales"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Back to Sales
        </Link>
      </div>

      {intelligence.mixedCurrencies && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Sales include more than one currency. Aggregate revenue,
          average order value and revenue-based rankings are shown
          separately by currency to avoid misleading totals.
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Revenue"
          value={formatMoney(current.currency, current.revenue)}
          detail={`Previous: ${formatMoney(
            previous.currency,
            previous.revenue,
          )}`}
        />

        <Metric
          label="Sales"
          value={current.salesCount.toLocaleString()}
          detail={`Previous: ${previous.salesCount.toLocaleString()}`}
        />

        <Metric
          label="Average Order Value"
          value={formatMoney(
            current.currency,
            current.averageOrderValue,
          )}
          detail={`Previous: ${formatMoney(
            previous.currency,
            previous.averageOrderValue,
          )}`}
        />

        <Metric
          label="Revenue Change"
          value={formatPercentage(
            current.revenueChangePercentage,
          )}
          detail="vs previous 30 days"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Revenue by Currency"
          description="Current 30-day completed-sales revenue."
        >
          <CurrencyList
            rows={current.revenueByCurrency}
          />
        </Panel>

        <Panel
          title="Sales Trend"
          description="Completed sales by day."
        >
          <div className="space-y-3">
            {current.dailyTrend.length === 0 ? (
              <Empty text="No completed sales in this period." />
            ) : (
              current.dailyTrend.slice(-10).map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-slate-500">
                    {day.date}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {day.revenue === null
                      ? `${day.salesCount} sale${
                          day.salesCount === 1 ? "" : "s"
                        }`
                      : `${formatMoney(
                          current.currency,
                          day.revenue,
                        )} · ${day.salesCount} sale${
                          day.salesCount === 1 ? "" : "s"
                        }`}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Top Products"
          description="Products ranked by revenue when a single currency is present; otherwise by units sold."
        >
          <div className="space-y-3">
            {current.topProducts.length === 0 ? (
              <Empty text="No product sales in this period." />
            ) : (
              current.topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {product.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product.unitsSold.toLocaleString()} units
                      </p>
                    </div>
                  </div>

                  {product.revenue !== null && (
                    <span className="text-sm font-semibold text-slate-900">
                      {formatMoney(
                        current.currency,
                        product.revenue,
                      )}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="Top Customers"
          description="Customers ranked by revenue when a single currency is present."
        >
          <div className="space-y-3">
            {current.topCustomers.length === 0 ? (
              <Empty text="No named customer sales in this period." />
            ) : (
              current.topCustomers.map((customer, index) => (
                <div
                  key={`${customer.customerName}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {customer.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {customer.salesCount} sale
                        {customer.salesCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  {customer.revenue !== null && (
                    <span className="text-sm font-semibold text-slate-900">
                      {formatMoney(
                        current.currency,
                        customer.revenue,
                      )}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Metric
          label="Units Sold"
          value={current.unitsSold.toLocaleString()}
          detail={`Previous: ${previous.unitsSold.toLocaleString()}`}
        />

        <Metric
          label="Discount Rate"
          value={`${current.discountRate.toFixed(1)}%`}
          detail={`Previous: ${previous.discountRate.toFixed(1)}%`}
        />
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </section>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function CurrencyList({
  rows,
}: {
  rows: Array<{
    currency: string;
    amount: number;
  }>;
}) {
  if (rows.length === 0) {
    return <Empty text="No completed sales in this period." />;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.currency}
          className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
        >
          <span className="text-sm font-semibold text-slate-700">
            {row.currency}
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {formatMoney(row.currency, row.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
      {text}
    </p>
  );
}
