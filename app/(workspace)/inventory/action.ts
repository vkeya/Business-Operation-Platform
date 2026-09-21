"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { inventoryService } from "@/lib/inventory/inventoryService";
import { prisma } from "@/lib/database/prisma";
import { productService } from "@/lib/inventory/productService";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";

export async function getInventoryBalancesAction(
  productId?: string,
  warehouseId?: string,
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
    warehouseId,
  );
}

export async function getInventoryMovementsAction(
  productId?: string,
  warehouseId?: string,
  movementType?:
    | "RECEIPT"
    | "SALE"
    | "RETURN"
    | "ADJUSTMENT"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "DAMAGE"
    | "EXPIRY",
  fromDate?: Date,
  toDate?: Date,
) {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

  await requireBusinessPermission(
  userId,
  business.id,
  "inventory.read",
);

  return inventoryService.listMovements(
  business.id,
  productId,
  warehouseId,
  movementType,
  fromDate,
  toDate,
);
}

export async function receiveStockAction(input: {
	operationId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost: number;
  currency: string;
  notes?: string;
}) {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

  await requireBusinessPermission(
  userId,
  business.id,
  "inventory.manage",
);

  return inventoryService.receiveStock({
	  operationId: input.operationId,
    businessId: business.id,
    productId: input.productId,
    warehouseId: input.warehouseId,
    quantity: input.quantity,
    unitCost: input.unitCost,
    currency: input.currency,
    createdBy: userId,
    notes: input.notes,
  });
}

export async function getInventorySetupAction() {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "inventory.read",
);


  const [products, warehouses] =
    await Promise.all([
      productService.listProducts(business.id),
      prisma.warehouse.findMany({
        where: {
          businessId: business.id,
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

  return {
    products,
    warehouses,
  };
}

export async function transferStockAction(input: {
	operationId: string;
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  currency: string;
  notes?: string;
}) {
  const business =
    await getCurrentBusiness();

	const userId =
  await getAuthenticatedUserId();

  await requireBusinessPermission(
  userId,
  business.id,
  "inventory.manage",
);

  return inventoryService.transferStock({
    businessId: business.id,
	 operationId: input.operationId,
    productId: input.productId,
    fromWarehouseId:
      input.fromWarehouseId,
    toWarehouseId:
      input.toWarehouseId,
    quantity: input.quantity,
    currency: input.currency,
    createdBy: userId,
    notes: input.notes,
  });
}

export async function adjustStockAction(input: {
  operationId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost?: number;
  currency: string;
  notes?: string;
}) {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

  await requireBusinessPermission(
  userId,
  business.id,
  "inventory.manage",
);

  return inventoryService.adjustStock({
  businessId: business.id,
  operationId: input.operationId,
    productId: input.productId,
    warehouseId: input.warehouseId,
    quantity: input.quantity,
    unitCost: input.unitCost,
    currency: input.currency,
    createdBy: userId,
    notes: input.notes,
  });
}

