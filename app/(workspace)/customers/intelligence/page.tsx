import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { customerIntelligenceService } from "@/lib/intelligence/customerIntelligenceService";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number, currency: string) {
  return `${currency} ${formatNumber(value)}`;
}

export default async function CustomerIntelligencePage() {
  const business = await getCurrentBusiness();
  const intelligence =
    await customerIntelligenceService.getOverview(
      business.id,
    );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Professional Intelligence
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Customer Intelligence
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Understand customer activity, repeat purchasing,
          revenue contribution, and customer data quality
          without mixing currencies.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Active customers"
          value={formatNumber(
            intelligence.summary.activeCustomers,
          )}
        />
        <Metric
          label="Repeat customer rate"
          value={`${intelligence.summary.repeatCustomerRate.toFixed(1)}%`}
        />
        <Metric
          label="New customers"
          value={formatNumber(
            intelligence.summary.newCustomers,
          )}
        />
        <Metric
          label="Returning customers"
          value={formatNumber(
            intelligence.summary.returningCustomers,
          )}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Metric
          label="Revenue"
          value={
            intelligence.revenueByCurrency.length === 1
              ? formatCurrency(
                  intelligence.revenueByCurrency[0].revenue,
                  intelligence.revenueByCurrency[0].currency,
                )
              : "Multiple currencies"
          }
          detail={`${intelligence.summary.revenueChangePct >= 0 ? "+" : ""}${intelligence.summary.revenueChangePct.toFixed(1)}% vs previous period`}
        />
        <Metric
          label="Revenue per active customer"
          value={
            intelligence.revenueByCurrency.length === 1
              ? formatCurrency(
                  intelligence.summary.averageRevenuePerCustomer,
                  intelligence.revenueByCurrency[0].currency,
                )
              : "Multiple currencies"
          }
          detail="Current 30-day period"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold">
            Revenue by currency
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {intelligence.revenueByCurrency.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">
              No customer revenue is available for the
              current period.
            </p>
          ) : (
            intelligence.revenueByCurrency.map((item) => (
              <div
                key={item.currency}
                className="grid gap-3 px-6 py-4 md:grid-cols-4"
              >
                <div className="font-medium">
                  {item.currency}
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Revenue
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(
                      item.revenue,
                      item.currency,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Customers
                  </p>
                  <p className="font-semibold">
                    {formatNumber(item.customerCount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Period change
                  </p>
                  <p className="font-semibold">
                    {item.revenueChangePct >= 0 ? "+" : ""}
                    {item.revenueChangePct.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold">
            Top customers
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Currency</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">Sales</th>
                <th className="px-6 py-3">AOV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {intelligence.topCustomers.map((customer) => (
                <tr key={`${customer.customerId}-${customer.currency}`}>
                  <td className="px-6 py-3 font-medium">
                    {customer.customerName}
                  </td>
                  <td className="px-6 py-3">
                    {customer.currency}
                  </td>
                  <td className="px-6 py-3">
                    {formatCurrency(
                      customer.revenue,
                      customer.currency,
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {formatNumber(customer.salesCount)}
                  </td>
                  <td className="px-6 py-3">
                    {formatCurrency(
                      customer.averageOrderValue,
                      customer.currency,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-sm font-semibold text-amber-900">
          Customer data quality
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          {formatNumber(
            intelligence.dataQuality.unassignedSalesCount,
          )}{" "}
          completed sales in the current period have no
          customer attached, representing{" "}
          {intelligence.dataQuality.unassignedCustomerRate.toFixed(
            1,
          )}
          % of completed sales.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-sm font-semibold">
          Methodology
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
          {intelligence.methodology.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-xs text-slate-500">
          {detail}
        </p>
      ) : null}
    </div>
  );
}
