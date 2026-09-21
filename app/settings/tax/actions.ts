"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getAuthenticatedUserId } from "@/lib/auth/auth";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import {
  taxConfigurationService,
  type TaxConfiguration,
} from "@/lib/tax/taxConfigurationService";

export async function getTaxConfigurationAction(): Promise<TaxConfiguration> {
  const business = await getCurrentBusiness();
  const userId = await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "business.read",
  );

  return taxConfigurationService.get(business.id);
}

export async function updateTaxConfigurationAction(
  input: TaxConfiguration,
): Promise<TaxConfiguration> {
  const business = await getCurrentBusiness();
  const userId = await getAuthenticatedUserId();

  await requireBusinessPermission(
    userId,
    business.id,
    "business.update",
  );

  return taxConfigurationService.update(
    business.id,
    input,
  );
}