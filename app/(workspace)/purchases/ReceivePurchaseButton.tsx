"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { receivePurchaseAction } from "./action";

interface ReceivePurchaseButtonProps {
  purchaseId: string;
}

export default function ReceivePurchaseButton({
  purchaseId,
}: ReceivePurchaseButtonProps) {
  const router = useRouter();
  const [receiving, setReceiving] = useState(false);
  const [error, setError] = useState("");

  async function handleReceive() {
    setError("");
    setReceiving(true);

    try {
      await receivePurchaseAction(purchaseId);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to receive purchase.",
      );
    } finally {
      setReceiving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleReceive}
        disabled={receiving}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {receiving
          ? "Receiving..."
          : "Receive purchase"}
      </button>

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}