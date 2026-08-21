import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { expenseService } from "@/lib/expenses/expenseService";
import PaymentStatusControl from "./PaymentStatusControl";

interface ExpenseDetailPageProps {
  params: Promise<{
    expenseId: string;
  }>;
}

export default async function ExpenseDetailPage({
  params,
}: ExpenseDetailPageProps) {
  const { expenseId } = await params;

  const business =
    await getCurrentBusiness();

  const expense =
    await expenseService.findExpenseById(
      business.id,
      expenseId,
    );

  if (!expense) {
    notFound();
  }

  const paymentStatusStyles =
    expense.paymentStatus === "PAID"
      ? "bg-emerald-50 text-emerald-700"
      : expense.paymentStatus === "PARTIAL"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-700";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8">
        <Link
          href="/expenses"
          className="text-sm font-semibold text-slate-500 transition-colors hover:text-emerald-600"
        >
          ← Expenses
        </Link>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              Finance / Expense
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {expense.reference}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {expense.description}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${paymentStatusStyles}`}
          >
            {expense.paymentStatus}
          </span>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                Expense details
              </p>

              <h2 className="mt-2 text-lg font-semibold text-slate-950">
                {expense.category}
              </h2>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium text-slate-400">
                Amount
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {expense.currency}{" "}
                {expense.amount.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  },
                )}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Category
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {expense.category}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Expense date
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {new Date(
                  expense.expenseDate,
                ).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Currency
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {expense.currency}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Created
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {new Date(
                  expense.createdAt,
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Description
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {expense.description}
            </p>
          </div>

          {expense.notes && (
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Notes
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {expense.notes}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Payment
            </p>

            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              Payment status
            </h2>

            <div className="mt-5 rounded-xl bg-slate-50/70 p-5">
  <PaymentStatusControl
    expenseId={expense.id}
    currentStatus={expense.paymentStatus}
  />

  <p className="mt-4 text-sm leading-6 text-slate-500">
    Update the payment status as the expense is paid.
  </p>
</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Record
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Reference
                </span>

                <span className="text-sm font-semibold text-slate-800">
                  {expense.reference}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Currency
                </span>

                <span className="text-sm font-semibold text-slate-800">
                  {business.baseCurrency}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Created
                </span>

                <span className="text-sm font-semibold text-slate-800">
                  {new Date(
                    expense.createdAt,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}