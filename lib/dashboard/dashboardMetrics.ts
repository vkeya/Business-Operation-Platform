import { getAccountingMetrics } from "@/lib/accounting/dashboard/accountingMetrics";
import { saleService } from "@/lib/sales/saleService";
import { purchaseService } from "@/lib/purchase/purchaseService";
import { inventoryService } from "@/lib/inventory/inventoryService";


export async function getDashboardMetrics(
  businessId: string,
) {
  const [
    accounting,
    sales,
    purchases,
    inventory,
  ] =
    await Promise.all([
      getAccountingMetrics(
        businessId,
      ),

      saleService.list(
        businessId,
      ),

      purchaseService.listPurchases(
        businessId,
      ),

      inventoryService.listBalances(
        businessId,
      ),
    ]);


  const completedSales =
    sales.filter(
      (sale) =>
        sale.status === "COMPLETED",
    );


  const pendingPurchases =
    purchases.filter(
      (purchase) =>
        purchase.status === "DRAFT" ||
        purchase.status === "ORDERED",
    );


  const lowStockItems =
    inventory.filter(
      (item) =>
        item.quantity <=
        item.reservedQuantity,
    );


  return {
    ...accounting,

    salesCount:
      completedSales.length,

    pendingPurchases:
      pendingPurchases.length,

    lowStockItems:
      lowStockItems.length,
  };
}