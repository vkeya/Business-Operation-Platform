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

function formatPaymentMethod(method: string) {
  return method.replaceAll("_", " ");
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
    <>
      {/* Screen / Preview */}
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:hidden">
        <div className="p-6">
          <ReceiptContent receipt={receipt} />

          <button
            type="button"
            onClick={handlePrint}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
        </div>
      </div>

      {/* Thermal / Print version */}
      <div className="receipt-print-area hidden print:block">
        <ReceiptContent receipt={receipt} />
      </div>
    </>
  );
}

function ReceiptContent({
  receipt,
}: {
  receipt: PosReceiptData;
}) {
  return (
    <div className="receipt-content mx-auto w-full max-w-[380px] bg-white text-slate-950 print:max-w-none">
      {/* BUSINESS HEADER */}
      
<div className="text-center">
  <h1 className="text-xl font-black tracking-tight">
    {receipt.business.name}
  </h1>

  {receipt.business.legalName &&
    receipt.business.legalName !==
      receipt.business.name && (
      <p className="mt-0.5 text-[10px] font-medium text-slate-600">
        {receipt.business.legalName}
      </p>
    )}

  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
    Sales Receipt
  </p>

  <p className="mt-1 text-[10px] text-slate-500">
    {receipt.business.country}
  </p>
</div>

      {/* RECEIPT META */}
      <div className="mt-4 border-y border-dashed border-slate-300 py-3 text-[11px]">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">
            Receipt
          </span>

          <span className="font-bold text-slate-950">
            {receipt.referenceNumber}
          </span>
        </div>

        <div className="mt-1 flex justify-between gap-3">
          <span className="text-slate-500">
            Date
          </span>

          <span className="text-right font-medium text-slate-800">
            {formatDate(receipt.createdAt)}
          </span>
        </div>

        {receipt.warehouse && (
          <div className="mt-1 flex justify-between gap-3">
            <span className="text-slate-500">
              Store
            </span>

            <span className="text-right font-medium text-slate-800">
              {receipt.warehouse.name}
            </span>
          </div>
        )}

        {receipt.warehouse?.code && (
          <div className="mt-1 flex justify-between gap-3">
            <span className="text-slate-500">
              Store Code
            </span>

            <span className="font-medium text-slate-800">
              {receipt.warehouse.code}
            </span>
          </div>
        )}
      </div>

      {/* CUSTOMER */}
      <div className="mt-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Customer
        </p>

        <p className="mt-1 text-[12px] font-bold">
          {receipt.customer?.name ??
            "Walk-in Customer"}
        </p>

        {receipt.customer?.phone && (
          <p className="text-[10px] text-slate-500">
            {receipt.customer.phone}
          </p>
        )}
      </div>

      {/* ITEMS */}
      <div className="mt-5">
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-300 pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
          <span>Item</span>
          <span>Total</span>
        </div>

        <div>
          {receipt.items.map((item, index) => (
            <div
              key={`${item.productName}-${index}`}
              className="border-b border-dashed border-slate-200 py-2.5"
            >
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold leading-tight">
                    {item.productName}
                  </p>

                  {item.sku && (
                    <p className="mt-0.5 text-[9px] text-slate-500">
                      SKU: {item.sku}
                    </p>
                  )}
                </div>

                <p className="shrink-0 text-[11px] font-bold">
                  {formatAmount(
                    item.totalAmount,
                    receipt.currency,
                  )}
                </p>
              </div>

              <div className="mt-1 flex flex-wrap gap-x-3 text-[9px] text-slate-500">
                <span>
                  {item.quantity} ×{" "}
                  {formatAmount(
                    item.unitPrice,
                    receipt.currency,
                  )}
                </span>

                {item.discountAmount > 0 && (
                  <span>
                    Discount:{" "}
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

      {/* TOTALS */}
      <div className="mt-4 border-t border-slate-300 pt-3 text-[11px]">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">
            Subtotal
          </span>

          <span>
            {formatAmount(
              receipt.subtotal,
              receipt.currency,
            )}
          </span>
        </div>

        {receipt.discountAmount > 0 && (
          <div className="mt-1 flex justify-between gap-3">
            <span className="text-slate-500">
              Discount
            </span>

            <span>
              -
              {formatAmount(
                receipt.discountAmount,
                receipt.currency,
              )}
            </span>
          </div>
        )}

        {receipt.taxAmount > 0 && (
          <div className="mt-1 flex justify-between gap-3">
            <span className="text-slate-500">
              {receipt.taxName ?? "Tax"}

              {receipt.taxRate !== null &&
                ` (${receipt.taxRate}%${
                  receipt.taxPricingMode ===
                  "INCLUSIVE"
                    ? " incl."
                    : " excl."
                })`}
            </span>

            <span>
              {formatAmount(
                receipt.taxAmount,
                receipt.currency,
              )}
            </span>
          </div>
        )}

        <div className="mt-3 flex justify-between gap-3 border-t border-slate-300 pt-3">
          <span className="text-[13px] font-black">
            TOTAL
          </span>

          <span className="text-[14px] font-black">
            {formatAmount(
              receipt.totalAmount,
              receipt.currency,
            )}
          </span>
        </div>
      </div>

      {/* PAYMENT */}
      <div className="mt-4 border-t border-slate-300 pt-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Payment
        </p>

        <div className="mt-2">
          {receipt.payments.map(
            (payment, index) => (
              <div
                key={`${payment.reference}-${index}`}
                className="py-1.5"
              >
                <div className="flex justify-between gap-3 text-[10px]">
                  <span className="text-slate-500">
                    {formatPaymentMethod(
                      payment.method,
                    )}
                  </span>

                  <span className="font-bold">
                    {formatAmount(
                      payment.amount,
                      payment.currency,
                    )}
                  </span>
                </div>

                {payment.reference && (
                  <div className="mt-0.5 flex justify-between gap-3 text-[9px]">
                    <span className="text-slate-500">
                      Reference
                    </span>

                    <span className="max-w-[65%] truncate text-right text-slate-700">
                      {payment.reference}
                    </span>
                  </div>
                )}
              </div>
            ),
          )}
        </div>

        <div className="mt-2 border-t border-slate-300 pt-2">
          <div className="flex justify-between gap-3 text-[11px]">
            <span className="font-bold">
              Amount Paid
            </span>

            <span className="font-black">
              {formatAmount(
                receipt.amountPaid,
                receipt.currency,
              )}
            </span>
          </div>

          {receipt.changeAmount > 0 && (
            <div className="mt-1 flex justify-between gap-3 text-[11px]">
              <span className="font-bold">
                Change
              </span>

              <span className="font-black">
                {formatAmount(
                  receipt.changeAmount,
                  receipt.currency,
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-5 border-t border-dashed border-slate-300 pt-4 text-center">
        <p className="text-[11px] font-semibold">
          Thank you for your business.
        </p>

        <p className="mt-1 text-[9px] text-slate-500">
          Please keep this receipt for your records.
        </p>

        <p className="mt-3 text-[9px] font-semibold text-slate-400">
          Powered by SmatPic
        </p>
      </div>
    </div>
  );
}