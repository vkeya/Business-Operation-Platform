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
      description:
        "Income recorded across your business",
      icon: TrendingUp,
      tone: "text-emerald-700",
      borderTone:
        "border-emerald-200",
      valueTone:
        "text-emerald-900",
    },
    {
      label: "Expenses",
      value: metrics.expenses,
      description:
        "Business costs recorded",
      icon: TrendingDown,
      tone: "text-rose-700",
      borderTone:
        "border-rose-200",
      valueTone:
        "text-rose-900",
    },
    {
      label: "Profit",
      value: metrics.profit,
      description:
        "Revenue remaining after expenses",
      icon: CircleDollarSign,
      tone: "text-violet-700",
      borderTone:
        "border-violet-200",
      valueTone:
        "text-violet-900",
    },
    {
      label: "Cash position",
      value: metrics.cashPosition,
      description:
        "Current available cash",
      icon: Wallet,
      tone: "text-blue-700",
      borderTone:
        "border-blue-200",
      valueTone:
        "text-blue-900",
    },
    {
      label: "Receivables",
      value: metrics.receivables,
      description:
        "Money owed to your business",
      icon: Banknote,
      tone: "text-amber-700",
      borderTone:
        "border-amber-200",
      valueTone:
        "text-amber-900",
    },
    {
      label: "Payables",
      value: metrics.payables,
      description:
        "Outstanding business obligations",
      icon: Landmark,
      tone: "text-slate-700",
      borderTone:
        "border-slate-200",
      valueTone:
        "text-slate-900",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Accounting hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                Accounting
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-slate-300">
                {accounts.length}{" "}
                {accounts.length === 1
                  ? "account"
                  : "accounts"}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Accounting
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Manage your financial structure,
              track your position and keep your
              business accounts organized.
            </p>
          </div>

          <form
            action={initializeAccountsAction}
            className="shrink-0"
          >
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
            >
              <BookOpen className="h-4 w-4 text-violet-600" />
              Initialize accounts
            </button>
          </form>
        </div>
      </section>

      {/* Financial overview */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Financial overview
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Your financial position
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metricCards.map((metric) => {
            const Icon = metric.icon;

            return (
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
                      {formatAmount(metric.value)}
                    </p>
                  </div>

                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50",
                      metric.tone,
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {metric.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Chart of accounts */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Financial structure
              </p>

              <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
                Chart of accounts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Accounts used to organize your
                financial records.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
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

            <h3 className="mt-5 font-semibold text-slate-900">
              No accounts configured
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Initialize the default chart of
              accounts to begin organizing your
              financial records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Code
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Account
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Type
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    System
                  </th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0"
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