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
import type {
  CreatePurchaseInput,
} from "@/lib/purchase/purchaseRepository";
import type {
  CreatePurchasePaymentInput,
} from "@/lib/payment/paymentRepository";
import {
  paymentService,
} from "@/lib/payment/paymentService";

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

	await requireBusinessPermission(
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

export async function getPurchaseDefaultsAction() {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "purchases.read",
);

  const [suppliers, products, warehouses] =
    await Promise.all([
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
    ]);

  return {
    currency:
      context.business.baseCurrency,
    suppliers,
    products,
    warehouses,
  };
}

export async function orderPurchaseAction(
  purchaseId: string,
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessPermission(
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
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "purchases.manage",
);

  return purchaseService.receivePurchase(
    context.business.id,
    purchaseId,
  );
}

export async function cancelPurchaseAction(
  purchaseId: string,
) {
  const context =
    await getCurrentBusinessContext();

	await requireBusinessPermission(
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

	await requireBusinessPermission(
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