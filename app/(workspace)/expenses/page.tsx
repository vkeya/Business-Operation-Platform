import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  ReceiptText,
  TrendingDown,
  Wallet,
} from "lucide-react";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { expenseService } from "@/lib/expenses/expenseService";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

function formatAmount(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function ExpensesPage() {
  const business = await getCurrentBusiness();

  const locale = await getLocale();

  const t = getTranslations(locale);

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
      (totals[expense.category] ?? 0) +
      expense.amount;

    return totals;
  }, {});

  const topCategories = Object.entries(
    categoryTotals,
  )
    .sort(([, first], [, second]) => second - first)
    .slice(0, 4);

  const outstandingCount =
    partialExpenses.length +
    unpaidExpenses.length;

  const metricCards = [
    {
      label: t.expenses.totalExpenses,
      value: totalExpenses,
      description: `${expenses.length} ${
        expenses.length === 1
          ? t.expenses.expense
          : t.expenses.expenses
      } ${t.expenses.onRecord}`,
      icon: TrendingDown,
      iconTone:
        "bg-violet-50 text-violet-600",
    },
    {
      label: t.expenses.paid,
      value: paidAmount,
      description: `${paidExpenses.length} ${t.expenses.fullyPaid}`,
      icon: CheckCircle2,
      iconTone:
        "bg-emerald-50 text-emerald-600",
    },
    {
      label: t.expenses.partial,
      value: partialAmount,
      description: `${partialExpenses.length} ${t.expenses.partiallyPaid}`,
      icon: CircleDollarSign,
      iconTone:
        "bg-amber-50 text-amber-600",
    },
    {
      label: t.expenses.outstanding,
      value: unpaidAmount,
      description: `${unpaidExpenses.length} ${t.expenses.unpaid}`,
      icon: AlertCircle,
      iconTone:
        "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
            {/* Premium expenses hero */}
      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-slate-950 to-slate-950" />

        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                {t.expenses.title}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                  outstandingCount > 0
                    ? "bg-amber-400/10 text-amber-300"
                    : "bg-emerald-400/10 text-emerald-300"
                }`}
              >
                {outstandingCount > 0
                  ? `${outstandingCount} ${t.expenses.outstanding}`
                  : `${expenses.length} ${
                      expenses.length === 1
                        ? t.expenses.expense
                        : t.expenses.expenses
                    }`}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t.expenses.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {t.expenses.description}
            </p>
          </div>

          <Link
            href="/expenses/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 sm:w-auto"
          >
            <ReceiptText className="h-4 w-4 text-violet-600" />

            {t.expenses.recordExpense}
          </Link>
        </div>
      </section>

      {/* Expense overview */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {t.expenses.spendingOverview}
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            {t.expenses.whereMoneyIsGoing}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      {metric.label}
                    </p>

                    <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                      {business.baseCurrency}{" "}
                      {formatAmount(metric.value)}
                    </p>
                  </div>

                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                      metric.iconTone,
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

      {/* Spending intelligence */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <TrendingDown className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold tracking-tight text-slate-900">
                {t.expenses.whereMoneyIsGoing}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t.expenses.largestExpenseCategories}
              </p>
            </div>
          </div>

          {topCategories.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-700">
                {t.expenses.noSpendingCategories}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {t.expenses.spendingCategoriesWillAppearHere}
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
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
                          {formatAmount(amount)}
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-violet-500"
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <ReceiptText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold tracking-tight text-slate-900">
                {t.expenses.expenseObligations}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t.expenses.seeHowExpensesAreSettling}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <PaymentHealthRow
              label={t.expenses.paid}
              count={paidExpenses.length}
              total={expenses.length}
              tone="emerald"
            />

            <PaymentHealthRow
              label={t.expenses.partial}
              count={partialExpenses.length}
              total={expenses.length}
              tone="amber"
            />

            <PaymentHealthRow
              label={t.expenses.unpaid}
              count={unpaidExpenses.length}
              total={expenses.length}
              tone="rose"
            />
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {t.expenses.outstanding}
            </p>

            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              {outstandingCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {outstandingCount > 0
                ? `${outstandingCount} ${t.expenses.outstanding}`
                : t.expenses.paid}
            </p>
          </div>
        </div>
      </section>

      {/* Expense register */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <ReceiptText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold tracking-tight text-slate-900">
                {t.expenses.businessSpending}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t.expenses.reviewRecordedExpenses}
              </p>
            </div>
          </div>

          <Link
            href="/expenses/new"
            className="text-sm font-semibold text-violet-700 transition hover:text-violet-900"
          >
            + {t.expenses.recordAnotherExpense}
          </Link>
        </div>

        {expenses.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-violet-600">
              <ReceiptText className="h-7 w-7" />
            </div>

            <h3 className="mt-5 font-bold text-slate-900">
              {t.expenses.noExpensesYet}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {t.expenses.recordFirstExpenseDescription}
            </p>

            <Link
              href="/expenses/new"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700"
            >
              {t.expenses.recordFirstExpense}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.expenses.expense}
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.expenses.category}
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.expenses.descriptionLabel}
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.expenses.date}
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.expenses.amount}
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.expenses.payment}
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {t.expenses.action}
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
                      className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/expenses/${expense.id}`}
                          className="font-semibold text-slate-900 transition hover:text-violet-700"
                        >
                          {expense.reference}
                        </Link>

                        <p className="mt-1 text-xs text-slate-400">
                          {t.expenses.created}{" "}
                          {new Date(
                            expense.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
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
                          {formatAmount(
                            expense.amount,
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700"
                              : isPartial
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isPaid
                                ? "bg-emerald-500"
                                : isPartial
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            }`}
                          />

                          {isPaid
                            ? t.expenses.paidStatus
                            : isPartial
                              ? t.expenses.partiallyPaidStatus
                              : t.expenses.unpaidStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/expenses/${expense.id}`}
                          className="text-xs font-semibold text-violet-700 transition hover:text-violet-900"
                        >
                          {t.expenses.viewDetails} →
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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              {t.expenses.financeConnectionTitle}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {t.expenses.financeConnectionDescription}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="shrink-0 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
          >
            {t.expenses.backToDashboard}
          </Link>
        </div>
      </section>
    </div>
  );
}

function PaymentHealthRow({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: "emerald" | "amber" | "rose";
}) {
  const percentage =
    total > 0
      ? Math.min(
          100,
          (count / total) * 100,
        )
      : 0;

  const toneClasses = {
    emerald: {
      text: "text-emerald-700",
      bar: "bg-emerald-500",
    },
    amber: {
      text: "text-amber-700",
      bar: "bg-amber-500",
    },
    rose: {
      text: "text-rose-700",
      bar: "bg-rose-500",
    },
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {label}
        </span>

        <span
          className={`text-sm font-semibold ${
            toneClasses[tone].text
          }`}
        >
          {count}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            toneClasses[tone].bar
          }`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}