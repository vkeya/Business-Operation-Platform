"use server";

import { getAuthenticatedUserId } from "@/lib/auth/auth";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { pharmacyBatchTraceabilityService } from "../stock/pharmacyBatchTraceabilityService";

export async function getPharmacyBatchHistoryAction(
  pharmacyBatchId: string,
) {
  const business = await getCurrentBusiness();
  const userId = await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "pharmacy.batch_adjust",
  );

  return pharmacyBatchTraceabilityService.getHistory({
    businessId: business.id,
    pharmacyBatchId,
  });
}