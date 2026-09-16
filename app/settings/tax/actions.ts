"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  taxConfigurationService,
  type TaxConfiguration,
} from "@/lib/tax/taxConfigurationService";

export async function getTaxConfigurationAction(): Promise<TaxConfiguration> {
  const business = await getCurrentBusiness();

  return taxConfigurationService.get(business.id);
}

export async function updateTaxConfigurationAction(
  input: TaxConfiguration,
): Promise<TaxConfiguration> {
  const business = await getCurrentBusiness();

  return taxConfigurationService.update(business.id, input);
}