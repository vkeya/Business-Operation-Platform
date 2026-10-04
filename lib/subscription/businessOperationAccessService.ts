import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { requireBusinessEntitlement } from "@/lib/subscription/subscriptionEntitlementService";

export async function requireBusinessOperationAccess(
  userId: string,
  businessId: string,
  permission: string,
) {
  await requireBusinessPermission(
    userId,
    businessId,
    permission,
  );

  return requireBusinessEntitlement(businessId);
}