import Link from "next/link";
import {
  Banknote,
  BookOpen,
  CircleDollarSign,
  Landmark,
  Boxes,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getAccountingOverviewByCurrency } from "@/lib/accounting/dashboard/accountingOverviewService";
import {
  getAccountsAction,
  initializeAccountsAction,
} from "@/lib/accounting/actions";
import { getAccountingMetrics } from "@/lib/accounting/dashboard/accountingMetrics";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";

export const dynamic = "force-dynamic";

function formatAmount(currency: string, value: number) {
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AccountingPage() {
  const business =
    await getCurrentBusiness();

  const userId =
    await getAuthenticatedUserId();

    await requireBusinessPermission(
      userId,
      business.id,
      "accounting.read",
    );

  const accounts =
    await getAccountsAction();

  const overview =
    await getAccountingOverviewByCurrency(
      business.id,
    );

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

         <div className="flex shrink-0 flex-wrap items-center gap-3">
           <Link
             href="/accounting/reports/profit-loss"
             className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
           >
             <ReceiptText className="h-4 w-4" />
             Reports
           </Link>

           <form action={initializeAccountsAction}>
             <button
               type="submit"
               className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
             >
               <BookOpen className="h-4 w-4 text-violet-600" />
               Initialize accounts
             </button>
           </form>
         </div>
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

	  <p className="mt-2 text-sm text-slate-500">
            Posted accounting balances, presented separately by currency.
          </p>
        </div>

	  {overview.currencies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-semibold text-slate-800">
              No accounting activity yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Posted journal entries will appear here once financial activity is recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {overview.currencies.map((summary) => {
              const metrics = [
                {
                  label: "Revenue",
                  value: summary.revenue,
                  description: "Cumulative posted revenue",
                  icon: TrendingUp,
                  tone: "text-emerald-700",
                  borderTone: "border-emerald-200",
                  valueTone: "text-emerald-900",
                },
                {
                  label: "Recorded expenses",
                  value: summary.expenses,
                  description: "Cumulative posted expenses",
                  icon: TrendingDown,
                  tone: "text-rose-700",
                  borderTone: "border-rose-200",
                  valueTone: "text-rose-900",
                },
                {
                  label: "Revenue less recorded expenses",
                  value: summary.revenueLessRecordedExpenses,
                  description: "Not verified accounting profit; cost of goods sold is unavailable",
                  icon: CircleDollarSign,
                  tone: "text-violet-700",
                  borderTone: "border-violet-200",
                  valueTone: "text-violet-900",
                },
                {
                  label: "Cash and payment balances",
                  value: summary.cashAndPaymentBalances,
                  description: "Posted balances across cash, M-Pesa, card and bank accounts",
                  icon: Wallet,
                  tone: "text-blue-700",
                  borderTone: "border-blue-200",
                  valueTone: "text-blue-900",
                },
                {
                  label: "Receivables",
                  value: summary.receivables,
                  description:
                    summary.receivables < 0
                      ? "Net customer credit balance"
                      : "Net customer balances outstanding",
                  icon: Banknote,
                  tone: "text-amber-700",
                  borderTone: "border-amber-200",
                  valueTone: "text-amber-900",
                },
                {
                  label: "Payables",
                  value: summary.payables,
                  description: "Net outstanding supplier liabilities",
                  icon: Landmark,
                  tone: "text-slate-700",
                  borderTone: "border-slate-200",
                  valueTone: "text-slate-900",
                },
                {
                  label: "Inventory",
                  value: summary.inventory,
                  description: "Posted accounting inventory balance",
                  icon: Boxes,
                  tone: "text-cyan-700",
                  borderTone: "border-cyan-200",
                  valueTone: "text-cyan-900",
                },
              ];

    return (
                <div key={summary.currency}>
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      {summary.currency}
                    </h3>
                    <span className="text-xs text-slate-400">
                      Accounting balances
                    </span>
                  </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {metrics.map((metric) => {
                      const Icon = metric.icon;

                   return (
                        <article
                          key={metric.label}
                          className={[
                            "rounded-2xl border bg-white p-5 shadow-sm",
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
                                {formatAmount(summary.currency, metric.value)}
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

                        {metric.label === "Cash and payment balances" && (
                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                              {summary.paymentAccounts.map((account) => (
                                <div
                                  key={account.code}
                                  className="flex items-center justify-between gap-3 text-xs"
                                >
                                  <span className="text-slate-500">
                                    {account.name}
                                  </span>
                                  <span
                                    className={[
                                      "font-semibold tabular-nums",
                                      account.balance < 0
                                        ? "text-rose-700"
                                        : "text-slate-800",
                                    ].join(" ")}
                                  >
                                    {formatAmount(summary.currency, account.balance)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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