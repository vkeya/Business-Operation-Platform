import {
ArrowDownRight,
ArrowUpRight,
CreditCard,
ReceiptText,
TrendingUp,
Wallet,
} from "lucide-react";

import {
getMoneyActivityAction,
getMoneySummaryAction,
} from "@/lib/money/actions";

export const dynamic = "force-dynamic";

export default async function MoneyPage() {
const summary =
await getMoneySummaryAction();

const activity =
await getMoneyActivityAction();

return ( <div className="space-y-6">
{/* Hero */} <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8"> <div className="pointer-events-none absolute inset-0"> <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" /> <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" /> </div>


    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            Finance
          </span>

          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
            Business performance
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Money
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Understand your revenue, costs and business
          performance from one financial workspace.
        </p>
      </div>

      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
        <Wallet className="h-6 w-6" />
      </div>
    </div>
  </section>

  {/* Financial overview */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Financial performance
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        Money overview
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Review revenue, purchasing, operating costs and
        your estimated business performance.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MoneyMetricCard
        label="Revenue"
        value={summary.revenue.toLocaleString()}
        description="Completed sales"
        icon={<TrendingUp className="h-5 w-5" />}
        borderTone="border-emerald-200"
        iconTone="text-emerald-700"
        valueTone="text-emerald-900"
      />

      <MoneyMetricCard
        label="Purchases"
        value={summary.purchases.toLocaleString()}
        description="Received stock"
        icon={<ReceiptText className="h-5 w-5" />}
        borderTone="border-blue-200"
        iconTone="text-blue-700"
        valueTone="text-blue-900"
      />

      <MoneyMetricCard
        label="Expenses"
        value={summary.expenses.toLocaleString()}
        description="Operating costs"
        icon={<CreditCard className="h-5 w-5" />}
        borderTone="border-amber-200"
        iconTone="text-amber-700"
        valueTone="text-amber-900"
      />

      <MoneyMetricCard
        label="Estimated profit"
        value={summary.estimatedProfit.toLocaleString()}
        description="Revenue - costs"
        icon={<Wallet className="h-5 w-5" />}
        borderTone="border-violet-200"
        iconTone="text-violet-700"
        valueTone="text-violet-900"
      />
    </div>
  </section>

  {/* Financial activity */}
  <section>
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Financial activity
      </p>

      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        Recent movement
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Review the latest sales and expenses affecting
        your business finances.
      </p>
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent sales */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-emerald-700">
            <ArrowUpRight className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Income
            </p>

            <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
              Recent sales
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest sales activity.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {activity.sales.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <TrendingUp className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-900">
                No sales yet
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Completed sales will appear here.
              </p>
            </div>
          ) : (
            activity.sales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {sale.referenceNumber}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {sale.status}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold text-emerald-700">
                  {sale.currency}{" "}
                  {sale.totalAmount
                    .toNumber()
                    .toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent expenses */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-amber-700">
            <ArrowDownRight className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Costs
            </p>

            <h2 className="mt-1 font-semibold tracking-tight text-slate-900">
              Recent expenses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest operating costs.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {activity.expenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <CreditCard className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-900">
                No expenses yet
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Recorded expenses will appear here.
              </p>
            </div>
          ) : (
            activity.expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {expense.description}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {expense.category}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold text-amber-700">
                  {expense.currency}{" "}
                  {expense.amount
                    .toNumber()
                    .toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </section>
</div>


);
}

function MoneyMetricCard({
label,
value,
description,
icon,
borderTone,
iconTone,
valueTone,
}: {
label: string;
value: string;
description: string;
icon: React.ReactNode;
borderTone: string;
iconTone: string;
valueTone: string;
}) {
return (
<div
className={[
"rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
borderTone,
].join(" ")}
> <div className="flex items-start justify-between gap-4"> <div> <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
{label} </p>


      <p
        className={[
          "mt-4 text-2xl font-semibold tracking-tight",
          valueTone,
        ].join(" ")}
      >
        {value}
      </p>
    </div>

    <div
      className={[
        "flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50",
        iconTone,
      ].join(" ")}
    >
      {icon}
    </div>
  </div>

  <p className="mt-3 text-xs leading-5 text-slate-500">
    {description}
  </p>
</div>


);
}
