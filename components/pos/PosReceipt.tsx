
"use client";

import { Printer } from "lucide-react";
import type {
  PosReceipt as PosReceiptData,
} from "@/lib/pos/posReceiptService";
import { useState } from "react";

interface PosReceiptProps {
  receipt: PosReceiptData;
  onPrint?: () => void;
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPaymentMethod(method: string) {
  return method.replaceAll("_", " ");
}

function ReceiptContent({
  receipt,
}: {
  receipt: PosReceiptData;
}) {
  return (
    <div className="receipt-content mx-auto w-full max-w-[380px] bg-white text-black">
      {/* BUSINESS HEADER */}
      <header className="text-center">
        {receipt.business.logoUrl && (
          <img
            src={receipt.business.logoUrl}
            alt={`${receipt.business.name} logo`}
            className="mx-auto mb-2 max-h-14 max-w-[120px] object-contain"
          />
        )}
      
        <h1 className="text-xl font-black tracking-tight">
          {receipt.business.name}
        </h1>

        {receipt.business.legalName &&
          receipt.business.legalName !== receipt.business.name && (
            <p className="mt-0.5 text-[10px]">
              {receipt.business.legalName}
            </p>
          )}

        {receipt.business.address && (
          <p className="mt-1 whitespace-pre-line text-[9px]">
            {receipt.business.address}
          </p>
        )}

        {receipt.business.phone && (
          <p className="mt-0.5 text-[9px]">
            Tel: {receipt.business.phone}
          </p>
        )}

        {receipt.business.email && (
          <p className="mt-0.5 break-all text-[9px]">
            {receipt.business.email}
          </p>
        )}

        {receipt.business.taxRegistrationNumber && (
          <p className="mt-0.5 text-[9px]">
            Tax Reg: {receipt.business.taxRegistrationNumber}
          </p>
        )}

        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em]">
          Sales Receipt
        </p>

        <p className="mt-1 text-[10px]">
          {receipt.business.country}
        </p>
      </header>

      {/* RECEIPT INFORMATION */}
      <section className="mt-4 border-y border-dashed border-slate-400 py-3 text-[10px]">
        <div className="flex justify-between gap-2">
          <span>Receipt No.</span>
          <strong className="text-right">
            {receipt.referenceNumber}
          </strong>
        </div>

        <div className="mt-1 flex justify-between gap-2">
          <span>Date</span>
          <span className="text-right">
            {formatDate(receipt.createdAt)}
          </span>
        </div>

        {receipt.warehouse && (
          <div className="mt-1 flex justify-between gap-2">
            <span>Store</span>
            <span className="text-right">
              {receipt.warehouse.name}
            </span>
          </div>
        )}
      </section>

      {/* CUSTOMER */}
      <section className="mt-3 text-[10px]">
        <p className="font-bold uppercase tracking-wider">
          Customer
        </p>

        <p className="mt-1 text-[12px] font-bold">
          {receipt.customer?.name ?? "Walk-in Customer"}
        </p>

        {receipt.customer?.phone && (
          <p className="mt-0.5">
            {receipt.customer.phone}
          </p>
        )}
      </section>

      {/* ITEMS */}
      <section className="mt-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-end gap-x-2 border-y border-black py-2 text-[9px] font-bold uppercase">
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
        </div>

        {receipt.items.map((item, index) => (
          <div
            key={`${item.productName}-${index}`}
            className="border-b border-dashed border-slate-300 py-2"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-start gap-x-2 text-[10px]">
              <div className="min-w-0">
                <p className="break-words font-bold leading-tight">
                  {item.productName}
                </p>

                {item.sellingUnitName && (
                  <p className="mt-0.5 text-[9px]">
                    {item.sellingUnitName}
                  </p>
                )}

                {item.sku && (
                  <p className="mt-0.5 text-[8px] text-slate-500">
                    SKU: {item.sku}
                  </p>
                )}
              </div>

              <span className="whitespace-nowrap text-right">
                {item.quantity}
              </span>

              <span className="whitespace-nowrap text-right">
                {item.unitPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>

              <strong className="whitespace-nowrap text-right">
                {item.totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>

            {item.discountAmount > 0 && (
              <p className="mt-1 text-[9px]">
                Item discount:{" "}
                {formatAmount(item.discountAmount, receipt.currency)}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* TOTALS */}
      <section className="mt-4 space-y-1.5 text-[10px]">
        <div className="flex justify-between gap-2">
          <span>Subtotal</span>
          <span>
            {formatAmount(receipt.subtotal, receipt.currency)}
          </span>
        </div>

        {receipt.discountAmount > 0 && (
          <div className="flex justify-between gap-2">
            <span>Discount</span>
            <span>
              -{formatAmount(receipt.discountAmount, receipt.currency)}
            </span>
          </div>
        )}

        {receipt.taxAmount > 0 && (
          <div className="flex justify-between gap-2">
            <span>
              {receipt.taxName ?? "Tax"}
              {receipt.taxRate !== null &&
                ` (${receipt.taxRate}%)`}
            </span>
            <span>
              {formatAmount(receipt.taxAmount, receipt.currency)}
            </span>
          </div>
        )}

        <div className="flex justify-between gap-2 border-y border-black py-2">
          <strong className="text-[13px]">TOTAL</strong>
          <strong className="text-[13px]">
            {formatAmount(receipt.totalAmount, receipt.currency)}
          </strong>
        </div>
      </section>

      {/* PAYMENTS */}
      <section className="mt-4 border-b border-dashed border-slate-400 pb-3">
        <p className="text-[9px] font-bold uppercase tracking-wider">
          Payment Details
        </p>

        {receipt.payments.map((payment, index) => (
          <div
            key={`${payment.reference}-${index}`}
            className="mt-2 text-[10px]"
          >
            <div className="flex justify-between gap-2">
              <span>{formatPaymentMethod(payment.method)}</span>
              <strong>
                {formatAmount(payment.amount, payment.currency)}
              </strong>
            </div>

            {payment.reference && (
              <p className="mt-0.5 break-all text-[9px]">
                Ref: {payment.reference}
              </p>
            )}
          </div>
        ))}

        <div className="mt-3 border-t border-dashed border-slate-400 pt-2 text-[10px]">
          <div className="flex justify-between gap-2">
            <strong>Amount Paid</strong>
            <strong>
              {formatAmount(receipt.amountPaid, receipt.currency)}
            </strong>
          </div>

          {receipt.changeAmount > 0 && (
            <div className="mt-1 flex justify-between gap-2">
              <strong>Change</strong>
              <strong>
                {formatAmount(receipt.changeAmount, receipt.currency)}
              </strong>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-5 text-center">
        {receipt.business.receiptFooter && (
          <p className="whitespace-pre-line text-[10px] font-semibold">
            {receipt.business.receiptFooter}
          </p>
        )}

        <p className="mt-1 text-[11px] font-bold">
          Thank you for your business!
        </p>

        <p className="mt-1 text-[9px]">
          Please keep this receipt for your records.
        </p>

        <p className="mt-3 text-[9px] font-semibold">
          Powered by SmatPic
        </p>
      </footer>
    </div>
  );
}

export default function PosReceipt({
  receipt,
  onPrint,
}: PosReceiptProps) {

  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm">("80mm");

  function handlePrint() {
    if (onPrint) {
      onPrint();
      return;
    }

    window.print();
  }

  return (
    <>
      {/* SCREEN PREVIEW */}
      <div className="receipt-screen w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:hidden">
        <div className="p-6">
          <ReceiptContent receipt={receipt} />
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-600">
              Printer width
            </span>

            <div className="flex gap-2">
              {(["58mm", "80mm"] as const).map((width) => (
                <button
                  key={width}
                  type="button"
                  onClick={() => setPaperWidth(width)}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold ${
                    paperWidth === width
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
        </div>
      </div>

      {/* THERMAL PRINT VERSION */}
      <div
        className={`receipt-print-area ${
          paperWidth === "58mm"
            ? "receipt-width-58"
            : "receipt-width-80"
        } hidden print:block`}
      >
        <ReceiptContent receipt={receipt} />
      </div>
    </>
  );
}
