"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateExpensePaymentStatusAction } from "../action";
import type { TranslationSet } from "@/lib/i18n";

interface PaymentStatusControlProps {
  expenseId: string;
  currentStatus:
    | "UNPAID"
    | "PARTIAL"
    | "PAID";
  translations: TranslationSet;
}

export default function PaymentStatusControl({
  expenseId,
  currentStatus,
  translations,
}: PaymentStatusControlProps) {
  const router = useRouter();
  const t = translations;

  const [status, setStatus] =
    useState(currentStatus);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState("");

  async function handleChange(
    nextStatus:
      | "UNPAID"
      | "PARTIAL"
      | "PAID",
  ) {
    if (nextStatus === status) {
      return;
    }

    setError("");
    setSaving(true);

    try {
      await updateExpensePaymentStatusAction(
        expenseId,
        nextStatus,
      );

      setStatus(nextStatus);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.expenses.unableToUpdatePaymentStatus,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label
        htmlFor="expense-payment-status"
        className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400"
      >
        {t.expenses.paymentStatus}
      </label>

      <select
        id="expense-payment-status"
        value={status}
        disabled={saving}
        onChange={(event) =>
          handleChange(
            event.target.value as
              | "UNPAID"
              | "PARTIAL"
              | "PAID",
          )
        }
        className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="UNPAID">
          {t.expenses.unpaidStatus}
        </option>

        <option value="PARTIAL">
          {t.expenses.partiallyPaidStatus}
        </option>

        <option value="PAID">
          {t.expenses.paidStatus}
        </option>
      </select>

      {saving && (
        <p className="mt-2 text-xs text-slate-400">
          {t.expenses.updatingPaymentStatus}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}