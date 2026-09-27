"use client";

import { useState } from "react";
import { recallPharmacyBatchAction } from "./recallActions";

interface BatchRecallFormProps {
  pharmacyBatchId: string;
  isRecalled: boolean;
}

export function BatchRecallForm({
  pharmacyBatchId,
  isRecalled,
}: BatchRecallFormProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (isRecalled) {
    return (
      <span className="rounded-md border px-3 py-1.5 text-xs font-medium">
        Recalled
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        Recall
      </button>
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setMessage("A recall reason is required.");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await recallPharmacyBatchAction({
        pharmacyBatchId,
        operationId: crypto.randomUUID(),
        reason: trimmedReason,
      });

      setMessage("Batch recalled successfully.");

      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to recall batch.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-[280px] space-y-3 rounded-md border p-3"
    >
      <div className="text-sm font-medium">
        Recall Batch
      </div>

      <textarea
        value={reason}
        onChange={(event) =>
          setReason(event.target.value)
        }
        placeholder="Reason for recall"
        className="w-full rounded-md border px-3 py-2 text-sm"
        rows={3}
        disabled={saving}
      />

      {message && (
        <div className="text-xs text-muted-foreground">
          {message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Recalling..." : "Confirm Recall"}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setOpen(false);
            setMessage(null);
          }}
          className="rounded-md border px-3 py-1.5 text-xs font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}