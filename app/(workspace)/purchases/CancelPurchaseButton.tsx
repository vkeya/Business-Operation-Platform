"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelPurchaseAction } from "./action";

interface CancelPurchaseButtonProps {
  purchaseId: string;
}

export default function CancelPurchaseButton({
  purchaseId,
}: CancelPurchaseButtonProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    setError("");
    setCancelling(true);

    try {
      await cancelPurchaseAction(purchaseId);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel purchase.",
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleCancel}
        disabled={cancelling}
        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cancelling ? "Cancelling..." : "Cancel purchase"}
      </button>

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}