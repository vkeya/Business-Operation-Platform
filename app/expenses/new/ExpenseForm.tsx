"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createExpenseAction } from "../action";

interface ExpenseFormProps {
  currency: string;
}

export default function ExpenseForm({
  currency,
}: ExpenseFormProps) {
  const router = useRouter();

  const [reference, setReference] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] =
    useState(
      new Date().toISOString().split("T")[0],
    );
  const [paymentStatus, setPaymentStatus] =
    useState<
      "UNPAID" | "PARTIAL" | "PAID"
    >("UNPAID");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      await createExpenseAction({
        reference,
        category,
        description,
        amount: Number(amount),
        currency,
        expenseDate: new Date(
          `${expenseDate}T00:00:00`,
        ),
        paymentStatus,
        notes: notes || undefined,
      });

      router.push("/expenses");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to record expense.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8"
    >
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="expense-reference"
            className="block text-sm font-semibold text-slate-900"
          >
            Reference
          </label>

          <input
            id="expense-reference"
            value={reference}
            onChange={(event) =>
              setReference(event.target.value)
            }
            placeholder="e.g. EXP-001"
            required
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label
            htmlFor="expense-category"
            className="block text-sm font-semibold text-slate-900"
          >
            Category
          </label>

          <input
            id="expense-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            placeholder="e.g. Rent, Utilities, Transport"
            required
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="expense-description"
          className="block text-sm font-semibold text-slate-900"
        >
          Description
        </label>

        <textarea
          id="expense-description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          rows={3}
          placeholder="Describe what the business spent money on"
          required
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label
            htmlFor="expense-amount"
            className="block text-sm font-semibold text-slate-900"
          >
            Amount
          </label>

          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              {currency}
            </span>

            <input
              id="expense-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="0.00"
              required
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-16 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="expense-date"
            className="block text-sm font-semibold text-slate-900"
          >
            Expense date
          </label>

          <input
            id="expense-date"
            type="date"
            value={expenseDate}
            onChange={(event) =>
              setExpenseDate(event.target.value)
            }
            required
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label
            htmlFor="expense-payment-status"
            className="block text-sm font-semibold text-slate-900"
          >
            Payment status
          </label>

          <select
            id="expense-payment-status"
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(
                event.target.value as
                  | "UNPAID"
                  | "PARTIAL"
                  | "PAID",
              )
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
        </div>
      </div>

      <div>
        <label
          htmlFor="expense-notes"
          className="block text-sm font-semibold text-slate-900"
        >
          Notes
        </label>

        <textarea
          id="expense-notes"
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          rows={3}
          placeholder="Optional notes"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push("/expenses")
          }
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Record expense"}
        </button>
      </div>
    </form>
  );
}