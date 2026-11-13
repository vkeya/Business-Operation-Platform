import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { profitabilityIntelligenceService } from "@/lib/intelligence/profitabilityIntelligenceService";

function money(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function percent(value: number | null) {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

export default async function ProfitabilityIntelligencePage() {
  const context = await getCurrentBusinessContext();

  const data =
    await profitabilityIntelligenceService.getSummary(
      context.user.id,
      context.business.id,
    );

  return (
    <main className="space-y-6 p-6">
      <section>
        <p className="text-sm font-medium text-cyan-600">
          Professional Intelligence
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">
          Profitability Intelligence
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Understand gross profit, margins, cost coverage, and product
          profitability over the last {data.lookbackDays} days.
        </p>
      </section>

      {data.current.map((bucket) => (
        <section
          key={bucket.currency}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {bucket.currency}
            </h2>
            <span className="text-xs text-slate-500">
              Cost coverage: {percent(bucket.costCoveragePercent)}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Net revenue" value={money(bucket.revenue, bucket.currency)} />
            <Metric label="COGS" value={money(bucket.cogs, bucket.currency)} />
            <Metric label="Gross profit" value={money(bucket.grossProfit, bucket.currency)} />
            <Metric label="Gross margin" value={percent(bucket.grossMarginPercent)} />
            <Metric label="Net profit" value={money(bucket.netProfit, bucket.currency)} />
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Product profitability
        </h2>

        {data.products.length === 0 ? (
          <p className="text-sm text-slate-500">
            No completed sales with profitability data are available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">Currency</th>
                  <th className="px-3 py-3">Revenue</th>
                  <th className="px-3 py-3">COGS</th>
                  <th className="px-3 py-3">Gross profit</th>
                  <th className="px-3 py-3">Margin</th>
                  <th className="px-3 py-3">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product) => (
                  <tr
                    key={`${product.currency}:${product.productId}`}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {product.productName}
                    </td>
                    <td className="px-3 py-3">{product.currency}</td>
                    <td className="px-3 py-3">
                      {money(product.revenue, product.currency)}
                    </td>
                    <td className="px-3 py-3">
                      {money(product.cogs, product.currency)}
                    </td>
                    <td className="px-3 py-3">
                      {money(product.grossProfit, product.currency)}
                    </td>
                    <td className="px-3 py-3">
                      {percent(product.marginPercent)}
                    </td>
                    <td className="px-3 py-3">
                      {percent(product.costCoveragePercent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Cost methodology:</strong>{" "}
        {data.methodology.cogsBasis} Revenue without matching inventory cost
        movements is shown with coverage information rather than assigning
        invented COGS.
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
