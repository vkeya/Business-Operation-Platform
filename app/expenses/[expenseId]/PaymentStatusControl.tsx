"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateExpensePaymentStatusAction } from "../action";

interface PaymentStatusControlProps {
  expenseId: string;
  currentStatus:
    | "UNPAID"
    | "PARTIAL"
    | "PAID";
}

export default function PaymentStatusControl({
  expenseId,
  currentStatus,
}: PaymentStatusControlProps) {
  const router = useRouter();

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
          : "Unable to update payment status.",
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
        Payment status
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
          Unpaid
        </option>

        <option value="PARTIAL">
          Partially paid
        </option>

        <option value="PAID">
          Paid
        </option>
      </select>

      {saving && (
        <p className="mt-2 text-xs text-slate-400">
          Updating payment status...
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