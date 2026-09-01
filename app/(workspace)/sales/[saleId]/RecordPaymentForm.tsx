"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createSalePaymentAction } from "@/lib/sales/actions";
import type { TranslationSet } from "@/lib/i18n";

interface RecordPaymentFormProps {
  saleId: string;
  currency: string;
  outstandingAmount: number;
  translations: TranslationSet;
}

export default function RecordPaymentForm({
  saleId,
  currency,
  outstandingAmount,
  translations,
}: RecordPaymentFormProps) {
  const router = useRouter();
  const t = translations;

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

    if (!method.trim()) {
      setError(
        t.recordPayment.methodRequired,
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
        t.recordPayment.amountRequired,
      );
      return;
    }

    if (
      parsedAmount >
      outstandingAmount
    ) {
      setError(
        t.recordPayment.amountExceedsOutstanding,
      );
      return;
    }

    setSubmitting(true);

    try {
      await createSalePaymentAction({
        saleId,
        method: method.trim(),
        amount: parsedAmount,
        currency,
        notes:
          notes.trim() || undefined,
      });


      setAmount("");
      setNotes("");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.recordPayment.recordError,
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
          {t.recordPayment.title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {t.recordPayment.description}
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
            htmlFor="sale-payment-method"
            className="block text-sm font-medium text-slate-700"
          >
            {t.recordPayment.paymentMethod}
          </label>

          <select
            id="sale-payment-method"
            value={method}
            onChange={(event) =>
              setMethod(
                event.target.value,
              )
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
          >
            <option value="Cash">
              {t.recordPayment.cash}
            </option>

            <option value="Bank Transfer">
              {t.recordPayment.bankTransfer}
            </option>

            <option value="Card">
              {t.recordPayment.card}
            </option>

            <option value="Mobile Money">
              {t.recordPayment.mobileMoney}
            </option>

            <option value="Cheque">
              {t.recordPayment.cheque}
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="sale-payment-amount"
            className="block text-sm font-medium text-slate-700"
          >
            {t.recordPayment.amount}
          </label>

          <div className="mt-2 flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
              {currency}
            </span>

            <input
              id="sale-payment-amount"
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
            {t.recordPayment.outstanding}:{" "}
            {currency}{" "}
            {outstandingAmount.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
          </p>
        </div>

        <div>
          <label
            htmlFor="sale-payment-notes"
            className="block text-sm font-medium text-slate-700"
          >
            {t.recordPayment.notes}
          </label>

          <input
            id="sale-payment-notes"
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            placeholder={
              t.recordPayment.optional
            }
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={
            submitting ||
            outstandingAmount <= 0
          }
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? t.recordPayment.recording
            : t.recordPayment.record}
        </button>
      </div>
    </form>
  );
}