"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  X,
  Eye,
  CreditCard,
  Send,
  Ban,
  Trash2,
} from "lucide-react";

type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "VOID";

type Patient = {
  id: string;
  patientNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  isActive?: boolean;
};

type InvoiceItem = {
  id: string;
  description: string;
  quantity: string | number;
  unitPrice: string | number;
  discount: string | number;
  taxRate: string | number;
  taxAmount: string | number;
  lineTotal: string | number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patient?: Patient;
  status: InvoiceStatus;
  currency: string;
  subtotal: string | number;
  discountTotal: string | number;
  taxTotal: string | number;
  totalAmount: string | number;
  amountPaid: string | number;
  notes: string | null;
  issuedAt: string | null;
  dueAt: string | null;
  createdAt: string;
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
};

type DraftItem = {
  description: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  taxRate: string;
};

type InvoicePayment = {
  id: string;
  reference: string;
  method: string;
  amount: string | number;
  currency: string;
  notes: string | null;
  createdAt: string;
};

type PaymentMethod = "CASH" | "MPESA" | "CARD" | "BANK";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  VOID: "Voided",
};

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  ISSUED: "bg-blue-100 text-blue-800",
  PARTIALLY_PAID: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  VOID: "bg-red-100 text-red-800",
};

const EMPTY_ITEM: DraftItem = {
  description: "",
  quantity: "1",
  unitPrice: "0",
  discount: "0",
  taxRate: "0",
};


function escapePrintHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function printHospitalInvoice(invoice: Invoice) {
  const patientName = invoice.patient
    ? [invoice.patient.firstName, invoice.patient.middleName, invoice.patient.lastName]
        .filter(Boolean)
        .join(" ")
    : "—";

  const itemRows = (invoice.items ?? []).map((item) => `
    <tr>
      <td>${escapePrintHtml(item.description)}</td>
      <td class="number">${escapePrintHtml(item.quantity)}</td>
      <td class="number">${escapePrintHtml(money(item.unitPrice, invoice.currency))}</td>
      <td class="number">${escapePrintHtml(money(item.taxAmount, invoice.currency))}</td>
      <td class="number">${escapePrintHtml(money(item.lineTotal, invoice.currency))}</td>
    </tr>`).join("");

  const paymentRows = (invoice.payments ?? []).map((payment) => `
    <tr>
      <td>${escapePrintHtml(payment.reference)}</td>
      <td>${escapePrintHtml(payment.method)}</td>
      <td>${escapePrintHtml(dateLabel(payment.createdAt))}</td>
      <td>${escapePrintHtml(payment.notes || "—")}</td>
      <td class="number">${escapePrintHtml(money(payment.amount, payment.currency || invoice.currency))}</td>
    </tr>`).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Invoice ${escapePrintHtml(invoice.invoiceNumber)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { color: #172033; font: 12px/1.5 Arial, sans-serif; margin: 0; }
  h1 { font-size: 24px; margin: 0; }
  h2 { font-size: 15px; margin: 24px 0 8px; }
  .muted { color: #64748b; }
  .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #0e7490; padding-bottom: 16px; }
  .meta { text-align: right; }
  .facts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin: 20px 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border-bottom: 1px solid #dbe2ea; padding: 8px 6px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 700; }
  .number { text-align: right; white-space: nowrap; }
  .totals { margin: 16px 0 0 auto; max-width: 300px; }
  .totals td { border: 0; padding: 4px 0; }
  .grand { border-top: 1px solid #94a3b8 !important; font-size: 14px; font-weight: 700; }
  .notes { white-space: pre-wrap; }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
  <header class="top">
    <div><h1>Hospital Invoice</h1><div class="muted">Patient billing statement</div></div>
    <div class="meta">
      <strong>${escapePrintHtml(invoice.invoiceNumber)}</strong><br>
      Status: ${escapePrintHtml(invoice.status)}<br>
      Issued: ${escapePrintHtml(dateLabel(invoice.issuedAt))}<br>
      Due: ${escapePrintHtml(dateLabel(invoice.dueAt))}
    </div>
  </header>
  <section class="facts">
    <div><span class="muted">Patient</span><br><strong>${escapePrintHtml(patientName)}</strong></div>
    <div><span class="muted">Patient number</span><br>${escapePrintHtml(invoice.patient?.patientNumber || "—")}</div>
    <div><span class="muted">Invoice date</span><br>${escapePrintHtml(dateLabel(invoice.createdAt))}</div>
    <div><span class="muted">Currency</span><br>${escapePrintHtml(invoice.currency)}</div>
  </section>
  <h2>Invoice items</h2>
  <table><thead><tr><th>Description</th><th class="number">Qty</th><th class="number">Unit price</th><th class="number">Tax</th><th class="number">Line total</th></tr></thead>
  <tbody>${itemRows || '<tr><td colspan="5">No invoice items.</td></tr>'}</tbody></table>
  <table class="totals">
    <tr><td>Subtotal</td><td class="number">${escapePrintHtml(money(invoice.subtotal, invoice.currency))}</td></tr>
    <tr><td>Discount</td><td class="number">${escapePrintHtml(money(invoice.discountTotal, invoice.currency))}</td></tr>
    <tr><td>Tax</td><td class="number">${escapePrintHtml(money(invoice.taxTotal, invoice.currency))}</td></tr>
    <tr class="grand"><td>Total</td><td class="number">${escapePrintHtml(money(invoice.totalAmount, invoice.currency))}</td></tr>
    <tr><td>Amount paid</td><td class="number">${escapePrintHtml(money(invoice.amountPaid, invoice.currency))}</td></tr>
    <tr><td><strong>Balance due</strong></td><td class="number"><strong>${escapePrintHtml(money(outstanding(invoice), invoice.currency))}</strong></td></tr>
  </table>
  <h2>Payment history</h2>
  <table><thead><tr><th>Reference</th><th>Method</th><th>Date</th><th>Notes</th><th class="number">Amount</th></tr></thead>
  <tbody>${paymentRows || '<tr><td colspan="5">No payments recorded.</td></tr>'}</tbody></table>
  ${invoice.notes ? `<h2>Invoice notes</h2><div class="notes">${escapePrintHtml(invoice.notes)}</div>` : ""}
  <p class="muted" style="margin-top:28px">Generated from SmatPic Hospital Invoicing.</p>
  <script>window.addEventListener("load", () => window.print());</script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    window.alert("The print window was blocked. Allow pop-ups for this site and try again.");
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

function amount(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: string | number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount(value));
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function patientName(patient?: Patient | null) {
  if (!patient) return "Patient details unavailable";
  return [
    patient.firstName,
    patient.middleName,
    patient.lastName,
  ].filter(Boolean).join(" ");
}

function outstanding(invoice: Invoice) {
  return Math.max(0, amount(invoice.totalAmount) - amount(invoice.amountPaid));
}

function calculateLine(item: DraftItem) {
  const quantity = Math.max(0, amount(item.quantity));
  const unitPrice = Math.max(0, amount(item.unitPrice));
  const gross = quantity * unitPrice;
  const discount = Math.min(gross, Math.max(0, amount(item.discount)));
  const taxable = gross - discount;
  const taxRate = Math.min(100, Math.max(0, amount(item.taxRate)));
  const tax = taxable * taxRate / 100;

  return {
    gross,
    discount,
    tax,
    total: taxable + tax,
  };
}

export default function HospitalInvoicesWorkspace() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | InvoiceStatus>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([
    { ...EMPTY_ITEM },
  ]);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const loadPatients = useCallback(async () => {
    const response = await fetch("/api/hospital/patients?take=100", {
      cache: "no-store",
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Unable to load hospital patients.");
    }

    setPatients(result.patients ?? []);
  }, []);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ take: "100" });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(
        `/api/hospital/invoices?${params.toString()}`,
        { cache: "no-store" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to load invoices.");
      }

      setInvoices(result.invoices ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  const refreshSelectedInvoice = useCallback(async (invoiceId: string) => {
    const response = await fetch(`/api/hospital/invoices/${invoiceId}`, {
      cache: "no-store",
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Unable to load invoice details.");
    }

    setSelectedInvoice(result.invoice);
  }, []);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    void loadPatients().catch((err: unknown) => {
      setError(
        err instanceof Error ? err.message : "Unable to load hospital patients.",
      );
    });
  }, [loadPatients]);

  const totals = useMemo(() => {
    return invoices.reduce(
      (summary, invoice) => {
        if (invoice.status !== "VOID") {
          summary.invoiceValue += amount(invoice.totalAmount);
          summary.amountPaid += amount(invoice.amountPaid);
          summary.outstanding += outstanding(invoice);
        }
        return summary;
      },
      { invoiceValue: 0, amountPaid: 0, outstanding: 0 },
    );
  }, [invoices]);

  const draftTotals = useMemo(() => {
    return draftItems.reduce(
      (summary, item) => {
        const line = calculateLine(item);
        summary.subtotal += line.gross;
        summary.discount += line.discount;
        summary.tax += line.tax;
        summary.total += line.total;
        return summary;
      },
      { subtotal: 0, discount: 0, tax: 0, total: 0 },
    );
  }, [draftItems]);

  function resetCreateForm() {
    setPatientId("");
    setCurrency("KES");
    setDueAt("");
    setNotes("");
    setDraftItems([{ ...EMPTY_ITEM }]);
  }

  function updateDraftItem(
    index: number,
    field: keyof DraftItem,
    value: string,
  ) {
    setDraftItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  async function createInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const items = draftItems.map((item) => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || "0",
        taxRate: item.taxRate || "0",
      }));

      if (items.some((item) => !item.description)) {
        throw new Error("Enter a description for every invoice line.");
      }

      const response = await fetch("/api/hospital/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          currency: currency.trim().toUpperCase(),
          dueAt: dueAt ? new Date(`${dueAt}T12:00:00`).toISOString() : null,
          notes: notes.trim() || null,
          items,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create invoice.");
      }

      setSuccess(
        `Draft invoice ${result.invoice.invoiceNumber} created successfully.`,
      );
      setShowCreateForm(false);
      resetCreateForm();
      await loadInvoices();
      await refreshSelectedInvoice(result.invoice.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create invoice.");
    } finally {
      setSaving(false);
    }
  }

  async function runInvoiceAction(
    invoice: Invoice,
    action: "issue" | "void",
  ) {
    const message = action === "issue"
      ? `Issue invoice ${invoice.invoiceNumber}? This will post it to accounting.`
      : `Void invoice ${invoice.invoiceNumber}? This cannot be done after a payment is recorded.`;

    if (!window.confirm(message)) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/hospital/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? `Unable to ${action} invoice.`);
      }

      setSuccess(
        action === "issue"
          ? `Invoice ${invoice.invoiceNumber} issued successfully.`
          : `Invoice ${invoice.invoiceNumber} voided successfully.`,
      );

      await loadInvoices();
      await refreshSelectedInvoice(invoice.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${action} invoice.`);
    } finally {
      setSaving(false);
    }
  }

  function openPaymentForm(invoice: Invoice) {
    setError("");
    setSuccess("");
    setPaymentMethod("CASH");
    setPaymentAmount(outstanding(invoice).toFixed(2));
    setPaymentNotes("");
    setShowPaymentForm(true);
  }

  async function recordPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInvoice) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/hospital/invoices/${selectedInvoice.id}/payments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: paymentMethod,
            amount: paymentAmount,
            notes: paymentNotes.trim() || null,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to record payment.");
      }

      const generatedReference =
        typeof result.payment?.reference === "string"
          ? result.payment.reference
          : "";

      setSuccess(
        `Payment recorded for ${selectedInvoice.invoiceNumber}.` +
          (generatedReference ? ` Reference: ${generatedReference}.` : ""),
      );
      setShowPaymentForm(false);
      await loadInvoices();
      await refreshSelectedInvoice(selectedInvoice.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record payment.");
    } finally {
      setSaving(false);
    }
  }

  async function openInvoice(invoice: Invoice) {
    setError("");
    setSuccess("");
    setShowPaymentForm(false);

    try {
      await refreshSelectedInvoice(invoice.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load invoice.");
    }
  }

  const activePatients = patients.filter((patient) => patient.isActive !== false);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-950 to-cyan-950 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">
          Hospital workspace
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Hospital invoicing</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Create patient invoices, issue bills, record payments and monitor
              outstanding balances.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowCreateForm((current) => !current);
              setSelectedInvoice(null);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/80 bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-md transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showCreateForm ? "Close form" : "Create invoice"}
          </button>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Invoice value", value: totals.invoiceValue },
          { label: "Payments received", value: totals.amountPaid },
          { label: "Outstanding balance", value: totals.outstanding },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {money(card.value, currency || "KES")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Based on the currently loaded invoices
            </p>
          </div>
        ))}
      </section>

      {showCreateForm && (
        <form onSubmit={createInvoice} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create draft invoice</h2>
            <p className="mt-1 text-sm text-slate-500">
              The invoice is saved as a draft. Issue it after reviewing the details.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Patient *</span>
              <select
                required
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
              >
                <option value="">Select a patient</option>
                {activePatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientNumber} — {patientName(patient)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Currency *</span>
              <input
                required
                value={currency}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                minLength={3}
                maxLength={10}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Due date</span>
              <input
                type="date"
                value={dueAt}
                onChange={(event) => setDueAt(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">Invoice line items</h3>
              <button
                type="button"
                onClick={() => setDraftItems((current) => [...current, { ...EMPTY_ITEM }])}
                className="rounded-lg border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-50"
              >
                + Add line
              </button>
            </div>

            {draftItems.map((item, index) => {
              const line = calculateLine(item);

              return (
                <div key={index} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Item {index + 1}</p>
                    {draftItems.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove item ${index + 1}`}
                        onClick={() => setDraftItems((current) => current.filter((_, i) => i !== index))}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <label className="space-y-1 text-sm lg:col-span-2">
                      <span className="font-medium text-slate-700">Description *</span>
                      <input
                        required
                        maxLength={191}
                        value={item.description}
                        onChange={(event) => updateDraftItem(index, "description", event.target.value)}
                        placeholder="Consultation, laboratory test..."
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                      />
                    </label>

                    {([
                      ["quantity", "Quantity"],
                      ["unitPrice", "Unit price"],
                      ["discount", "Discount"],
                      ["taxRate", "Tax rate (%)"],
                    ] as const).map(([field, label]) => (
                      <label key={field} className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">{label}</span>
                        <input
                          type="number"
                          required
                          min={field === "quantity" ? "0.0001" : "0"}
                          max={field === "taxRate" ? "100" : undefined}
                          step="0.0001"
                          value={item[field]}
                          onChange={(event) => updateDraftItem(index, field, event.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                        />
                      </label>
                    ))}
                  </div>

                  <p className="mt-3 text-right text-sm text-slate-600">
                    Line total: <strong>{money(line.total, currency || "KES")}</strong>
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Notes</span>
              <textarea
                rows={3}
                maxLength={2000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional invoice notes"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>

            <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-600">Subtotal</span>
                <span>{money(draftTotals.subtotal, currency || "KES")}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-600">Discount</span>
                <span>−{money(draftTotals.discount, currency || "KES")}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-600">Tax</span>
                <span>{money(draftTotals.tax, currency || "KES")}</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-slate-200 pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{money(draftTotals.total, currency || "KES")}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                resetCreateForm();
              }}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || activePatients.length === 0}
              className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save draft invoice"}
            </button>
          </div>
          {activePatients.length === 0 && (
            <p className="text-sm text-amber-700">
              No active patients are available. Register or activate a patient first.
            </p>
          )}
        </form>
      )}

      {selectedInvoice && (
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Invoice details</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                {selectedInvoice.invoiceNumber}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {patientName(selectedInvoice.patient)} · {selectedInvoice.patient?.patientNumber ?? ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[selectedInvoice.status]}`}>
                {STATUS_LABELS[selectedInvoice.status]}
              </span>
              <button
                type="button"
                aria-label="Close invoice details"
                onClick={() => {
                  setSelectedInvoice(null);
                  setShowPaymentForm(false);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Invoice total</p>
              <p className="mt-1 text-lg font-semibold">{money(selectedInvoice.totalAmount, selectedInvoice.currency)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Amount paid</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">{money(selectedInvoice.amountPaid, selectedInvoice.currency)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Outstanding</p>
              <p className="mt-1 text-lg font-semibold text-amber-700">{money(outstanding(selectedInvoice), selectedInvoice.currency)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Due date</p>
              <p className="mt-1 text-lg font-semibold">{dateLabel(selectedInvoice.dueAt)}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit price</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-right">Tax</th>
                  <th className="px-4 py-3 text-right">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(selectedInvoice.items ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.description}</td>
                    <td className="px-4 py-3 text-right">{amount(item.quantity)}</td>
                    <td className="px-4 py-3 text-right">{money(item.unitPrice, selectedInvoice.currency)}</td>
                    <td className="px-4 py-3 text-right">{money(item.discount, selectedInvoice.currency)}</td>
                    <td className="px-4 py-3 text-right">{money(item.taxAmount, selectedInvoice.currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{money(item.lineTotal, selectedInvoice.currency)}</td>
                  </tr>
                ))}
                {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      No invoice line items were returned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Payment history</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Recorded payments and their generated references.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {selectedInvoice.payments?.length ?? 0} payment(s)
              </span>
            </div>
            {(selectedInvoice.payments?.length ?? 0) === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No payments have been recorded for this invoice.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Reference</th>
                      <th className="px-3 py-2">Method</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Notes</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedInvoice.payments ?? []).map((payment) => (
                      <tr key={payment.id}>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-900">
                          {payment.reference}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">{payment.method}</td>
                        <td className="whitespace-nowrap px-3 py-3">{dateLabel(payment.createdAt)}</td>
                        <td className="min-w-40 px-3 py-3 text-slate-600">{payment.notes || "—"}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold">
                          {money(payment.amount, payment.currency || selectedInvoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {selectedInvoice.notes && (
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-700">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-slate-600">{selectedInvoice.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => printHospitalInvoice(selectedInvoice)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" /> Print invoice
            </button>

            {selectedInvoice.status === "DRAFT" && (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void runInvoiceAction(selectedInvoice, "issue")}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> Issue invoice
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void runInvoiceAction(selectedInvoice, "void")}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50"
                >
                  <Ban className="h-4 w-4" /> Void draft
                </button>
              </>
            )}

            {selectedInvoice.status === "ISSUED" && (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => openPaymentForm(selectedInvoice)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" /> Record payment
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void runInvoiceAction(selectedInvoice, "void")}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50"
                >
                  <Ban className="h-4 w-4" /> Void invoice
                </button>
              </>
            )}

            {selectedInvoice.status === "PARTIALLY_PAID" && (
              <button
                type="button"
                disabled={saving}
                onClick={() => openPaymentForm(selectedInvoice)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" /> Record payment
              </button>
            )}

            {selectedInvoice.status === "PAID" && (
              <span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">
                Fully paid
              </span>
            )}

            {selectedInvoice.status === "VOID" && (
              <span className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800">
                This invoice has been voided.
              </span>
            )}
          </div>

          {showPaymentForm && (
            <form onSubmit={recordPayment} className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <h3 className="font-semibold text-slate-900">Record invoice payment</h3>
              <p className="text-sm text-slate-600">
                Outstanding balance: <strong>{money(outstanding(selectedInvoice), selectedInvoice.currency)}</strong>
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">
                    Payment reference
                  </span>
                  <div
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-emerald-900"
                    aria-live="polite"
                  >
                    Generated automatically when payment is recorded
                  </div>
                  <p className="text-xs text-slate-500">
                    You can add an external receipt or transaction number in Notes.
                  </p>
                </div>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Method *</span>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
                  >
                    <option value="CASH">Cash</option>
                    <option value="MPESA">M-Pesa</option>
                    <option value="CARD">Card</option>
                    <option value="BANK">Bank transfer</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Amount *</span>
                  <input
                    required
                    type="number"
                    min="0.0001"
                    max={outstanding(selectedInvoice)}
                    step="0.0001"
                    value={paymentAmount}
                    onChange={(event) => setPaymentAmount(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Notes</span>
                  <input
                    value={paymentNotes}
                    onChange={(event) => setPaymentNotes(event.target.value)}
                    maxLength={1000}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
                  />
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || outstanding(selectedInvoice) <= 0}
                  className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Recording..." : "Record payment"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Invoices</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search, filter and open invoices to manage their lifecycle.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadInvoices()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice number or patient"
              aria-label="Search invoices"
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>
          <select
            aria-label="Filter by invoice status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "" | InvoiceStatus)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ISSUED">Issued</option>
            <option value="PARTIALLY_PAID">Partially paid</option>
            <option value="PAID">Paid</option>
            <option value="VOID">Voided</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="min-w-48 px-4 py-3">
                    <p className="font-medium text-slate-800">{patientName(invoice.patient)}</p>
                    <p className="text-xs text-slate-500">{invoice.patient?.patientNumber ?? ""}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{dateLabel(invoice.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{dateLabel(invoice.dueAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[invoice.status]}`}>
                      {STATUS_LABELS[invoice.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">{money(invoice.totalAmount, invoice.currency)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">{money(invoice.amountPaid, invoice.currency)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{money(outstanding(invoice), invoice.currency)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void openInvoice(invoice)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && invoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <FileText className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 font-medium text-slate-700">No invoices found</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create the first HOSP invoice or change your search filters.
                    </p>
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                    Loading invoices...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500">
          Showing up to 100 invoices. The summary totals use the invoices currently loaded and may reflect the active search or status filter.
        </p>
      </section>
    </div>
  );
}
