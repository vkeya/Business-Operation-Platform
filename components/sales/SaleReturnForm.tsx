"use client";

import { useMemo, useState } from "react";

interface SaleReturnItem {
  id: string;
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

interface SaleReturnFormProps {
  saleId: string;
  businessId: string;
  currency: string;
  items: SaleReturnItem[];
  disabled?: boolean;
}

export default function SaleReturnForm({
  saleId,
  businessId,
  currency,
  items,
  disabled = false,
}: SaleReturnFormProps) {
  const [quantities, setQuantities] =
    useState<Record<string, number>>({});

  const [reason, setReason] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const selectedItems = useMemo(() => {
    return items
      .map((item) => {
        const quantity =
          quantities[item.id] ?? 0;

        if (quantity <= 0) {
          return null;
        }

        const ratio =
          quantity / item.quantity;

        return {
          ...item,
          returnQuantity: quantity,
          returnSubtotal:
            item.unitPrice * quantity,
          returnDiscount:
            item.discountAmount * ratio,
          returnTax:
            item.taxAmount * ratio,
          returnTotal:
            item.totalAmount * ratio,
        };
      })
      .filter(
        (
          item,
        ): item is NonNullable<typeof item> =>
          item !== null,
      );
  }, [items, quantities]);

  const summary = useMemo(() => {
    return selectedItems.reduce(
      (result, item) => ({
        subtotal:
          result.subtotal +
          item.returnSubtotal,
        discount:
          result.discount +
          item.returnDiscount,
        tax:
          result.tax +
          item.returnTax,
        total:
          result.total +
          item.returnTotal,
      }),
      {
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
      },
    );
  }, [selectedItems]);

  function updateQuantity(
    item: SaleReturnItem,
    value: string,
  ) {
    const quantity =
      value === ""
        ? 0
        : Number(value);

    if (!Number.isFinite(quantity)) {
      return;
    }

    if (quantity < 0) {
      return;
    }

    if (quantity > item.quantity) {
      setQuantities((current) => ({
        ...current,
        [item.id]: item.quantity,
      }));
      return;
    }

    setQuantities((current) => ({
      ...current,
      [item.id]: quantity,
    }));

    setSuccess(null);
    setError(null);
  }

  async function submitReturn() {
    setError(null);
    setSuccess(null);

    if (selectedItems.length === 0) {
      setError(
        "Select at least one item to return.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/sales/returns",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              businessId,
              saleId,
              currency,
              items:
                selectedItems.map(
                  (item) => ({
                    saleItemId:
                      item.id,
                    quantity:
                      item.returnQuantity,
                  }),
                ),
              reason:
                reason.trim() || undefined,
              notes:
                notes.trim() || undefined,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Failed to process return.",
        );
      }

      setSuccess(
        `Return ${data.referenceNumber} completed successfully.`,
      );

      setQuantities({});
      setReason("");
      setNotes("");

      window.location.reload();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to process return.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (disabled) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Returns
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Return items
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select the quantities being returned.
          Tax and refund values are calculated
          from the original sale.
        </p>
      </div>

      <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {items.map((item) => {
          const selected =
            quantities[item.id] ?? 0;

          return (
            <div
              key={item.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {item.productName}
                </p>

                {item.sku && (
                  <p className="mt-1 text-xs text-slate-500">
                    SKU: {item.sku}
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-500">
                  Sold: {item.quantity} ·{" "}
                  {currency}{" "}
                  {item.unitPrice.toFixed(2)} each
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Return
                </label>

                <input
                  type="number"
                  min="0"
                  max={item.quantity}
                  step="any"
                  value={
                    selected === 0
                      ? ""
                      : selected
                  }
                  onChange={(event) =>
                    updateQuantity(
                      item,
                      event.target.value,
                    )
                  }
                  className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />

                <span className="text-xs text-slate-400">
                  / {item.quantity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Reason
          </label>

          <input
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder="Customer return"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Notes
          </label>

          <input
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            placeholder="Optional notes"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">
              Return subtotal
            </span>

            <span className="font-medium text-slate-900">
              {currency}{" "}
              {summary.subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              Discount
            </span>

            <span className="font-medium text-slate-900">
              {currency}{" "}
              {summary.discount.toFixed(2)}
            </span>
          </div>

          {summary.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">
                Tax
              </span>

              <span className="font-medium text-slate-900">
                {currency}{" "}
                {summary.tax.toFixed(2)}
              </span>
            </div>
          )}

          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-900">
                Refund total
              </span>

              <span className="text-xl font-semibold text-slate-900">
                {currency}{" "}
                {summary.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={
            submitting ||
            selectedItems.length === 0
          }
          onClick={submitReturn}
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Processing return..."
            : "Complete return"}
        </button>
      </div>
    </section>
  );
}