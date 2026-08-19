"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";
import { productService } from "@/lib/inventory/productService";
import { supplierService } from "@/lib/supplier/supplierService";
import {
  purchaseService,
} from "@/lib/purchase/purchaseService";
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
    "businessId" | "createdBy"
  >,
) {
  const business = await getCurrentBusiness();

  return purchaseService.createPurchase({
    ...input,
    businessId: business.id,
    createdBy: business.id,
  });
}

export async function getPurchasesAction() {
  const business = await getCurrentBusiness();

  return purchaseService.listPurchases(
    business.id,
  );
}

export async function getPurchaseByReferenceAction(
  referenceNumber: string,
) {
  const business = await getCurrentBusiness();

  return purchaseService.findPurchaseByReference(
    business.id,
    referenceNumber,
  );
}

export async function getPurchaseByIdAction(
  purchaseId: string,
) {
  const business = await getCurrentBusiness();

  return purchaseService.findPurchaseById(
    business.id,
    purchaseId,
  );
}

export async function getPurchaseDefaultsAction() {
  const business = await getCurrentBusiness();

  const [suppliers, products, warehouses] =
    await Promise.all([
      supplierService.listSuppliers(
        business.id,
      ),
      productService.listProducts(
        business.id,
      ),
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
    currency: business.baseCurrency,
    suppliers,
    products,
    warehouses,
  };
}

export async function orderPurchaseAction(
  purchaseId: string,
) {
  const business = await getCurrentBusiness();

  return purchaseService.orderPurchase(
    business.id,
    purchaseId,
  );
}

export async function receivePurchaseAction(
  purchaseId: string,
) {
  const business = await getCurrentBusiness();

  return purchaseService.receivePurchase(
    business.id,
    purchaseId,
  );
}

export async function cancelPurchaseAction(
  purchaseId: string,
) {
  const business = await getCurrentBusiness();

  return purchaseService.cancelPurchase(
    business.id,
    purchaseId,
  );
}

 export async function getPurchasePaymentsAction(
  purchaseId: string,
) {
  const business = await getCurrentBusiness();

  return paymentService.listPurchasePayments(
    business.id,
    purchaseId,
  );
}

export async function createPurchasePaymentAction(
  input: Omit<
    CreatePurchasePaymentInput,
    "businessId" | "createdBy"
  >,
) {
  const business = await getCurrentBusiness();

  return paymentService.createPurchasePayment({
    ...input,
    businessId: business.id,
    createdBy: business.id,
  });
}