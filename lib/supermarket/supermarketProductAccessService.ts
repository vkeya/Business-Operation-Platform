import type { BusinessType } from "@/types";
import { requireSupermarketBusiness } from "@/lib/supermarket/supermarketAccessService";

export function requireSupermarketProductAccess(
  businessType: BusinessType,
) {
  requireSupermarketBusiness(businessType);
}
