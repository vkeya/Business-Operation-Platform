import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { expenseService } from "@/lib/expenses/expenseService";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const business = await getCurrentBusiness();

  const expenses = await expenseService.listExpenses(
    business.id,
  );

  const paidExpenses = expenses.filter(
    (expense) => expense.paymentStatus === "PAID",
  );

  const partialExpenses = expenses.filter(
    (expense) => expense.paymentStatus === "PARTIAL",
  );

  const unpaidExpenses = expenses.filter(
    (expense) => expense.paymentStatus === "UNPAID",
  );

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const paidAmount = paidExpenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const partialAmount = partialExpenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const unpaidAmount = unpaidExpenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const categoryTotals = expenses.reduce<
    Record<string, number>
  >((totals, expense) => {
    totals[expense.category] =
      (totals[expense.category] ?? 0) + expense.amount;

    return totals;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort(([, first], [, second]) => second - first)
    .slice(0, 4);

  const outstandingCount =
    partialExpenses.length + unpaidExpenses.length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:px-8 sm:py-8">
        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                Finance
              </span>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                  outstandingCount > 0
                    ? "bg-amber-400/10 text-amber-300"
                    : "bg-emerald-400/10 text-emerald-300"
                }`}
              >
                {outstandingCount > 0
                  ? `${outstandingCount} outstanding`
                  : "All expenses settled"}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Expenses
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Keep control of business spending, payment
              obligations and operating costs from one place.
            </p>
          </div>

          <Link
            href="/expenses/new"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            <span className="mr-2 text-emerald-600">
              +
            </span>
            Record expense
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 right-32 h-56 w-56 rounded-full bg-sky-400/5 blur-3xl" />
      </section>

      {/* Financial KPIs */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Total expenses
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {business.baseCurrency}{" "}
            {totalExpenses.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {expenses.length}{" "}
            {expenses.length === 1
              ? "expense"
              : "expenses"}{" "}
            on record
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">
            Paid
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-emerald-900">
            {business.baseCurrency}{" "}
            {paidAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="mt-2 text-xs text-emerald-700">
            {paidExpenses.length} fully paid
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600">
            Partial
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-amber-900">
            {business.baseCurrency}{" "}
            {partialAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="mt-2 text-xs text-amber-700">
            {partialExpenses.length} partially paid
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600">
            Outstanding
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-red-900">
            {business.baseCurrency}{" "}
            {unpaidAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="mt-2 text-xs text-red-700">
            {unpaidExpenses.length} unpaid
          </p>
        </div>
      </section>

      {/* Spending intelligence */}
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600">
              Spending overview
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Where money is going
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your largest expense categories based on
              recorded spending.
            </p>
          </div>

          {topCategories.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-700">
                No spending categories yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Expense categories will appear here as you
                record spending.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {topCategories.map(
                ([category, amount]) => {
                  const percentage =
                    totalExpenses > 0
                      ? (amount / totalExpenses) * 100
                      : 0;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-slate-700">
                          {category}
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {business.baseCurrency}{" "}
                          {amount.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${Math.min(
                              100,
                              percentage,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600">
            Payment health
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Expense obligations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            See how your recorded expenses are settling.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Paid
                </span>

                <span className="text-sm font-semibold text-emerald-700">
                  {paidExpenses.length}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width:
                      expenses.length > 0
                        ? `${Math.min(
                            100,
                            (paidExpenses.length /
                              expenses.length) *
                              100,
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Partial
                </span>

                <span className="text-sm font-semibold text-amber-700">
                  {partialExpenses.length}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{
                    width:
                      expenses.length > 0
                        ? `${Math.min(
                            100,
                            (partialExpenses.length /
                              expenses.length) *
                              100,
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Unpaid
                </span>

                <span className="text-sm font-semibold text-red-600">
                  {unpaidExpenses.length}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-red-400"
                  style={{
                    width:
                      expenses.length > 0
                        ? `${Math.min(
                            100,
                            (unpaidExpenses.length /
                              expenses.length) *
                              100,
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Register */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600">
              Expense register
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Business spending
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review recorded expenses and payment obligations.
            </p>
          </div>

          <Link
            href="/expenses/new"
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            + Record another expense
          </Link>
        </div>

        {expenses.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
              E
            </div>

            <p className="mt-5 text-lg font-semibold text-slate-950">
              No expenses yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Record your first business expense to start
              tracking operating costs and payment obligations.
            </p>

            <Link
              href="/expenses/new"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Record your first expense
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Expense
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Category
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Description
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Date
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Amount
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Payment
                  </th>

                  <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => {
                  const isPaid =
                    expense.paymentStatus === "PAID";

                  const isPartial =
                    expense.paymentStatus === "PARTIAL";

                  return (
                    <tr
                      key={expense.id}
                      className="group border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/expenses/${expense.id}`}
                          className="font-semibold text-slate-900 transition hover:text-emerald-700"
                        >
                          {expense.reference}
                        </Link>

                        <p className="mt-1 text-xs text-slate-400">
                          Created{" "}
                          {new Date(
                            expense.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                          {expense.category}
                        </span>
                      </td>

                      <td className="max-w-xs px-6 py-4">
                        <p className="truncate text-sm text-slate-600">
                          {expense.description}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(
                          expense.expenseDate,
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-950">
                          {expense.currency}{" "}
                          {expense.amount.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700"
                              : isPartial
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isPaid
                                ? "bg-emerald-500"
                                : isPartial
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          />

                          {expense.paymentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/expenses/${expense.id}`}
                          className="text-xs font-semibold text-slate-600 transition hover:text-slate-950"
                        >
                          View details →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Finance connection */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Expenses are part of your financial picture
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Keep spending visible alongside sales, purchasing
              and the rest of your business operations.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            Back to dashboard →
          </Link>
        </div>
      </section>
    </div>
  );
}