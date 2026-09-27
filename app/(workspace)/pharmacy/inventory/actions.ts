"use server";

import { Prisma } from "@/generated/prisma/client";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import {
  getCurrentBusiness,
} from "@/lib/business/currentBusiness";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import {
  pharmacyBatchAdjustmentService,
  type PharmacyBatchAdjustmentType,
} from "@/lib/pharmacy/stock/pharmacyBatchAdjustmentService";

export async function adjustPharmacyBatchAction(
  input: {
    operationId: string;
    pharmacyBatchId: string;
    quantity: number;
    type: PharmacyBatchAdjustmentType;
    reason: string;
    notes?: string;
  },
) {
  const business =
    await getCurrentBusiness();

  const userId =
    await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "pharmacy.batch_adjust",
  );

  if (
    !Number.isFinite(input.quantity) ||
    input.quantity <= 0
  ) {
    throw new Error(
      "Adjustment quantity must be greater than zero.",
    );
  }

  return pharmacyBatchAdjustmentService.adjust({
    businessId: business.id,
    pharmacyBatchId:
      input.pharmacyBatchId,
    quantity: new Prisma.Decimal(
      input.quantity,
    ),
    type: input.type,
    operationId: input.operationId,
    createdBy: userId,
    reason: input.reason,
    notes: input.notes,
  });
}