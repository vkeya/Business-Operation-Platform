"use server";

import { getAuthenticatedUserId } from "@/lib/auth/auth";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import {
  mpesaConfigurationService,
  type SaveMpesaConfigurationInput,
} from "@/lib/payment/providers/mpesa/mpesaConfigurationService";

export async function saveMpesaConfigurationAction(
  input: Omit<SaveMpesaConfigurationInput, "businessId">
) {
  await getAuthenticatedUserId();

  const business = await getCurrentBusiness();

  return mpesaConfigurationService.save({
    ...input,
    businessId: business.id,
  });
}

export async function getMpesaConfigurationAction() {
  await getAuthenticatedUserId();

  const business = await getCurrentBusiness();

  return mpesaConfigurationService.getByBusinessId(business.id);
}

export async function deactivateMpesaConfigurationAction() {
  await getAuthenticatedUserId();

  const business = await getCurrentBusiness();

  return mpesaConfigurationService.deactivate(business.id);
}

export async function verifyMpesaConfigurationAction() {
  await getAuthenticatedUserId();

  const business = await getCurrentBusiness();

  return mpesaConfigurationService.verify(
    business.id
  );
}