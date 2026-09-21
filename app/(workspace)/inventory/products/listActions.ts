"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productService } from "@/lib/inventory/productService";
import { inventoryService } from "@/lib/inventory/inventoryService";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";

export async function getProductsAction() {
  const business = await getCurrentBusiness();

  const userId =
    await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "inventory.read",
  );

  return productService.listProducts(business.id);
}

export async function getArchivedProductsAction() {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "inventory.read",
);

  return productService.listArchivedProducts(
    business.id,
  );
}

export async function searchProductsAction(
  query: string,
) {
  const business = await getCurrentBusiness();
  const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "inventory.read",
);

  return productService.searchProducts(
    business.id,
    query,
  );
}

export async function getProductStockAction(
  productId: string,
) {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "inventory.read",
);

  return inventoryService.listBalances(
    business.id,
    productId,
  );
}

export async function getAllInventoryBalancesAction() {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "inventory.read",
);

  return inventoryService.listBalances(
    business.id,
  );
}