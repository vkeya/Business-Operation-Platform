"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import { mpesaPaymentService } from "@/lib/payment/providers/mpesa/mpesaPaymentService";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import type {
  CreateSalePaymentInput,
} from "@/lib/payment/paymentRepository";
import {
  paymentService,
} from "@/lib/payment/paymentService";
import {
  saleService,
  type CreateSaleServiceInput,
} from "@/lib/sales/saleService";

export async function createSaleAction(
  input: Omit<
  CreateSaleServiceInput,
  | "businessId"
  | "createdBy"
>,
) {
  const business =
  await getCurrentBusiness();

const userId =
  await getAuthenticatedUserId();

  await requireBusinessPermission(
  userId,
  business.id,
  "sales.manage",
);

return saleService.create({
  ...input,
  businessId: business.id,
  createdBy: userId,
});
}

export async function getSalesAction() {
  const business =
    await getCurrentBusiness();

	const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "sales.read",
);

  return saleService.list(
    business.id,
  );
}

export async function getSaleAction(
  saleId: string,
) {
  const business =
    await getCurrentBusiness();

	const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "sales.read",
);

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

	const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "sales.read",
);

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
    | "CANCELLED"
	| "REVERSED",
) {
  const business =
    await getCurrentBusiness();

	const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "sales.manage",
);

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

	const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "sales.manage",
);

  return saleService.cancel(
    business.id,
    saleId,
  );
}

export async function reverseSaleAction(
  saleId: string,
) {
  const business =
    await getCurrentBusiness();

	const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "sales.manage",
);

  return saleService.reverse(
    business.id,
    saleId,
  );
}

export async function completeSaleAction(
  saleId: string,
) {
  const business =
    await getCurrentBusiness();

	const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "sales.manage",
);

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

	const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "sales.read",
);

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

  const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "payments.manage",
);

return paymentService.createSalePayment({
  ...input,
  businessId: business.id,
  createdBy: userId,
});
}

export async function initiateMpesaSalePaymentAction(input: {
  saleId: string;
  amount: number;
  customerPhone: string;
}) {
  const business = await getCurrentBusiness();
  const userId = await getAuthenticatedUserId();

  await requireBusinessPermission(
  userId,
  business.id,
  "payments.manage",
);

  return mpesaPaymentService.initiateSalePayment({
    saleId: input.saleId,
    amount: input.amount,
    customerPhone: input.customerPhone,
    businessId: business.id,
    createdBy: userId,
  });
}