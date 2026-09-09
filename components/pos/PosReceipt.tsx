"use client";

import { Printer } from "lucide-react";
import type { PosReceipt as PosReceiptData } from "@/lib/pos/posReceiptService";

interface PosReceiptProps {
  receipt: PosReceiptData;
  onPrint?: () => void;
}

function formatAmount(
  amount: number,
  currency: string,
) {
  return `${currency} ${amount.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

export default function PosReceipt({
  receipt,
  onPrint,
}: PosReceiptProps) {
  function handlePrint() {
    if (onPrint) {
      onPrint();
      return;
    }

    window.print();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm print:max-w-none print:border-0 print:shadow-none">
      <div className="p-6 print:p-4">
        <div className="text-center">
          <p className="text-lg font-black tracking-tight text-slate-950">
            TEKETEKE
          </p>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Sales Receipt
          </p>
        </div>

        <div className="mt-6 border-y border-dashed border-slate-200 py-4 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">
              Receipt
            </span>
            <span className="font-bold text-slate-900">
              {receipt.referenceNumber}
            </span>
          </div>

          <div className="mt-2 flex justify-between gap-4">
            <span className="text-slate-400">
              Date
            </span>
            <span className="font-medium text-slate-700">
              {formatDate(receipt.createdAt)}
            </span>
          </div>

          {receipt.warehouse && (
            <div className="mt-2 flex justify-between gap-4">
              <span className="text-slate-400">
                Store
              </span>
              <span className="font-medium text-slate-700">
                {receipt.warehouse.name}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Customer
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {receipt.customer?.name ??
              "Walk-in Customer"}
          </p>

          {receipt.customer?.phone && (
            <p className="mt-0.5 text-xs text-slate-400">
              {receipt.customer.phone}
            </p>
          )}
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <span>Item</span>
            <span>Total</span>
          </div>

          <div className="divide-y divide-slate-100">
            {receipt.items.map((item, index) => (
              <div
                key={`${item.productName}-${index}`}
                className="py-3"
              >
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.productName}
                    </p>

                    {item.sku && (
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {item.sku}
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 text-sm font-bold text-slate-900">
                    {formatAmount(
                      item.totalAmount,
                      receipt.currency,
                    )}
                  </p>
                </div>

                <div className="mt-1 flex gap-3 text-[11px] text-slate-400">
                  <span>
                    {item.quantity} ×{" "}
                    {formatAmount(
                      item.unitPrice,
                      receipt.currency,
                    )}
                  </span>

                  {item.discountAmount > 0 && (
                    <span>
                      Discount{" "}
                      {formatAmount(
                        item.discountAmount,
                        receipt.currency,
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">
              Subtotal
            </span>
            <span className="font-medium text-slate-800">
              {formatAmount(
                receipt.subtotal,
                receipt.currency,
              )}
            </span>
          </div>

          {receipt.discountAmount > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Discount
              </span>
              <span className="font-medium text-slate-800">
                -
                {formatAmount(
                  receipt.discountAmount,
                  receipt.currency,
                )}
              </span>
            </div>
          )}

          {receipt.taxAmount > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Tax
              </span>
              <span className="font-medium text-slate-800">
                {formatAmount(
                  receipt.taxAmount,
                  receipt.currency,
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
            <span className="font-bold text-slate-900">
              Total
            </span>
            <span className="text-base font-black text-slate-950">
              {formatAmount(
                receipt.totalAmount,
                receipt.currency,
              )}
            </span>
          </div>
        </div>

       <div className="mt-6 rounded-xl bg-slate-50 p-4 print:bg-transparent print:p-0">
  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
    Payment
  </p>

  <div className="mt-3 space-y-3">
    {receipt.payments.map(
      (payment, index) => (
        <div
          key={`${payment.reference}-${index}`}
          className="border-b border-slate-200 pb-3 last:border-0 last:pb-0"
        >
          <div className="flex justify-between gap-4">
            <span className="text-xs text-slate-500">
              Method
            </span>

            <span className="text-xs font-bold uppercase text-slate-900">
              {payment.method}
            </span>
          </div>

          <div className="mt-1 flex justify-between gap-4">
            <span className="text-xs text-slate-500">
              Amount
            </span>

            <span className="text-xs font-bold text-slate-900">
              {formatAmount(
                payment.amount,
                payment.currency,
              )}
            </span>
          </div>

          <div className="mt-1 flex justify-between gap-4">
            <span className="text-xs text-slate-500">
              Reference
            </span>

            <span className="max-w-[60%] truncate text-right text-xs font-medium text-slate-700">
              {payment.reference}
            </span>
          </div>
        </div>
      ),
    )}

    <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
      <span className="text-xs font-bold text-slate-900">
        Amount Paid
      </span>

      <span className="text-sm font-black text-slate-950">
        {formatAmount(
          receipt.amountPaid,
          receipt.currency,
        )}
      </span>
    </div>

    {receipt.changeAmount > 0 && (
      <div className="flex justify-between gap-4">
        <span className="text-xs font-bold text-slate-900">
          Change
        </span>

        <span className="text-sm font-black text-slate-950">
          {formatAmount(
            receipt.changeAmount,
            receipt.currency,
          )}
        </span>
      </div>
    )}
  </div>
</div>

        <div className="mt-6 text-center">
          <p className="text-xs font-medium text-slate-500">
            Thank you for your business.
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            Powered by Teketeke
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-slate-800 print:hidden"
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </button>
      </div>
    </div>
  );
}