"use client";

import {
  Banknote,
  CreditCard,
  Hash,
  WalletCards,
} from "lucide-react";

import type { PosPaymentMethod } from "@/lib/pos/posTypes";

interface PosPaymentDetailsProps {
  method: PosPaymentMethod;
  amount: string;
  reference: string;
  onAmountChange: (value: string) => void;
  onReferenceChange: (value: string) => void;
}

const paymentLabels: Record<
  PosPaymentMethod,
  string
> = {
  CASH: "Cash",
  MPESA: "M-Pesa",
  CARD: "Card",
  BANK: "Bank",
  CREDIT: "Credit",
};

const paymentIcons: Record<
  PosPaymentMethod,
  typeof Banknote
> = {
  CASH: Banknote,
  MPESA: WalletCards,
  CARD: CreditCard,
  BANK: WalletCards,
  CREDIT: CreditCard,
};

export default function PosPaymentDetails({
  method,
  amount,
  reference,
  onAmountChange,
  onReferenceChange,
}: PosPaymentDetailsProps) {
  const Icon = paymentIcons[method];

  const requiresReference =
    method === "MPESA" ||
    method === "CARD" ||
    method === "BANK";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Payment details
        </p>

        <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-violet-700">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {paymentLabels[method]}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              {method === "CASH"
                ? "Record the amount received."
                : method === "MPESA"
                  ? "Record the M-Pesa transaction reference."
                  : method === "CARD"
                    ? "Record the card authorization reference."
                    : method === "BANK"
                      ? "Record the bank transaction reference."
                      : "Record the amount applied to the customer's credit."}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Amount received
        </label>

        <div className="relative mt-2">
          <Banknote className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) =>
              onAmountChange(event.target.value)
            }
            placeholder="0.00"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
          />
        </div>
      </div>

      {requiresReference && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Transaction reference
          </label>

          <div className="relative mt-2">
            <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={reference}
              onChange={(event) =>
                onReferenceChange(event.target.value)
              }
              placeholder={`Enter ${paymentLabels[method]} reference...`}
              autoComplete="off"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
            />
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            The reference will be stored with the payment.
          </p>
        </div>
      )}

      {method === "CREDIT" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-800">
            Customer credit
          </p>

          <p className="mt-1 text-[11px] leading-5 text-amber-700">
            Credit sales should be linked to a customer
            before completing the sale.
          </p>
        </div>
      )}
    </div>
  );
}