"use client";

import { useState } from "react";
import { Loader2, XCircle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  status: string | null | undefined;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
};

function formatDate(value: Date | null) {
  if (!value) return "the end of your current billing period";

  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SubscriptionCancellationControls({
  status,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManageCancellation = status === "ACTIVE";

  if (!canManageCancellation) {
    return null;
  }

  async function handleAction(action: "CANCEL" | "UNDO") {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/subscription/cancellation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "Unable to update subscription cancellation.",
        );
      }

      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to update subscription cancellation.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (cancelAtPeriodEnd) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-amber-900">
              Cancellation scheduled
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800">
              Your subscription will remain active until{" "}
              <strong>{formatDate(currentPeriodEnd)}</strong>.
              You will not lose access before then.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleAction("UNDO")}
            disabled={isSubmitting}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Undo cancellation
          </button>
        </div>

        {error && (
          <p className="mt-3 text-xs font-medium text-red-700">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Cancel subscription
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
            Cancellation takes effect at the end of your current
            billing period. Your business will remain active until then.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleAction("CANCEL")}
          disabled={isSubmitting}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Cancel subscription
        </button>
      </div>

      {error && (
        <p className="mt-3 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}