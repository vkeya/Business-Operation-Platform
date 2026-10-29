
import { prisma } from "@/lib/database/prisma";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";

function getHospitalBusinessId(
  businessId: string,
  businessType: BusinessType,
): string {
  requireHospitalBusiness(businessType);

  return businessId;
}

/**
 * Retrieve the hospital profile for the current business.
 * Returns null when the profile has not yet been created.
 */
export async function getHospitalProfile() {
  const context = await getCurrentBusinessContext();

  const businessId = getHospitalBusinessId(
    context.business.id,
    context.business.type as BusinessType,
  );

  return prisma.hospitalProfile.findUnique({
    where: {
      businessId,
    },
  });
}

/**
 * Create a default hospital profile if one does not exist.
 */
export async function ensureHospitalProfile() {
  const context = await getCurrentBusinessContext();

  const businessId = getHospitalBusinessId(
    context.business.id,
    context.business.type as BusinessType,
  );

  return prisma.hospitalProfile.upsert({
    where: {
      businessId,
    },
    create: {
      businessId,
    },
    update: {},
  });
}

/**
 * Update only the explicitly supported hospital profile fields.
 * The businessId is always taken from the authenticated context.
 */
export async function updateHospitalProfile(input: {
  facilityName?: string | null;
  facilityType?: string | null;
  registrationNumber?: string | null;
  licenseNumber?: string | null;
  country?: string;
  county?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
}) {
  const context = await getCurrentBusinessContext();

  const businessId = getHospitalBusinessId(
    context.business.id,
    context.business.type as BusinessType,
  );

  return prisma.hospitalProfile.upsert({
    where: {
      businessId,
    },
    create: {
      businessId,
      ...input,
    },
    update: {
      ...input,
    },
  });
}
