import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { getAuthenticatedUserId } from "@/lib/auth/auth";
import { pharmacyBatchViewService } from "@/lib/pharmacy/stock/pharmacyBatchViewService";

export default async function PharmacyBatchesPage() {
  const business = await getCurrentBusiness();

  const userId = await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "inventory.read",
  );

  const batches =
    await pharmacyBatchViewService.list({
      businessId: business.id,
    });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Pharmacy Batches
        </h1>

        <p className="text-sm text-muted-foreground">
          View batch, expiry, quantity, supplier and
          warehouse information for pharmacy stock.
        </p>
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left">
                  Product
                </th>

                <th className="px-4 py-3 text-left">
                  Batch
                </th>

                <th className="px-4 py-3 text-left">
                  Expiry
                </th>

                <th className="px-4 py-3 text-right">
                  Remaining
                </th>

                <th className="px-4 py-3 text-left">
                  Warehouse
                </th>

                <th className="px-4 py-3 text-left">
                  Supplier
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {batches.map((batch) => (
                <tr
                  key={batch.id}
                  className="border-b last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {batch.product.name}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {batch.product.sku}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {batch.batchNumber}
                  </td>

                  <td className="px-4 py-3">
                    {batch.expiryDate.toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {batch.quantityRemaining}
                  </td>

                  <td className="px-4 py-3">
                    {batch.warehouse.name}
                  </td>

                  <td className="px-4 py-3">
                    {batch.supplier?.name ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    {batch.isRecalled
                      ? "Recalled"
                      : batch.expiryStatus ===
                          "EXPIRED"
                        ? "Expired"
                        : batch.expiryStatus ===
                            "EXPIRING"
                          ? "Expiring soon"
                          : "Active"}
                  </td>
                </tr>
              ))}

              {batches.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
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
    </div>
  );
}