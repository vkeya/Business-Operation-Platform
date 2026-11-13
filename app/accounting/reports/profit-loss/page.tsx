
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  BookOpen,
  CircleDollarSign,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  getProfitLossReportAction,
} from "@/lib/accounting/actions";
import type {
  ReportPeriodInput,
  ReportPeriodPreset,
} from "@/lib/reports/period/reportPeriodTypes";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  period?: string | string[];
  startDate?: string | string[];
  endDate?: string | string[];
}>;

const periodOptions: {
  value: ReportPeriodPreset;
  label: string;
}[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "this_year", label: "This year" },
  { value: "custom", label: "Custom date range" },
];

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatAmount(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const requestedPreset = first(params.period);

  const preset: ReportPeriodPreset =
    periodOptions.some(
      (option) => option.value === requestedPreset,
    )
      ? (requestedPreset as ReportPeriodPreset)
      : "this_month";

  const customPeriodIncomplete =
    preset === "custom" &&
    (!first(params.startDate) || !first(params.endDate));

  const input: ReportPeriodInput = customPeriodIncomplete
    ? { preset: "this_month" }
    : {
        preset,
        ...(preset === "custom"
          ? {
              startDate: first(params.startDate),
              endDate: first(params.endDate),
            }
          : {}),
      };

  const report = await getProfitLossReportAction(input);

  const startDate = report.period.startDateLocal;

  const endDate = new Date(
    `${report.period.endDateLocalExclusive}T00:00:00.000Z`,
  );

  endDate.setUTCDate(endDate.getUTCDate() - 1);

  const endDateLocal = endDate.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Profit and Loss hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <Link
            href="/accounting"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Accounting
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Accounting Reports
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                  Financial reporting
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Profit &amp; Loss
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Review posted accounting revenue and recorded
                expenses across your selected reporting period,
                with financial figures separated by currency.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
              <ReceiptText className="h-6 w-6" />
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
              defaultValue={preset}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {preset === "custom" && (
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
                  defaultValue={first(params.startDate) ?? ""}
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
                  defaultValue={first(params.endDate) ?? ""}
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

        <p className="mt-4 text-sm text-slate-500">
          {startDate} to {endDateLocal}
          {" · "}
          {report.period.timezone}
          {" · "}
          Posted journal entries only
        </p>

        {customPeriodIncomplete && (
          <p className="mt-3 text-sm text-amber-700">
            Select both dates to apply the custom period.
            The figures below temporarily show this month.
          </p>
        )}
      </section>

      {/* Financial performance */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Financial analysis
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Profit and loss summary
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Figures are grouped by currency. Different currencies
            are never combined.
          </p>
        </div>

        {report.currencies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
              <BookOpen className="h-6 w-6" />
            </div>

            <p className="mt-4 font-medium text-slate-700">
              No accounting activity for this period
            </p>

            <p className="mt-2 text-sm text-slate-500">
              No posted revenue or expense journal lines were
              found. Try another reporting period.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {report.currencies.map((item) => (
              <section
                key={item.currency}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Reporting currency
                    </p>

                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      {item.currency}
                    </h3>
                  </div>

                  <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    Posted accounting entries
                  </span>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
                  <MetricCard
                    title="Revenue"
                    value={formatAmount(item.currency, item.revenue)}
                    description="Posted revenue account balances"
                    icon={<TrendingUp className="h-5 w-5" />}
                    tone="emerald"
                  />

                  <MetricCard
                    title="Recorded expenses"
                    value={formatAmount(item.currency, item.expenses)}
                    description="Posted expense account balances"
                    icon={<TrendingDown className="h-5 w-5" />}
                    tone="rose"
                  />

                  <MetricCard
                    title="Revenue less recorded expenses"
                    value={formatAmount(
                      item.currency,
                      item.revenueLessRecordedExpenses,
                    )}
                    description="Not verified accounting profit; cost of goods sold is unavailable"
                    icon={<CircleDollarSign className="h-5 w-5" />}
                    tone="violet"
                  />
                </div>

                <div className="grid gap-4 border-t border-slate-100 bg-slate-50/70 p-5 lg:grid-cols-2">
                  <AccountPanel
                    title="Revenue accounts"
                    accounts={item.revenueAccounts}
                    currency={item.currency}
                    emptyMessage="No posted revenue account activity."
                  />

                  <AccountPanel
                    title="Expense accounts"
                    accounts={item.expenseAccounts}
                    currency={item.currency}
                    emptyMessage="No posted expense account activity."
                  />
                </div>
              </section>
            ))}
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
            This report uses posted journal entries within the
            selected accounting entry-date period. Draft entries
            are excluded.
          </p>

          <p>
            Amounts are grouped by their recorded currency.
            Different currencies are not converted or combined.
          </p>

          <p>
            Cost of goods sold is not established in the current
            accounting posting flow. Revenue less recorded
            expenses must therefore not be interpreted as
            verified gross, operating or net profit.
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
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  tone: "emerald" | "rose" | "violet";
}) {
  const styles = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      value: "text-emerald-900",
      border: "border-emerald-100",
    },
    rose: {
      icon: "bg-rose-50 text-rose-700",
      value: "text-rose-900",
      border: "border-rose-100",
    },
    violet: {
      icon: "bg-violet-50 text-violet-700",
      value: "text-violet-900",
      border: "border-violet-100",
    },
  }[tone];

  return (
    <article
      className={`rounded-2xl border ${styles.border} bg-white p-5 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {title}
          </p>

          <p className={`mt-4 text-2xl font-semibold tracking-tight ${styles.value}`}>
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function AccountPanel({
  title,
  accounts,
  currency,
  emptyMessage,
}: {
  title: string;
  accounts: {
    id: string;
    code: string;
    name: string;
    balance: number;
  }[];
  currency: string;
  emptyMessage: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <span className="text-xs text-slate-400">
          {accounts.length} accounts
        </span>
      </div>

      {accounts.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-4 divide-y divide-slate-100">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-start justify-between gap-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-800">
                  {account.name}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Account {account.code}
                </p>
              </div>

              <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                {formatAmount(currency, account.balance)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
