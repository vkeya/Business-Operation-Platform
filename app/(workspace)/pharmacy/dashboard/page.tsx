import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { requirePharmacyBusiness } from "@/lib/pharmacy/pharmacyAccessService";
import { pharmacyDashboardService } from "@/lib/pharmacy/dashboard/pharmacyDashboardService";
import { pharmacyExpiryRiskService } from "@/lib/pharmacy/dashboard/pharmacyExpiryRiskService";
import { pharmacyStockRiskService } from "@/lib/pharmacy/dashboard/pharmacyStockRiskService";
import { pharmacyComplianceDashboardService } from "@/lib/pharmacy/dashboard/pharmacyComplianceDashboardService";
import type { BusinessType } from "@/types";

export default async function PharmacyDashboardPage() {
  const business = await getCurrentBusiness();
  
  requirePharmacyBusiness(business.type as BusinessType);

  const summary =
    await pharmacyDashboardService.getSummary({
      businessId: business.id,
    });
	
	const expiringBatches =
     await pharmacyExpiryRiskService.getExpiringBatches({
       businessId: business.id,
       days: 30,
     });
	 
	const lowStockProducts =
     await pharmacyStockRiskService.getLowStockProducts({
       businessId: business.id,
       threshold: 10,
     });

    const outOfStockProducts =
      await pharmacyStockRiskService.getOutOfStockProducts({
        businessId: business.id,
      });
	  
	const compliance =
     await pharmacyComplianceDashboardService.getSummary({
       businessId: business.id,
     });

  const cards = [
    {
      label: "Total Batches",
      value: summary.stock.totalBatches,
    },
    {
      label: "Stock Units",
      value: summary.stock.totalQuantity,
    },
    {
      label: "Expiring ≤ 30 Days",
      value: summary.stock.expiringBatches,
    },
    {
      label: "Expired Batches",
      value: summary.stock.expiredBatches,
    },
    {
      label: "Recalled Batches",
      value: summary.stock.recalledBatches,
    },
    {
      label: "Active Prescriptions",
      value: summary.prescriptions.active,
    },
    {
      label: "Controlled Dispensing",
      value: summary.controlledDispensing.total,
    },
    {
      label: "Stock Adjustments",
      value: summary.adjustments.total,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Pharmacy Dashboard
        </h1>

        <p className="text-sm text-muted-foreground">
          Pharmacy stock, prescription and compliance
          overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border p-4"
          >
            <div className="text-sm text-muted-foreground">
              {card.label}
            </div>

            <div className="mt-2 text-2xl font-semibold">
              {card.value}
            </div>
          </div>
        ))}
      </div>
	  
	  <div className="rounded-lg border p-5">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="font-semibold">
        Expiry Risk
      </h2>

      <p className="text-sm text-muted-foreground">
        Batches expiring within the next 30 days.
      </p>
    </div>

    <div className="text-sm font-medium">
      {expiringBatches.length} batch
      {expiringBatches.length === 1 ? "" : "es"}
    </div>
  </div>
  
  <div className="grid gap-4 lg:grid-cols-2">
  <div className="rounded-lg border p-5">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-semibold">
          Low Stock
        </h2>

        <p className="text-sm text-muted-foreground">
          Pharmacy products with 10 units or fewer.
        </p>
      </div>

      <div className="text-sm font-medium">
        {lowStockProducts.length}
      </div>
    </div>
	
	<div className="space-y-4">
  <div>
    <h2 className="text-lg font-semibold">
      Compliance & Control
    </h2>

    <p className="text-sm text-muted-foreground">
      Pharmacy compliance activity and controlled-stock
      monitoring.
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">
        Recalled Batches
      </div>

      <div className="mt-2 text-2xl font-semibold">
        {compliance.recalledBatches.length}
      </div>
    </div>

    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">
        Controlled Dispensing
      </div>

      <div className="mt-2 text-2xl font-semibold">
        {compliance.controlledDispensingCount}
      </div>
    </div>

    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">
        Batch Adjustments
      </div>

      <div className="mt-2 text-2xl font-semibold">
        {compliance.adjustmentCount}
      </div>
    </div>

    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">
        Prescriptions
      </div>

      <div className="mt-2 text-2xl font-semibold">
        {compliance.prescriptionCount}
      </div>
    </div>
  </div>

  <div className="rounded-lg border p-5">
    <h3 className="font-semibold">
      Recalled Batches
    </h3>

    <div className="mt-4 overflow-x-auto">
      {compliance.recalledBatches.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No recalled batches.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="px-3 py-2 text-left">
                Product
              </th>

              <th className="px-3 py-2 text-left">
                Batch
              </th>

              <th className="px-3 py-2 text-left">
                Warehouse
              </th>

              <th className="px-3 py-2 text-right">
                Remaining
              </th>

              <th className="px-3 py-2 text-left">
                Reason
              </th>
            </tr>
          </thead>

          <tbody>
            {compliance.recalledBatches.map(
              (batch) => (
                <tr
                  key={batch.id}
                  className="border-b last:border-0"
                >
                  <td className="px-3 py-2">
                    <div className="font-medium">
                      {batch.pharmacyProduct.product.name}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {batch.pharmacyProduct.product.sku}
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    {batch.batchNumber}
                  </td>

                  <td className="px-3 py-2">
                    {batch.warehouse.name}
                  </td>

                  <td className="px-3 py-2 text-right">
                    {batch.quantityRemaining.toString()}
                  </td>

                  <td className="px-3 py-2">
                    {batch.recallReason ?? "—"}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </div>
  </div>
</div>

    <div className="mt-4 overflow-x-auto">
      {lowStockProducts.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No low-stock pharmacy products.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="px-3 py-2 text-left">
                Product
              </th>

              <th className="px-3 py-2 text-left">
                Warehouse
              </th>

              <th className="px-3 py-2 text-right">
                Stock
              </th>
            </tr>
          </thead>

          <tbody>
            {lowStockProducts.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-0"
              >
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {item.product.name}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {item.product.sku}
                  </div>
                </td>

                <td className="px-3 py-2">
                  {item.warehouse.name}
                </td>

                <td className="px-3 py-2 text-right font-medium">
                  {item.quantity.toString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>

  <div className="rounded-lg border p-5">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-semibold">
          Out of Stock
        </h2>

        <p className="text-sm text-muted-foreground">
          Pharmacy products with no available stock.
        </p>
      </div>

      <div className="text-sm font-medium">
        {outOfStockProducts.length}
      </div>
    </div>

    <div className="mt-4 overflow-x-auto">
      {outOfStockProducts.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No pharmacy products are out of stock.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="px-3 py-2 text-left">
                Product
              </th>

              <th className="px-3 py-2 text-left">
                Warehouse
              </th>

              <th className="px-3 py-2 text-right">
                Stock
              </th>
            </tr>
          </thead>

          <tbody>
            {outOfStockProducts.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-0"
              >
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {item.product.name}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {item.product.sku}
                  </div>
                </td>

                <td className="px-3 py-2">
                  {item.warehouse.name}
                </td>

                <td className="px-3 py-2 text-right font-medium">
                  {item.quantity.toString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
</div>

  <div className="mt-4 overflow-x-auto">
    {expiringBatches.length === 0 ? (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No batches are currently within the 30-day expiry window.
      </div>
    ) : (
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="px-3 py-2 text-left">
              Product
            </th>

            <th className="px-3 py-2 text-left">
              Batch
            </th>

            <th className="px-3 py-2 text-left">
              Warehouse
            </th>

            <th className="px-3 py-2 text-left">
              Expiry
            </th>

            <th className="px-3 py-2 text-right">
              Remaining
            </th>
          </tr>
        </thead>

        <tbody>
          {expiringBatches.map((batch) => (
            <tr
              key={batch.id}
              className="border-b last:border-0"
            >
              <td className="px-3 py-2">
                <div className="font-medium">
                  {batch.pharmacyProduct.product.name}
                </div>

                <div className="text-xs text-muted-foreground">
                  {batch.pharmacyProduct.product.sku}
                </div>
              </td>

              <td className="px-3 py-2">
                {batch.batchNumber}
              </td>

              <td className="px-3 py-2">
                {batch.warehouse.name}
              </td>

              <td className="px-3 py-2">
                {batch.expiryDate.toLocaleDateString()}
              </td>

              <td className="px-3 py-2 text-right font-medium">
                {batch.quantityRemaining.toString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-5">
          <h2 className="font-semibold">
            Prescription Status
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Active</span>
              <span>{summary.prescriptions.active}</span>
            </div>

            <div className="flex justify-between">
              <span>Partially Dispensed</span>
              <span>
                {summary.prescriptions.partiallyDispensed}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Fully Dispensed</span>
              <span>
                {summary.prescriptions.fullyDispensed}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Cancelled</span>
              <span>
                {summary.prescriptions.cancelled}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Expired</span>
              <span>
                {summary.prescriptions.expired}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-5">
          <h2 className="font-semibold">
            Stock Attention
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Expiring within 30 days</span>
              <span>
                {summary.stock.expiringBatches}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Already expired</span>
              <span>
                {summary.stock.expiredBatches}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Recalled</span>
              <span>
                {summary.stock.recalledBatches}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}