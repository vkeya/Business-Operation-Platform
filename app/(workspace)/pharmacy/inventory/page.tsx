import { prisma } from "@/lib/database/prisma";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { BatchAdjustmentForm } from "./BatchAdjustmentForm";
import { BatchHistory } from "./BatchHistory";
import { BatchRecallForm } from "./BatchRecallForm";
import { requirePharmacyBusiness } from "@/lib/pharmacy/pharmacyAccessService";
import type { BusinessType } from "@/types";

export default async function PharmacyInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const search = params.q?.trim() ?? "";
  const status = params.status ?? "ALL";
  const business = await getCurrentBusiness();
  
  requirePharmacyBusiness(business.type as BusinessType);

  const batches = await prisma.pharmacyBatch.findMany({
    where: {
  pharmacyProduct: {
    product: {
      businessId: business.id,

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                sku: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                barcode: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
  },

  ...(status === "RECALLED"
    ? {
        isRecalled: true,
      }
    : {}),

  ...(status !== "RECALLED"
    ? {
        isRecalled: false,
      }
    : {}),
},
    include: {
      pharmacyProduct: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              barcode: true,
            },
          },
        },
      },
      warehouse: {
        select: {
          id: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      {
        expiryDate: "asc",
      },
      {
        batchNumber: "asc",
      },
    ],
  });

  const now = new Date();
  
  const totalBatches = batches.length;

const activeBatches = batches.filter((batch) => {
  const expired = batch.expiryDate <= now;
  const empty =
    batch.quantityRemaining.lessThanOrEqualTo(0);

  const expiringSoon =
    !expired &&
    batch.expiryDate.getTime() - now.getTime() <=
      90 * 24 * 60 * 60 * 1000;

  return (
    !batch.isRecalled &&
    !expired &&
    !empty &&
    !expiringSoon
  );
}).length;

const expiringBatches = batches.filter((batch) => {
  const expired = batch.expiryDate <= now;

  return (
    !batch.isRecalled &&
    !expired &&
    batch.expiryDate.getTime() - now.getTime() <=
      90 * 24 * 60 * 60 * 1000
  );
}).length;

const expiredBatches = batches.filter(
  (batch) => batch.expiryDate <= now,
).length;

const recalledBatches = batches.filter(
  (batch) => batch.isRecalled,
).length;
  
  const filteredBatches = batches.filter((batch) => {
  const expired = batch.expiryDate <= now;

  const expiringSoon =
    !expired &&
    batch.expiryDate.getTime() - now.getTime() <=
      90 * 24 * 60 * 60 * 1000;

  const empty =
    batch.quantityRemaining.lessThanOrEqualTo(0);

  const batchStatus = batch.isRecalled
    ? "RECALLED"
    : expired
      ? "EXPIRED"
      : empty
        ? "OUT_OF_STOCK"
        : expiringSoon
          ? "EXPIRING"
          : "ACTIVE";

  return status === "ALL" || batchStatus === status;
});

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Pharmacy Batch Inventory
        </h1>

        <p className="text-sm text-muted-foreground">
		
          Track medicine batches, expiry dates, stock levels and
          batch traceability.
        </p>

		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
  <div className="rounded-lg border p-4">
    <div className="text-sm text-muted-foreground">
      Total batches
    </div>
    <div className="mt-1 text-2xl font-semibold">
      {totalBatches}
    </div>
  </div>

  <div className="rounded-lg border p-4">
    <div className="text-sm text-muted-foreground">
      Active
    </div>
    <div className="mt-1 text-2xl font-semibold">
      {activeBatches}
    </div>
  </div>

  <div className="rounded-lg border p-4">
    <div className="text-sm text-muted-foreground">
      Expiring soon
    </div>
    <div className="mt-1 text-2xl font-semibold">
      {expiringBatches}
    </div>
  </div>

  <div className="rounded-lg border p-4">
    <div className="text-sm text-muted-foreground">
      Expired
    </div>
    <div className="mt-1 text-2xl font-semibold">
      {expiredBatches}
    </div>
  </div>

  <div className="rounded-lg border p-4">
    <div className="text-sm text-muted-foreground">
      Recalled
    </div>
    <div className="mt-1 text-2xl font-semibold">
      {recalledBatches}
    </div>
  </div>
</div>
		
		
		
		<form
  method="GET"
  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end"
>
  <div className="flex-1">
    <label
      htmlFor="q"
      className="mb-1 block text-sm font-medium"
    >
      Search
    </label>

    <input
      id="q"
      name="q"
      defaultValue={search}
      placeholder="Product, SKU or barcode"
      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
    />
  </div>

  <div className="w-full sm:w-52">
    <label
      htmlFor="status"
      className="mb-1 block text-sm font-medium"
    >
      Status
    </label>

    <select
      id="status"
      name="status"
      defaultValue={status}
      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
    >
      <option value="ALL">All batches</option>
      <option value="ACTIVE">Active</option>
      <option value="EXPIRING">Expiring soon</option>
      <option value="EXPIRED">Expired</option>
      <option value="RECALLED">Recalled</option>
      <option value="OUT_OF_STOCK">Out of stock</option>
    </select>
  </div>

  <button
    type="submit"
    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
  >
    Filter
  </button>
</form>
		
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
  <tr>
    <th className="px-4 py-3 text-left">Product</th>
    <th className="px-4 py-3 text-left">Type</th>
    <th className="px-4 py-3 text-left">Batch</th>
    <th className="px-4 py-3 text-left">Manufactured</th>
    <th className="px-4 py-3 text-left">Expiry</th>
    <th className="px-4 py-3 text-left">Warehouse</th>
    <th className="px-4 py-3 text-left">Supplier</th>
    <th className="px-4 py-3 text-right">Remaining</th>
    <th className="px-4 py-3 text-left">Status</th>
    <th className="px-4 py-3 text-left">Actions</th>
  </tr>
</thead>

          <tbody>
  {filteredBatches.map((batch) => {
    const expired = batch.expiryDate <= now;

    const expiringSoon =
      !expired &&
      batch.expiryDate.getTime() - now.getTime() <=
        90 * 24 * 60 * 60 * 1000;

    const empty =
      batch.quantityRemaining.lessThanOrEqualTo(0);

    const status = batch.isRecalled
      ? "RECALLED"
      : expired
        ? "EXPIRED"
        : empty
          ? "OUT OF STOCK"
          : expiringSoon
            ? "EXPIRING SOON"
            : "ACTIVE";

    return (
      <tr
        key={batch.id}
        className="border-b last:border-0"
      >
        <td className="px-4 py-3">
          <div className="font-medium">
            {batch.pharmacyProduct.product.name}
          </div>

          <div className="text-xs text-muted-foreground">
            SKU: {batch.pharmacyProduct.product.sku}
          </div>
        </td>

        <td className="px-4 py-3">
          <div className="font-medium">
            {batch.pharmacyProduct.medicineType}
          </div>

          <div className="text-xs text-muted-foreground">
            {batch.pharmacyProduct.prescriptionType}
          </div>
        </td>

        <td className="px-4 py-3 font-medium">
          {batch.batchNumber}
        </td>

        <td className="px-4 py-3">
          {batch.manufacturingDate
            ? batch.manufacturingDate.toLocaleDateString()
            : "—"}
        </td>

        <td className="px-4 py-3">
          {batch.expiryDate.toLocaleDateString()}
        </td>

        <td className="px-4 py-3">
          {batch.warehouse.name}
        </td>

        <td className="px-4 py-3">
          {batch.supplier?.name ?? "—"}
        </td>

        <td className="px-4 py-3 text-right font-medium">
          {batch.quantityRemaining.toString()}
        </td>

        <td className="px-4 py-3">
          {status}
        </td>

        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <BatchAdjustmentForm
              pharmacyBatchId={batch.id}
              quantityRemaining={Number(
                batch.quantityRemaining.toString(),
              )}
              isExpired={expired}
            />

            <BatchHistory
              pharmacyBatchId={batch.id}
            />

            <BatchRecallForm
              pharmacyBatchId={batch.id}
              isRecalled={batch.isRecalled}
            />
          </div>
        </td>
      </tr>
    );
  })}

  {filteredBatches.length === 0 && (
    <tr>
      <td
        colSpan={10}
        className="px-4 py-10 text-center text-muted-foreground"
      >
        No pharmacy batches found.
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>
    </div>
  );
}