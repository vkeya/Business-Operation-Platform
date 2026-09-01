"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productService } from "@/lib/inventory/productService";
import { inventoryService } from "@/lib/inventory/inventoryService";

export async function getProductsAction() {
  const business = await getCurrentBusiness();

  return productService.listProducts(business.id);
}

export async function searchProductsAction(
  query: string,
) {
  const business = await getCurrentBusiness();

  return productService.searchProducts(
    business.id,
    query,
  );
}

export async function getProductStockAction(
  productId: string,
) {
  const business = await getCurrentBusiness();

  return inventoryService.listBalances(
    business.id,
    productId,
  );
}

export async function getAllInventoryBalancesAction() {
  const business = await getCurrentBusiness();

  return inventoryService.listBalances(
    business.id,
  );
}