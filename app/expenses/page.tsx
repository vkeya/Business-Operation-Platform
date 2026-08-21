import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { expenseService } from "@/lib/expenses/expenseService";

export default async function ExpensesPage() {
  const business =
    await getCurrentBusiness();

  const expenses =
    await expenseService.listExpenses(
      business.id,
    );

  const paidExpenses =
    expenses.filter(
      (expense) =>
        expense.paymentStatus === "PAID",
    );

  const partialExpenses =
    expenses.filter(
      (expense) =>
        expense.paymentStatus === "PARTIAL",
    );

  const unpaidExpenses =
    expenses.filter(
      (expense) =>
        expense.paymentStatus === "UNPAID",
    );

  const totalExpenses =
    expenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0,
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            Finance
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Expenses
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Track business spending, payment status and operating
            costs from one workspace.
          </p>
        </div>

        <Link
          href="/expenses/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Record expense
          <span
            className="ml-2 text-emerald-400"
            aria-hidden="true"
          >
            +
          </span>
        </Link>
      </div>

      <section
        aria-label="Expense overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Total expenses
            </p>

            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            {business.baseCurrency}{" "}
            {totalExpenses.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {expenses.length} expense
            {expenses.length === 1
              ? ""
              : "s"} on record
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Paid
            </p>

            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            {paidExpenses.length}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Expenses fully paid
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Partial
            </p>

            <span className="h-2 w-2 rounded-full bg-amber-400" />
          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            {partialExpenses.length}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Partially paid expenses
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Outstanding
            </p>

            <span className="h-2 w-2 rounded-full bg-slate-400" />
          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            {unpaidExpenses.length}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Expenses still outstanding
          </p>
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Expense register
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Business spending
            </h2>
          </div>

          <p className="text-xs font-medium text-slate-400">
            {expenses.length} record
            {expenses.length === 1 ? "" : "s"}
          </p>
        </div>

        {expenses.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-600">
              E
            </div>

            <p className="mt-5 font-semibold text-slate-900">
              No expenses yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Record your first business expense to start tracking
              operating costs and payment obligations.
            </p>

            <Link
              href="/expenses/new"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Record expense
              <span
                className="ml-2 text-emerald-400"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Reference
                  </th>

                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Category
                  </th>

                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Description
                  </th>

                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Date
                  </th>

                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-900">
                        {expense.reference}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Created{" "}
                        {new Date(
                          expense.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {expense.category}
                      </span>
                    </td>

                    <td className="max-w-xs px-6 py-5">
                      <p className="truncate text-sm text-slate-600">
                        {expense.description}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {new Date(
                        expense.expenseDate,
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-slate-950">
                      {expense.currency}{" "}
                      {expense.amount.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={
                          expense.paymentStatus ===
                          "PAID"
                            ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            : expense.paymentStatus ===
                                "PARTIAL"
                              ? "inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                              : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                        }
                      >
                        {expense.paymentStatus}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <Link
                        href={`/expenses/${expense.id}`}
                        className="text-sm font-semibold text-slate-500 transition-colors hover:text-emerald-600"
                      >
                        View details
                        <span
                          className="ml-1"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </Link>
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