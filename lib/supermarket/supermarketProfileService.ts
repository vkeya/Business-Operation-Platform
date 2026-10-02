import { prisma } from "@/lib/database/prisma";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireSupermarketBusiness } from "@/lib/supermarket/supermarketAccessService";
import type { BusinessType } from "@/types";

export async function getSupermarketProfile() {
  const context = await getCurrentBusinessContext();

  requireSupermarketBusiness(
  context.business.type as BusinessType,
);

  return prisma.supermarketProfile.findUnique({
    where: {
      businessId: context.business.id,
    },
  });
}

export async function ensureSupermarketProfile() {
  const context = await getCurrentBusinessContext();

  requireSupermarketBusiness(
  context.business.type as BusinessType,
);

  return prisma.supermarketProfile.upsert({
    where: {
      businessId: context.business.id,
    },
    create: {
      businessId: context.business.id,
    },
    update: {},
  });
}

export async function updateSupermarketProfile(input: {
  storeType?: string;
  weightedProductsEnabled?: boolean;
  batchTrackingEnabled?: boolean;
  expiryTrackingEnabled?: boolean;
  loyaltyEnabled?: boolean;
  promotionsEnabled?: boolean;
  autoReplenishmentEnabled?: boolean;
  isActive?: boolean;
}) {
  const context = await getCurrentBusinessContext();

  requireSupermarketBusiness(
  context.business.type as BusinessType,
);

  return prisma.supermarketProfile.upsert({
    where: {
      businessId: context.business.id,
    },
    create: {
      businessId: context.business.id,
      ...input,
    },
    update: {
      ...input,
    },
  });
}