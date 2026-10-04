"use server";

import { getAuthenticatedUserId } from "@/lib/auth/auth";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { pharmacyBatchRecallService } from "@/lib/pharmacy/stock/pharmacyBatchRecallService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";

export async function recallPharmacyBatchAction(input: {
  pharmacyBatchId: string;
  operationId: string;
  reason: string;
}) {
  const business = await getCurrentBusiness();
  const userId = await getAuthenticatedUserId();

  await requireBusinessOperationAccess(
  userId,
  business.id,
  "pharmacy.batch_recall",
);

  if (!input.pharmacyBatchId) {
    throw new Error("Pharmacy batch is required.");
  }

  if (!input.operationId) {
    throw new Error("Operation ID is required.");
  }

  if (!input.reason.trim()) {
    throw new Error("A recall reason is required.");
  }

  return pharmacyBatchRecallService.recall({
    businessId: business.id,
    pharmacyBatchId: input.pharmacyBatchId,
    operationId: input.operationId,
    createdBy: userId,
    reason: input.reason.trim(),
  });
}