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

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getBusinessReportAction } from "@/lib/reports/actions";
import { requireAdvancedReporting } from "@/lib/intelligence/intelligenceAccessService";

export const dynamic = "force-dynamic";

function formatNumber(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercentage(value: number) {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function percentage(
  numerator: number,
  denominator: number,
) {
  if (denominator <= 0) {
    return 0;
  }

  return (numerator / denominator) * 100;
}

export default async function AdvancedReportsPage() {
  const business = await getCurrentBusiness();

  await requireAdvancedReporting(
    business.id,
  );

  const report =
    await getBusinessReportAction();

  const revenue = report.sales.amount;
  const purchases = report.purchases.amount;
  const expenses = report.expenses.amount;
  const profit = report.profit;

  const purchaseRatio =
    percentage(
      purchases,
      revenue,
    );

  const expenseRatio =
    percentage(
      expenses,
      revenue,
    );

  const profitMargin =
    percentage(
      profit,
      revenue,
    );

  const inventoryToRevenueRatio =
    percentage(
      report.inventory.value,
      revenue,
    );

  return (
    <div className="space-y-6">
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
                Deeper analysis of revenue, purchasing,
                expenses, profitability and inventory
                exposure using your business reporting data.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Advanced analysis
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Business performance indicators
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Derived indicators from completed sales,
            received purchases, recorded expenses and
            current inventory position.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Revenue"
            value={formatNumber(revenue)}
            description={`${report.sales.count} completed sales`}
            icon={
              <CreditCard className="h-5 w-5" />
            }
          />

          <MetricCard
            title="Profit estimate"
            value={formatNumber(profit)}
            description={`Estimated margin ${formatPercentage(profitMargin)}`}
            icon={
              <TrendingUp className="h-5 w-5" />
            }
          />

          <MetricCard
            title="Purchase intensity"
            value={formatPercentage(purchaseRatio)}
            description={`${formatNumber(purchases)} received purchases`}
            icon={
              <ReceiptText className="h-5 w-5" />
            }
          />

          <MetricCard
            title="Expense intensity"
            value={formatPercentage(expenseRatio)}
            description={`${formatNumber(expenses)} recorded expenses`}
            icon={
              <TrendingDown className="h-5 w-5" />
            }
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Revenue and cost structure
              </h2>

              <p className="text-sm text-slate-500">
                Current reporting position
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <ReportRow
              label="Revenue"
              value={formatNumber(revenue)}
            />

            <ReportRow
              label="Received purchases"
              value={formatNumber(purchases)}
            />

            <ReportRow
              label="Recorded expenses"
              value={formatNumber(expenses)}
            />

            <div className="border-t border-slate-100 pt-4">
              <ReportRow
                label="Profit estimate"
                value={formatNumber(profit)}
                emphasis
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Boxes className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Inventory exposure
              </h2>

              <p className="text-sm text-slate-500">
                Current inventory position
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Stock value
              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatNumber(
                  report.inventory.value,
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Units
              </p>

              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {report.inventory.units.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500">
              Inventory value relative to revenue
            </p>

            <p className="mt-2 text-xl font-semibold text-slate-900">
              {formatPercentage(
                inventoryToRevenueRatio,
              )}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              This is a reporting ratio only. It does
              not represent inventory turnover or
              working-capital efficiency.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100 bg-amber-50/60 p-6">
        <h2 className="font-semibold text-slate-900">
          Reporting methodology
        </h2>

        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          <p>
            Revenue uses completed sales from the
            existing reporting service.
          </p>

          <p>
            Purchase cost uses received purchases.
            Expenses use recorded business expenses.
          </p>

          <p>
            Profit estimate is revenue minus received
            purchases minus recorded expenses. It is an
            estimate and should not be treated as an
            accounting net-profit statement.
          </p>

          <p>
            Inventory exposure uses the current inventory
            balance valuation already provided by the
            reporting layer.
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
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ReportRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          emphasis
            ? "text-sm font-semibold text-slate-900"
            : "text-sm text-slate-600"
        }
      >
        {label}
      </span>

      <span
        className={
          emphasis
            ? "text-sm font-semibold text-slate-950"
            : "text-sm font-medium text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}