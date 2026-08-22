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

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Finance
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Money
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Understand your revenue, costs and business performance.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Revenue
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {summary.revenue.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Completed sales
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Purchases
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {summary.purchases.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Received stock
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Expenses
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {summary.expenses.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Operating costs
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Estimated profit
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {summary.estimatedProfit.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Revenue - costs
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Recent sales
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {activity.sales.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No sales yet.
              </p>
            ) : (
              activity.sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {sale.referenceNumber}
                    </p>

                    <p className="text-xs text-slate-500">
                      {sale.status}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {sale.currency}{" "}
                    {sale.totalAmount.toNumber().toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Recent expenses
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {activity.expenses.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No expenses yet.
              </p>
            ) : (
              activity.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {expense.description}
                    </p>

                    <p className="text-xs text-slate-500">
                      {expense.category}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {expense.currency}{" "}
                    {expense.amount.toNumber().toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}