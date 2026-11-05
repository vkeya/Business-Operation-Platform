"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { inventoryService } from "@/lib/inventory/inventoryService";
import { prisma } from "@/lib/database/prisma";
import { productService } from "@/lib/inventory/productService";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
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
   containerType?:
    | "BOTTLE"
    | "KEG"
    | "CAN"
    | "JAR"
    | "OTHER";
  containerCapacityQuantity?: number;
  containerUnit?: string;
  notes?: string;

  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
}) {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

  await requireBusinessOperationAccess(
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
	containerType: input.containerType,
    containerCapacityQuantity:
      input.containerCapacityQuantity,
    containerUnit: input.containerUnit,
    notes: input.notes,

	batchNumber: input.batchNumber,
    manufacturingDate: input.manufacturingDate,
    expiryDate: input.expiryDate,
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
  containerIds?: string[];
  currency: string;
  notes?: string;
}) {
  const business =
    await getCurrentBusiness();

	const userId =
  await getAuthenticatedUserId();

  await requireBusinessOperationAccess(
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
	containerIds: input.containerIds,
    currency: input.currency,
    createdBy: userId,
    notes: input.notes,
  });
}

export async function getTransferableContainersAction(
  productId: string,
  warehouseId: string,
) {
  const business = await getCurrentBusiness();

  const userId = await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "inventory.read",
  );

  if (!productId || !warehouseId) {
    throw new Error(
      "Product and source warehouse are required.",
    );
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      businessId: business.id,
      inventoryMode: "LIQUID",
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    throw new Error(
      "Liquid inventory product not found.",
    );
  }

  const containers =
    await prisma.inventoryContainer.findMany({
      where: {
        businessId: business.id,
        productId,
        warehouseId,
        status: {
          in: ["SEALED", "OPEN"],
        },
        remainingQuantity: {
          gt: 0,
        },
      },
      select: {
        id: true,
        containerType: true,
        status: true,
        remainingQuantity: true,
        unit: true,
      },
      orderBy: [
        { receivedAt: "asc" },
        { createdAt: "asc" },
      ],
    });

  return containers.map((container) => ({
    id: container.id,
    containerType: container.containerType,
    status: container.status as "SEALED" | "OPEN",
    remainingQuantity: container.remainingQuantity.toNumber(),
    unit: container.unit,
  }));
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

  await requireBusinessOperationAccess(
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

