"use server";

import {
  getCurrentBusinessContext,
} from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";
import { productService } from "@/lib/inventory/productService";
import { supplierService } from "@/lib/supplier/supplierService";
import {
  purchaseService,
} from "@/lib/purchase/purchaseService";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import type {
  CreatePurchaseInput,
} from "@/lib/purchase/purchaseRepository";

import type {
  CreatePurchasePaymentInput,
} from "@/lib/payment/paymentRepository";
import {
  paymentService,
} from "@/lib/payment/paymentService";
import { Prisma } from "@/generated/prisma/client";
import {
  taxConfigurationService,
} from "@/lib/tax/taxConfigurationService";

export async function createPurchaseAction(
  input: Omit<
  CreatePurchaseInput,
  | "businessId"
  | "createdBy"
  | "referenceNumber"
> & {
  operationId: string;
},
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessOperationAccess(
  context.user.id,
  context.business.id,
  "purchases.manage",
);

  return purchaseService.createPurchase({
    ...input,
    businessId:
      context.business.id,
    createdBy:
      context.user.id,
  });
}

export async function getPurchasesAction() {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "purchases.read",
);

  return purchaseService.listPurchases(
    context.business.id,
  );
}

export async function getPurchaseByReferenceAction(
  referenceNumber: string,
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "purchases.read",
);

  return purchaseService.findPurchaseByReference(
    context.business.id,
    referenceNumber,
  );
}

export async function getPurchaseByIdAction(
  purchaseId: string,
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "purchases.read",
);

  return purchaseService.findPurchaseById(
    context.business.id,
    purchaseId,
  );
}

export async function getPurchasePharmacyItemsAction(
  purchaseId: string,
) {
  const context =
    await getCurrentBusinessContext();

  await requireBusinessPermission(
    context.user.id,
    context.business.id,
    "purchases.read",
  );

  if (!purchaseId) {
    throw new Error("Purchase is required.");
  }

  const purchase =
    await prisma.purchase.findFirst({
      where: {
        id: purchaseId,
        businessId: context.business.id,
      },
      select: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            unitCost: true,
          },
        },
      },
    });

  if (!purchase) {
    throw new Error("Purchase not found.");
  }

  const productIds = purchase.items.map(
    (item) => item.productId,
  );

  if (productIds.length === 0) {
    return [];
  }

  const [products, pharmacyProducts] =
    await Promise.all([
      prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
          businessId: context.business.id,
        },
        select: {
          id: true,
          name: true,
          sku: true,
        },
      }),

      prisma.pharmacyProduct.findMany({
        where: {
          productId: {
            in: productIds,
          },
        },
        select: {
          productId: true,
          id: true,
          status: true,
        },
      }),
    ]);

  const productMap = new Map(
    products.map((product) => [
      product.id,
      product,
    ]),
  );

  const pharmacyProductMap = new Map(
    pharmacyProducts.map((product) => [
      product.productId,
      product,
    ]),
  );

  return purchase.items.map((item) => {
    const product =
      productMap.get(item.productId);

    if (!product) {
      throw new Error(
        `Product ${item.productId} was not found.`,
      );
    }

    const pharmacyProduct =
      pharmacyProductMap.get(item.productId);

    return {
      purchaseItemId: item.id,
      productId: item.productId,
      productName: product.name,
      sku: product.sku,
	  quantity: item.quantity.toNumber(),
      unitCost: item.unitCost.toNumber(),
      isPharmacyProduct:
        Boolean(pharmacyProduct),
      pharmacyProductStatus:
        pharmacyProduct?.status ?? null,
    };
  });
}

export async function getPurchaseDefaultsAction() {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "purchases.read",
);

  const [
  suppliers,
  products,
  warehouses,
  taxConfiguration,
] = await Promise.all([
  supplierService.listSuppliers(
    context.business.id,
  ),

  productService.listProducts(
    context.business.id,
  ),

  prisma.warehouse.findMany({
    where: {
      businessId:
        context.business.id,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  }),

  taxConfigurationService.get(
    context.business.id,
  ),
]);

  return {
  currency:
    context.business.baseCurrency,

  suppliers,

  products,

  warehouses,

  taxConfiguration,
};
}

export async function orderPurchaseAction(
  purchaseId: string,
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessOperationAccess(
  context.user.id,
  context.business.id,
  "purchases.manage",
);

  return purchaseService.orderPurchase(
    context.business.id,
    purchaseId,
  );
}

export async function receivePurchaseAction(
  purchaseId: string,
  pharmacyBatches: Array<{
    purchaseItemId: string;
    productId: string;
    productName: string;
    batchNumber: string;
    expiryDate: string;
    manufacturingDate: string;
    quantity: number;
    unitCost: number;
  }> = [],
) {
  const context =
    await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
  context.user.id,
  context.business.id,
  "purchases.manage",
);

  return purchaseService.receivePurchase(
    context.business.id,
    purchaseId,
    pharmacyBatches.map((batch) => ({
      purchaseItemId: batch.purchaseItemId,
      productId: batch.productId,
      batchNumber: batch.batchNumber,
      expiryDate: new Date(batch.expiryDate),
      manufacturingDate:
        batch.manufacturingDate
          ? new Date(batch.manufacturingDate)
          : undefined,
      quantity: new Prisma.Decimal(batch.quantity),
      unitCost: new Prisma.Decimal(batch.unitCost),
    })),
  );
}

export async function cancelPurchaseAction(
  purchaseId: string,
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessOperationAccess(
  context.user.id,
  context.business.id,
  "purchases.manage",
);

  return purchaseService.cancelPurchase(
    context.business.id,
    purchaseId,
  );
}

export async function getPurchasePaymentsAction(
  purchaseId: string,
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "purchases.read",
);

  return paymentService.listPurchasePayments(
    context.business.id,
    purchaseId,
  );
}

export async function createPurchasePaymentAction(
  input: Omit<
    CreatePurchasePaymentInput,
    "businessId" | "createdBy"
  >,
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessOperationAccess(
  context.user.id,
  context.business.id,
  "purchases.manage",
);

  return paymentService.createPurchasePayment({
    ...input,
    businessId:
      context.business.id,
    createdBy:
      context.user.id,
  });
}