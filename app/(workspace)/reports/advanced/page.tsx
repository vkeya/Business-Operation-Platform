
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  CreditCard,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { getCoreBusinessReportAction } from "@/lib/reports/actions";
import { requireAdvancedReporting } from "@/lib/intelligence/intelligenceAccessService";

export const dynamic = "force-dynamic";

interface AdvancedReportsPageProps {
  searchParams: Promise<{
    period?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

function formatAmount(currency: string, value: number) {
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AdvancedReportsPage({
  searchParams,
}: AdvancedReportsPageProps) {
  const context = await getCurrentBusinessContext();
  const business = context.business;

  await requireBusinessPermission(
    context.user.id,
    business.id,
    "reports.advanced.read",
  );

  await requireAdvancedReporting(business.id);

  const params = await searchParams;

  const allowedPresets = [
    "today",
    "yesterday",
    "this_week",
    "last_week",
    "this_month",
    "last_month",
    "this_year",
    "custom",
  ] as const;

  const selectedPreset = allowedPresets.includes(
    params.period as (typeof allowedPresets)[number],
  )
    ? (params.period as (typeof allowedPresets)[number])
    : "this_month";

  const customPeriodIncomplete =
    selectedPreset === "custom" &&
    (!params.startDate || !params.endDate);

  const report = await getCoreBusinessReportAction(
    customPeriodIncomplete
      ? { preset: "this_month" }
      : {
          preset: selectedPreset,
          ...(selectedPreset === "custom"
            ? {
                startDate: params.startDate,
                endDate: params.endDate,
              }
            : {}),
        },
  );

  return (
    <div className="space-y-6">
      {/* Advanced reporting hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Advanced Reporting
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                  Professional
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Advanced business reporting
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Detailed analysis of sales, returns, purchasing,
                expenses and current inventory, with financial
                figures separated by transaction currency.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Reporting period */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form
          method="GET"
          className="flex flex-col gap-4 lg:flex-row lg:items-end"
        >
          <div className="w-full lg:max-w-xs">
            <label
              htmlFor="period"
              className="block text-xs font-medium text-slate-500"
            >
              Reporting period
            </label>

            <select
              id="period"
              name="period"
              defaultValue={selectedPreset}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This week</option>
              <option value="last_week">Last week</option>
              <option value="this_month">This month</option>
              <option value="last_month">Last month</option>
              <option value="this_year">This year</option>
              <option value="custom">Custom date range</option>
            </select>
          </div>

          {selectedPreset === "custom" && (
            <>
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-xs font-medium text-slate-500"
                >
                  Start date
                </label>

                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  defaultValue={params.startDate || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-xs font-medium text-slate-500"
                >
                  End date
                </label>

                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  required
                  defaultValue={params.endDate || ""}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Apply filter
          </button>
        </form>

        {customPeriodIncomplete && (
          <p className="mt-4 text-sm text-amber-700">
            Select both dates to apply the custom period.
            The figures below temporarily show this month.
          </p>
        )}
      </section>

      {/* Currency-separated performance */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Advanced analysis
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Business performance indicators
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Financial figures are presented separately for each
            transaction currency. Different currencies are never
            added together.
          </p>
        </div>

        {report.currencies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-medium text-slate-700">
              No report data for this period
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Try another reporting period or check whether
              transactions have been recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {report.currencies.map((item) => {
              const returnedExcludingTax =
                item.returns.totalAmount - item.returns.taxAmount;

              const netRevenueExcludingTax =
                item.sales.revenueExcludingTax -
                returnedExcludingTax;

              return (
                <section
                  key={item.currency}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Transaction currency
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">
                        {item.currency}
                      </h3>
                    </div>

                    <p className="text-sm text-slate-500">
                      {item.sales.count} completed sales ·{" "}
                      {item.returns.count} returns
                    </p>
                  </div>

                  <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      title="Sales revenue"
                      value={formatAmount(
                        item.currency,
                        item.sales.revenueExcludingTax,
                      )}
                      description="Completed sales, excluding tax and before returns"
                      icon={<CreditCard className="h-5 w-5" />}
                    />

                    <MetricCard
                      title="Returns"
                      value={formatAmount(
                        item.currency,
                        item.returns.totalAmount,
                      )}
                      description={`${item.returns.count} recorded returns, including tax`}
                      icon={<TrendingDown className="h-5 w-5" />}
                    />

                    <MetricCard
                      title="Received purchases"
                      value={formatAmount(
                        item.currency,
                        item.purchases.receivedAmount,
                      )}
                      description={`${item.purchases.receivedCount} received purchase records`}
                      icon={<ReceiptText className="h-5 w-5" />}
                    />

                    <MetricCard
                      title="Expenses incurred"
                      value={formatAmount(
                        item.currency,
                        item.expenses.incurredAmount,
                      )}
                      description={`${item.expenses.count} recorded expense records`}
                      icon={<TrendingDown className="h-5 w-5" />}
                    />
                  </div>

                  <div className="grid gap-4 border-t border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Net sales revenue excluding tax
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">
                        {formatAmount(
                          item.currency,
                          netRevenueExcludingTax,
                        )}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Sales revenue less returned value excluding tax
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Current inventory value
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">
                        {formatAmount(
                          item.currency,
                          item.inventory.value,
                        )}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.inventory.units.toLocaleString()} units currently in stock
                      </p>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      {/* Reporting methodology */}
      <section className="rounded-3xl border border-amber-100 bg-amber-50/60 p-6">
        <h2 className="font-semibold text-slate-900">
          Reporting methodology and limitations
        </h2>

        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          <p>
            Sales revenue excludes tax. Returns are displayed
            separately, and net sales revenue is calculated
            after deducting returned value excluding tax.
          </p>

          <p>
            Received purchases are reported separately from
            expenses. Purchases should not automatically be
            treated as expenses or cost of goods sold.
          </p>

          <p>
            Expenses represent recorded incurred expenses.
            They should not automatically be interpreted as
            confirmed cash payments.
          </p>

          <p>
            Inventory value represents the current inventory
            position, not historical inventory value at the
            end of the selected reporting period.
          </p>

          <p>
            Accounting profit is not presented because the
            current accounting reporting foundation does not
            yet establish cost of goods sold.
          </p>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}
