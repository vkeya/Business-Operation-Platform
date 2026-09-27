"use client";

import { useState } from "react";
import { getPharmacyBatchHistoryAction } from "./historyActions";

interface BatchHistoryProps {
  pharmacyBatchId: string;
}

export function BatchHistory({
  pharmacyBatchId,
}: BatchHistoryProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    Awaited<
      ReturnType<
        typeof getPharmacyBatchHistoryAction
      >
    > | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    setOpen(true);

    if (history) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result =
        await getPharmacyBatchHistoryAction(
          pharmacyBatchId,
        );

      setHistory(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load batch history.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={loadHistory}
        className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        History
      </button>
    );
  }

  return (
    <div className="min-w-[320px] rounded-md border p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-medium">
          Batch History
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">
          Loading history...
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}

      {history && !loading && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2">
              <span className="text-muted-foreground">
                Product:
              </span>{" "}
              {history.batch.pharmacyProduct.product.name}
            </div>

            <div>
              <span className="text-muted-foreground">
                SKU:
              </span>{" "}
              {history.batch.pharmacyProduct.product.sku}
            </div>

            <div>
              <span className="text-muted-foreground">
                Barcode:
              </span>{" "}
              {history.batch.pharmacyProduct.product.barcode || "—"}
            </div>

            <div>
              <span className="text-muted-foreground">
                Batch:
              </span>{" "}
              {history.batch.batchNumber}
            </div>

            <div>
              <span className="text-muted-foreground">
                Warehouse:
              </span>{" "}
              {history.batch.warehouse.name}
            </div>

            <div>
              <span className="text-muted-foreground">
                Supplier:
              </span>{" "}
              {history.batch.supplier?.name || "—"}
            </div>

            <div>
              <span className="text-muted-foreground">
                Expiry:
              </span>{" "}
              {history.batch.expiryDate.toLocaleDateString()}
            </div>

            <div>
              <span className="text-muted-foreground">
                Received:
              </span>{" "}
              {history.batch.quantityReceived.toString()}
            </div>

            <div>
              <span className="text-muted-foreground">
                Remaining:
              </span>{" "}
              {history.batch.quantityRemaining.toString()}
            </div>

            <div>
              <span className="text-muted-foreground">
                Status:
              </span>{" "}
              {history.batch.isRecalled
                ? "RECALLED"
                : history.batch.quantityRemaining.lessThanOrEqualTo(0)
                  ? "OUT OF STOCK"
                  : history.batch.expiryDate <= new Date()
                    ? "EXPIRED"
                    : "ACTIVE"}
            </div>

            {history.batch.isRecalled &&
              history.batch.recallReason && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">
                    Recall reason:
                  </span>{" "}
                  {history.batch.recallReason}
                </div>
              )}
          </div>
		  
		            {history.batch.purchase && (
            <div className="border-t pt-3">
              <div className="mb-2 text-xs font-medium">
                Purchase
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">
                    Reference:
                  </span>{" "}
                  {history.batch.purchase.referenceNumber}
                </div>

                <div>
                  <span className="text-muted-foreground">
                    Supplier Invoice:
                  </span>{" "}
                  {history.batch.purchase.supplierInvoiceNumber || "—"}
                </div>

                <div>
                  <span className="text-muted-foreground">
                    Status:
                  </span>{" "}
                  {history.batch.purchase.status}
                </div>

                <div>
                  <span className="text-muted-foreground">
                    Date:
                  </span>{" "}
                  {history.batch.purchase.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <div className="mb-2 text-xs font-medium">
              Controlled Dispensing
            </div>

            {history.dispensingRecords.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                No controlled dispensing records.
              </div>
            ) : (
              <div className="space-y-2">
                {history.dispensingRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded border p-2 text-xs"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {record.status}
                      </span>

                      <span>
                        Qty: {record.quantity.toString()}
                      </span>
                    </div>

                    <div className="mt-1 grid grid-cols-2 gap-1">
                      <div>
                        Sale:{" "}
                        {record.sale?.referenceNumber || "—"}
                      </div>

                      <div>
                        Prescription:{" "}
                        {record.prescription
                          ?.prescriptionNumber || "—"}
                      </div>

                      <div>
                        Customer:{" "}
                        {record.customer?.name || "—"}
                      </div>

                      <div>
                        Pharmacist:{" "}
                        {record.pharmacistName || "—"}
                      </div>

                      <div>
                        Register:{" "}
                        {record.registerReference || "—"}
                      </div>

                      <div>
                        Dispensed:{" "}
                        {record.dispensedAt.toLocaleString()}
                      </div>
                    </div>

                    {record.reason && (
                      <div className="mt-1 text-muted-foreground">
                        Reason: {record.reason}
                      </div>
                    )}

                    {record.reversedAt && (
                      <div className="mt-1 text-destructive">
                        Reversed:{" "}
                        {record.reversedAt.toLocaleString()}
                        {record.reversalReason
                          ? ` — ${record.reversalReason}`
                          : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-3">
            <div className="mb-2 text-xs font-medium">
              Stock Adjustments
            </div>

            {history.movements.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                No batch adjustments recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {history.movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="rounded border p-2 text-xs"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {movement.type}
                      </span>

                      <span>
                        {movement.quantity.toString()}
                      </span>
                    </div>

                    {movement.notes && (
                      <div className="mt-1 text-muted-foreground">
                        {movement.notes}
                      </div>
                    )}

                    <div className="mt-1 text-muted-foreground">
                      {movement.createdAt.toLocaleString()}
                    </div>

                    <div className="text-muted-foreground">
                      User: {movement.createdBy}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
