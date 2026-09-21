"use server";

import { createBusinessService } from "@/lib/business/businessService";
import { postgresBusinessRepository } from "@/lib/business/postgresBusinessRepository";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { productCategoryService } from "@/lib/inventory/productCategoryService";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";

const businessService = createBusinessService(
  postgresBusinessRepository,
);

export async function getBusinessesAction() {
  const user =
    await getAuthenticatedUser();

  return businessService.listBusinesses(
    user.id,
  );
}

export async function ensureCurrentBoutiqueCategoriesAction() {
  const business = await getCurrentBusiness();

  const userId =
    await getAuthenticatedUserId();

    await requireBusinessPermission(
    userId,
    business.id,
    "inventory.manage",
  );

  if (business.type !== "boutique") {
    throw new Error(
      "Boutique category initialization is only available for Boutique businesses.",
    );
  }

  return productCategoryService.ensureBoutiqueCategories(
    business.id,
  );
}