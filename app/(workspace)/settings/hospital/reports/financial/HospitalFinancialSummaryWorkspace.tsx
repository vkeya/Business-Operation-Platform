"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  RefreshCw,
  Wallet,
  FileText,
  ClockAlert,
} from "lucide-react";

import { getHospitalFinancialSummaryAction } from "@/lib/reports/actions";

type FinancialSummary = Awaited<
  ReturnType<typeof getHospitalFinancialSummaryAction>
>;

type InvoiceStatus = FinancialSummary["invoiceStatuses"][number];
type Collection = FinancialSummary["paymentCollections"][number];
type OutstandingInvoice = FinancialSummary["outstanding"]["invoices"][number];

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  VOID: "Voided",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  ISSUED: "bg-blue-100 text-blue-800",
  PARTIALLY_PAID: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  VOID: "bg-red-100 text-red-800",
};

function localDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

function dateLabel(value: string | Date | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString();
}

function groupAmountsByCurrency(
  items: Array<{ currency: string; amount: number }>,
) {
  return items.reduce<Record<string, number>>((result, item) => {
    result[item.currency] = (result[item.currency] ?? 0) + item.amount;
    return result;
  }, {});
}

function CurrencyTotals({
  totals,
  emptyLabel = "No amounts recorded",
}: {
  totals: Record<string, number>;
  emptyLabel?: string;
}) {
  const entries = Object.entries(totals);

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([currency, amount]) => (
        <div
          key={currency}
          className="flex items-center justify-between gap-4"
        >
          <span className="text-sm font-medium text-slate-600">
            {currency}
          </span>
          <span className="text-right text-sm font-semibold text-slate-900">
            {money(amount, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  description,
  children,
  icon,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          {icon}
        </span>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InvoiceTable({
  invoices,
  emptyLabel,
}: {
  invoices: OutstandingInvoice[];
  emptyLabel: string;
}) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-3 font-semibold">Invoice</th>
            <th className="px-3 py-3 font-semibold">Patient</th>
            <th className="px-3 py-3 font-semibold">Status</th>
            <th className="px-3 py-3 font-semibold">Due date</th>
            <th className="px-3 py-3 text-right font-semibold">Invoice total</th>
            <th className="px-3 py-3 text-right font-semibold">Paid</th>
            <th className="px-3 py-3 text-right font-semibold">Balance due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="align-top">
              <td className="px-3 py-3 font-medium text-slate-900">
                {invoice.invoiceNumber}
              </td>
              <td className="px-3 py-3">
                <p className="font-medium text-slate-800">
                  {invoice.patientName || "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {invoice.patientNumber}
                </p>
              </td>
              <td className="px-3 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    STATUS_STYLES[invoice.status] ??
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {STATUS_LABELS[invoice.status] ?? invoice.status}
                </span>
              </td>
              <td className="px-3 py-3 text-slate-600">
                {dateLabel(invoice.dueAt)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                {money(invoice.totalAmount, invoice.currency)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                {money(invoice.amountPaid, invoice.currency)}
              </td>
              <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-900">
                {money(invoice.balanceDue, invoice.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HospitalFinancialSummaryWorkspace() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(localDateInput(firstDay));
  const [endDate, setEndDate] = useState(localDateInput(today));
  const [report, setReport] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    if (!startDate || !endDate) {
      setError("Select both a start date and an end date.");
      return;
    }

    if (startDate > endDate) {
      setError("The start date cannot be after the end date.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59.999`);

      const result = await getHospitalFinancialSummaryAction(start, end);
      setReport(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the hospital financial summary.",
      );
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const invoiceStatuses: InvoiceStatus[] = report?.invoiceStatuses ?? [];
  const collections: Collection[] = report?.paymentCollections ?? [];
  const outstandingInvoices = report?.outstanding.invoices ?? [];
  const overdueInvoices = report?.overdue.invoices ?? [];

  const outstandingTotals = groupAmountsByCurrency(
    outstandingInvoices.map((invoice) => ({
      currency: invoice.currency,
      amount: invoice.balanceDue,
    })),
  );

  const overdueTotals = groupAmountsByCurrency(
    overdueInvoices.map((invoice) => ({
      currency: invoice.currency,
      amount: invoice.balanceDue,
    })),
  );

  const statusTotals = groupAmountsByCurrency(
    invoiceStatuses.map((item) => ({
      currency: item.currency,
      amount: item.totalAmount,
    })),
  );

  const collectionTotals = groupAmountsByCurrency(
    collections.map((item) => ({
      currency: item.currency,
      amount: item.amountCollected,
    })),
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                <BarChart3 className="h-4 w-4" />
                Hospital reporting
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Financial summary
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Review invoice activity, collections, current outstanding
                balances and overdue patient invoices. Amounts remain grouped
                by currency.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadReport()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh report
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Reporting period</h2>
            <p className="text-sm text-slate-500">
              Invoice creation and payment collection dates
            </p>
          </div>
        </div>

        <form
          className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            void loadReport();
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Start date
            </span>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              End date
            </span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <BarChart3 className="h-4 w-4" />
            Apply filters
          </button>
        </form>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load report</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading && !report && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
          Loading hospital financial summary…
        </div>
      )}

      {report && (
        <>
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Period overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Activity from {dateLabel(report.period.startDate)} to{" "}
                {dateLabel(report.period.endDate)}. Invoice totals are grouped
                by invoice creation date; collections are grouped by payment
                date.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Invoice value"
                description="All invoice statuses in period"
                icon={<FileText className="h-5 w-5" />}
              >
                <CurrencyTotals totals={statusTotals} />
              </MetricCard>

              <MetricCard
                label="Collections"
                description={`${collections.reduce((count, item) => count + item.paymentCount, 0)} recorded payments`}
                icon={<Wallet className="h-5 w-5" />}
              >
                <CurrencyTotals totals={collectionTotals} />
              </MetricCard>

              <MetricCard
                label="Outstanding"
                description={`${report.outstanding.count} currently unpaid invoices`}
                icon={<FileText className="h-5 w-5" />}
              >
                <CurrencyTotals totals={outstandingTotals} />
              </MetricCard>

              <MetricCard
                label="Overdue"
                description={`${report.overdue.count} currently overdue invoices`}
                icon={<ClockAlert className="h-5 w-5" />}
              >
                <CurrencyTotals totals={overdueTotals} />
              </MetricCard>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Invoice totals by status
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Invoice count and amounts for invoices created during the
                selected period.
              </p>
            </div>

            {invoiceStatuses.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No invoices were created during this period.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-3 font-semibold">Currency</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-3 py-3 text-right font-semibold">Invoices</th>
                      <th className="px-3 py-3 text-right font-semibold">Subtotal</th>
                      <th className="px-3 py-3 text-right font-semibold">Discounts</th>
                      <th className="px-3 py-3 text-right font-semibold">Tax</th>
                      <th className="px-3 py-3 text-right font-semibold">Total</th>
                      <th className="px-3 py-3 text-right font-semibold">Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceStatuses.map((item) => (
                      <tr key={`${item.currency}-${item.status}`}>
                        <td className="px-3 py-3 font-medium text-slate-800">
                          {item.currency}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              STATUS_STYLES[item.status] ??
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {STATUS_LABELS[item.status] ?? item.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {item.count.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {money(item.subtotal, item.currency)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {money(item.discountTotal, item.currency)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {money(item.taxTotal, item.currency)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold tabular-nums">
                          {money(item.totalAmount, item.currency)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {money(item.amountPaid, item.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Payment collections by currency
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Payments recorded during the selected reporting period.
              </p>
            </div>

            {collections.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No payments were recorded during this period.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((item) => (
                  <div
                    key={item.currency}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.currency}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {money(item.amountCollected, item.currency)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.paymentCount} payment
                      {item.paymentCount === 1 ? "" : "s"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Outstanding invoices
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current balances for issued and partially paid invoices,
                regardless of invoice creation date.
              </p>
            </div>
            <InvoiceTable
              invoices={outstandingInvoices}
              emptyLabel="There are no outstanding hospital invoices."
            />
          </section>

          <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-red-900">
                Overdue invoices
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Outstanding invoices with a due date before the selected
                report end date.
              </p>
            </div>
            <InvoiceTable
              invoices={overdueInvoices}
              emptyLabel="There are no overdue hospital invoices for this report end date."
            />
          </section>
        </>
      )}
    </div>
  );
}
