"use client";

import { useState } from "react";
import { adjustPharmacyBatchAction } from "./actions";

type AdjustmentType = "ADJUSTMENT" | "DAMAGE" | "EXPIRY";

interface BatchAdjustmentFormProps {
  pharmacyBatchId: string;
  quantityRemaining: number;
  isExpired: boolean;
}

export function BatchAdjustmentForm({
  pharmacyBatchId,
  quantityRemaining,
  isExpired,
}: BatchAdjustmentFormProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [type, setType] =
    useState<AdjustmentType>("ADJUSTMENT");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(
    null,
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const parsedQuantity = Number(quantity);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setMessage(
        "Adjustment quantity must be greater than zero.",
      );
      return;
    }

    if (parsedQuantity > quantityRemaining) {
      setMessage(
        `Only ${quantityRemaining} unit(s) remain in this batch.`,
      );
      return;
    }

    if (!reason.trim()) {
      setMessage("A reason is required.");
      return;
    }

    if (type === "EXPIRY" && !isExpired) {
      setMessage(
        "An expiry adjustment can only be made after the batch has expired.",
      );
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await adjustPharmacyBatchAction({
        operationId: crypto.randomUUID(),
        pharmacyBatchId,
        quantity: parsedQuantity,
        type,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });

      setMessage("Stock adjustment completed.");
      setQuantity("");
      setReason("");
      setNotes("");

      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to adjust batch stock.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        onClick={() => setOpen(true)}
        disabled={quantityRemaining <= 0}
      >
        Adjust
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-[280px] space-y-3 rounded-md border p-3"
    >
      <div className="text-sm font-medium">
        Adjust Batch Stock
      </div>

      <select
        value={type}
        onChange={(event) =>
          setType(event.target.value as AdjustmentType)
        }
        className="w-full rounded-md border px-3 py-2 text-sm"
        disabled={saving}
      >
        <option value="ADJUSTMENT">
          Stock Adjustment
        </option>
        <option value="DAMAGE">
          Damage
        </option>
        {isExpired && (
          <option value="EXPIRY">
            Expiry
          </option>
        )}
      </select>

      <input
        type="number"
        min="0.0001"
        max={quantityRemaining}
        step="any"
        value={quantity}
        onChange={(event) =>
          setQuantity(event.target.value)
        }
        placeholder={`Quantity (max ${quantityRemaining})`}
        className="w-full rounded-md border px-3 py-2 text-sm"
        disabled={saving}
      />

      <input
        type="text"
        value={reason}
        onChange={(event) =>
          setReason(event.target.value)
        }
        placeholder="Reason"
        className="w-full rounded-md border px-3 py-2 text-sm"
        disabled={saving}
      />

      <textarea
        value={notes}
        onChange={(event) =>
          setNotes(event.target.value)
        }
        placeholder="Notes (optional)"
        className="w-full rounded-md border px-3 py-2 text-sm"
        rows={2}
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
          {saving ? "Saving..." : "Save Adjustment"}
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