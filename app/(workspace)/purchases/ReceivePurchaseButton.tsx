"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { receivePurchaseAction } from "./action";
import { getPurchasePharmacyItemsAction } from "./action";

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  isPharmacyProduct: boolean;
}

interface ReceivePurchaseButtonProps {
  purchaseId: string;
  isPharmacy?: boolean;
  items?: PurchaseItem[];
}

interface PharmacyBatchRow {
  purchaseItemId: string;
  productId: string;
  productName: string;
  purchaseQuantity: number;
  quantity: number;
  unitCost: number;
  batchNumber: string;
  expiryDate: string;
  manufacturingDate: string;
}

export default function ReceivePurchaseButton({
  purchaseId,
}: ReceivePurchaseButtonProps) {
  const router = useRouter();

  const [receiving, setReceiving] = useState(false);
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  

  const [batches, setBatches] = useState<PharmacyBatchRow[]>(
    [],
  );

  async function openReceiving() {
  setError("");

  setReceiving(true);

  try {
    const pharmacyItems =
      await getPurchasePharmacyItemsAction(
        purchaseId,
      );

    const pharmacyPurchaseItems =
      pharmacyItems.filter(
        (item) =>
          item.isPharmacyProduct &&
          item.pharmacyProductStatus === "ACTIVE",
      );

    if (pharmacyPurchaseItems.length === 0) {
      await handleReceive([]);
      return;
    }

    setBatches(
      pharmacyPurchaseItems.map((item) => ({
        purchaseItemId:
          item.purchaseItemId,
        productId:
          item.productId,
        productName:
          item.productName,
		purchaseQuantity: item.quantity,
        quantity: item.quantity,
        unitCost: item.unitCost,
        batchNumber: "",
        expiryDate: "",
        manufacturingDate: "",
      })),
    );

    setShowDialog(true);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to load pharmacy purchase items.",
    );
  } finally {
    setReceiving(false);
  }
}

  async function handleReceive(
    pharmacyBatches: PharmacyBatchRow[],
  ) {
    setError("");
    setReceiving(true);

    try {
		
	  const purchaseItemIds = [
  ...new Set(
    batches.map(
      (batch) => batch.purchaseItemId,
    ),
  ),
];

for (const purchaseItemId of purchaseItemIds) {
  const summary =
    getBatchQuantitySummary(
      purchaseItemId,
    );

  if (
    summary.allocatedQuantity >
    summary.requiredQuantity
  ) {
    throw new Error(
      `Batch quantity exceeds the purchase quantity for ${batches.find(
        (batch) =>
          batch.purchaseItemId ===
          purchaseItemId,
      )?.productName ?? "product"}.`,
    );
  }

  if (
    summary.allocatedQuantity !==
    summary.requiredQuantity
  ) {
    throw new Error(
      `Batch quantities must equal the purchase quantity for ${batches.find(
        (batch) =>
          batch.purchaseItemId ===
          purchaseItemId,
      )?.productName ?? "product"}.`,
    );
  }
}	
		
      await receivePurchaseAction(
        purchaseId,
        pharmacyBatches,
      );

      setShowDialog(false);
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

  function updateBatch(
  index: number,
  field: keyof PharmacyBatchRow,
  value: string,
) {
  setBatches((current) =>
    current.map((batch, rowIndex) =>
      rowIndex === index
        ? {
            ...batch,
            [field]: value,
          }
        : batch,
    ),
  );
}
  
  function addBatchRow(purchaseItemId: string) {
  const sourceItem = batches.find(
    (batch) => batch.purchaseItemId === purchaseItemId,
  );

  if (!sourceItem) {
    return;
  }

  setBatches((current) => [
    ...current,
    {
      purchaseItemId: sourceItem.purchaseItemId,
      productId: sourceItem.productId,
      productName: sourceItem.productName,
	  purchaseQuantity: sourceItem.purchaseQuantity,
      quantity: 0,
      unitCost: sourceItem.unitCost,
      batchNumber: "",
      expiryDate: "",
      manufacturingDate: "",
    },
  ]);
}

function removeBatchRow(index: number) {
  setBatches((current) =>
    current.filter((_, rowIndex) => rowIndex !== index),
  );
}

function getBatchQuantitySummary(
  purchaseItemId: string,
) {
  const rows = batches.filter(
    (batch) =>
      batch.purchaseItemId === purchaseItemId,
  );

  const requiredQuantity =
  rows[0]?.purchaseQuantity ?? 0;

  const allocatedQuantity = rows.reduce(
    (total, batch) =>
      total + Number(batch.quantity || 0),
    0,
  );

  const remainingQuantity =
    requiredQuantity - allocatedQuantity;

  return {
    requiredQuantity,
    allocatedQuantity,
    remainingQuantity,
  };
}

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={openReceiving}
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

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Receive Pharmacy Purchase
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the batch and expiry information for each
                pharmacy product being received.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {batches.map((batch, index) => (
                <div
                  key={`${batch.purchaseItemId}-${index}`}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="mb-4">
                    <p className="font-semibold text-slate-900">
                      {batch.productName}
                    </p>
                  
                    <p className="mt-1 text-xs text-slate-500">
                      Purchase quantity: {batch.purchaseQuantity} · Unit
                      cost: {batch.unitCost}
                    </p>
					
					{(() => {
                      const summary =
                        getBatchQuantitySummary(
                          batch.purchaseItemId,
                        );
                    
                      return (
                        <p className="mt-2 text-xs font-medium text-slate-600">
                          Required: {summary.requiredQuantity} ·{" "}
                          Allocated: {summary.allocatedQuantity} ·{" "}
                          Remaining: {summary.remainingQuantity}
                        </p>
                      );
                    })()}
					
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
				  
				  <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Batch quantity
                      </label>
                    
                      <input
                        type="number"
                        min="0"
                        step="0.0001"
                        value={batch.quantity}
                        onChange={(event) =>
                          updateBatch(
                            index,
                            "quantity",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                      />
                    </div>
				  
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Batch number
                      </label>

                      <input
                        type="text"
                        value={batch.batchNumber}
                        onChange={(event) =>
                          updateBatch(
                            index,
                            "batchNumber",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. BATCH-001"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Expiry date
                      </label>

                      <input
                        type="date"
                        value={batch.expiryDate}
                        onChange={(event) =>
                          updateBatch(
                            index,
                            "expiryDate",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Manufacturing date
                      </label>

                      <input
                        type="date"
                        value={batch.manufacturingDate}
                        onChange={(event) =>
                          updateBatch(
                            index,
                            "manufacturingDate",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                      />
                    </div>
                                   </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addBatchRow(batch.purchaseItemId)
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      + Add Batch
                    </button>

                    {batches.filter(
                      (item) =>
                        item.purchaseItemId ===
                        batch.purchaseItemId,
                    ).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBatchRow(index)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
             

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                disabled={receiving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleReceive(batches)}
                disabled={receiving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {receiving
                  ? "Receiving..."
                  : "Confirm receipt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}