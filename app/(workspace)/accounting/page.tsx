import {
  Banknote,
  BookOpen,
  CircleDollarSign,
  Landmark,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  getAccountsAction,
  initializeAccountsAction,
} from "@/lib/accounting/actions";
import { getAccountingMetrics } from "@/lib/accounting/dashboard/accountingMetrics";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";

export const dynamic = "force-dynamic";

function formatAmount(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default async function AccountingPage() {
  const business =
    await getCurrentBusiness();

  const accounts =
    await getAccountsAction();

  const metrics =
    await getAccountingMetrics(
      business.id,
    );

  const metricCards = [
    {
      label: "Revenue",
      value: metrics.revenue,
      description: "Income recorded across your business",
      icon: TrendingUp,
      tone: "from-violet-600 to-purple-700",
      iconTone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Expenses",
      value: metrics.expenses,
      description: "Business costs recorded",
      icon: TrendingDown,
      tone: "from-rose-500 to-orange-500",
      iconTone: "bg-rose-50 text-rose-600",
    },
    {
      label: "Profit",
      value: metrics.profit,
      description: "Revenue remaining after expenses",
      icon: CircleDollarSign,
      tone: "from-emerald-500 to-teal-600",
      iconTone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Cash position",
      value: metrics.cashPosition,
      description: "Current available cash",
      icon: Wallet,
      tone: "from-blue-500 to-indigo-600",
      iconTone: "bg-blue-50 text-blue-600",
    },
    {
      label: "Receivables",
      value: metrics.receivables,
      description: "Money owed to your business",
      icon: Banknote,
      tone: "from-amber-500 to-orange-600",
      iconTone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Payables",
      value: metrics.payables,
      description: "Outstanding business obligations",
      icon: Landmark,
      tone: "from-slate-600 to-slate-900",
      iconTone: "bg-slate-100 text-slate-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-violet-700 via-violet-600 to-purple-700 px-6 py-7 text-white shadow-xl shadow-violet-500/15 sm:px-8 sm:py-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_60%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
              <ReceiptText className="h-4 w-4" />
              Finance
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Accounting
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
              Manage your chart of accounts and keep
              your financial structure organized in one
              place.
            </p>
          </div>

          <form
            action={initializeAccountsAction}
            className="shrink-0"
          >
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-violet-700 shadow-lg shadow-violet-950/10 transition hover:bg-violet-50 sm:w-auto"
            >
              <BookOpen className="h-4 w-4" />
              Initialize accounts
            </button>
          </form>
        </div>
      </section>

      {/* Financial overview */}
      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Financial overview
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Your financial position
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metricCards.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                key={metric.label}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {metric.label}
                    </p>

                    <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      {formatAmount(metric.value)}
                    </p>
                  </div>

                  <div
                    className={[
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                      metric.iconTone,
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  {metric.description}
                </p>

                <div
                  className={[
                    "absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                    metric.tone,
                  ].join(" ")}
                />
              </article>
            );
          })}
        </div>
      </section>

      {/* Chart of accounts */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <BookOpen className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold tracking-tight text-slate-900">
                  Chart of accounts
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Accounts used to organize your
                  financial records.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            {accounts.length}{" "}
            {accounts.length === 1
              ? "account"
              : "accounts"}
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-violet-600">
              <BookOpen className="h-7 w-7" />
            </div>

            <h3 className="mt-5 font-bold text-slate-900">
              No accounts configured
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Initialize the default chart of accounts
              to begin organizing your financial
              records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Code
                  </th>

                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Account
                  </th>

                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Type
                  </th>

                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    System
                  </th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-slate-100 transition hover:bg-violet-50/30 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-violet-700">
                        {account.code}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {account.name}
                      </p>

                      {account.description && (
                        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                          {account.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {account.type}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                          account.isSystem
                            ? "bg-violet-50 text-violet-700"
                            : "bg-slate-100 text-slate-500",
                        ].join(" ")}
                      >
                        {account.isSystem
                          ? "System account"
                          : "Custom account"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}