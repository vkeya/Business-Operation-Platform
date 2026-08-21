"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  saleService,
} from "@/lib/sales/saleService";
import type {
  CreateSaleInput,
} from "@/lib/sales/saleRepository";
import type {
  CreateSalePaymentInput,
} from "@/lib/payment/paymentRepository";
import {
  paymentService,
} from "@/lib/payment/paymentService";

export async function createSaleAction(
  input: Omit<
    CreateSaleInput,
    "businessId" | "createdBy"
  >,
) {
  const business =
    await getCurrentBusiness();

  return saleService.create({
    ...input,
    businessId: business.id,
    createdBy: business.id,
  });
}

export async function getSalesAction() {
  const business =
    await getCurrentBusiness();

  return saleService.list(
    business.id,
  );
}

export async function getSaleAction(
  saleId: string,
) {
  const business =
    await getCurrentBusiness();

  return saleService.findById(
    business.id,
    saleId,
  );
}

export async function getSaleByReferenceAction(
  referenceNumber: string,
) {
  const business =
    await getCurrentBusiness();

  return saleService.findByReference(
    business.id,
    referenceNumber,
  );
}

export async function updateSaleStatusAction(
  saleId: string,
  status:
    | "DRAFT"
    | "COMPLETED"
    | "CANCELLED",
) {
  const business =
    await getCurrentBusiness();

  return saleService.updateStatus(
    business.id,
    saleId,
    status,
  );
}

export async function cancelSaleAction(
  saleId: string,
) {
  const business =
    await getCurrentBusiness();

  return saleService.cancel(
    business.id,
    saleId,
  );
}

export async function completeSaleAction(
  saleId: string,
) {
  const business =
    await getCurrentBusiness();

  return saleService.updateStatus(
    business.id,
    saleId,
    "COMPLETED",
  );
}

export async function getSalePaymentsAction(
  saleId: string,
) {
  const business =
    await getCurrentBusiness();

  return paymentService.listSalePayments(
    business.id,
    saleId,
  );
}

export async function createSalePaymentAction(
  input: Omit<
    CreateSalePaymentInput,
    "businessId" | "createdBy"
  >,
) {
  const business =
    await getCurrentBusiness();

  return paymentService.createSalePayment({
    ...input,
    businessId: business.id,
    createdBy: business.id,
  });
}