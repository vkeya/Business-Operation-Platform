"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { orderPurchaseAction } from "./action";

interface OrderPurchaseButtonProps {
  purchaseId: string;
}

export default function OrderPurchaseButton({
  purchaseId,
}: OrderPurchaseButtonProps) {
  const router = useRouter();
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState("");

  async function handleOrder() {
    setError("");
    setOrdering(true);

    try {
      await orderPurchaseAction(purchaseId);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to order purchase.",
      );
    } finally {
      setOrdering(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
  type="button"
  onClick={handleOrder}
  disabled={ordering}
  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
>
        {ordering ? "Ordering..." : "Order purchase"}
      </button>

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}