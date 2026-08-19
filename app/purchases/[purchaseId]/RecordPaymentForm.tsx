"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createPurchasePaymentAction } from "../action";

interface RecordPaymentFormProps {
  purchaseId: string;
  currency: string;
  outstandingAmount: number;
}

export default function RecordPaymentForm({
  purchaseId,
  currency,
  outstandingAmount,
}: RecordPaymentFormProps) {
  const router = useRouter();
  const [reference, setReference] =
    useState("");

  const [method, setMethod] =
    useState("Cash");

  const [amount, setAmount] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!reference.trim()) {
      setError(
        "Payment reference is required.",
      );
      return;
    }

    if (!method.trim()) {
      setError(
        "Payment method is required.",
      );
      return;
    }

    const parsedAmount =
      Number(amount);

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setError(
        "Payment amount must be greater than zero.",
      );
      return;
    }

    if (
      parsedAmount >
      outstandingAmount
    ) {
      setError(
        "Payment amount exceeds the outstanding balance.",
      );
      return;
    }

       setSubmitting(true);

    try {
      await createPurchasePaymentAction({
        purchaseId,
        reference: reference.trim(),
        method: method.trim(),
        amount: parsedAmount,
        currency,
        notes:
          notes.trim() || undefined,
      });

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to record payment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div>
        <h2 className="font-semibold text-slate-900">
          Record payment
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Record a payment against this purchase.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="payment-reference"
            className="block text-sm font-medium text-slate-700"
          >
            Payment reference
          </label>

          <input
            id="payment-reference"
            value={reference}
            onChange={(event) =>
              setReference(
                event.target.value,
              )
            }
            placeholder="e.g. PAY-001"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="payment-method"
            className="block text-sm font-medium text-slate-700"
          >
            Payment method
          </label>

          <select
            id="payment-method"
            value={method}
            onChange={(event) =>
              setMethod(
                event.target.value,
              )
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
          >
            <option value="Cash">
              Cash
            </option>

            <option value="Bank Transfer">
              Bank Transfer
            </option>

            <option value="Card">
              Card
            </option>

            <option value="Mobile Money">
              Mobile Money
            </option>

            <option value="Cheque">
              Cheque
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="payment-amount"
            className="block text-sm font-medium text-slate-700"
          >
            Amount
          </label>

          <div className="mt-2 flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
              {currency}
            </span>

            <input
              id="payment-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value,
                )
              }
              className="w-full rounded-r-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Outstanding: {currency}{" "}
            {outstandingAmount.toLocaleString()}
          </p>
        </div>

        <div>
          <label
            htmlFor="payment-notes"
            className="block text-sm font-medium text-slate-700"
          >
            Notes
          </label>

          <input
            id="payment-notes"
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            placeholder="Optional"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Record payment
        </button>
      </div>
    </form>
  );
}