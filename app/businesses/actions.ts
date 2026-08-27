"use server";

import { createBusinessService } from "@/lib/business/businessService";
import { postgresBusinessRepository } from "@/lib/business/postgresBusinessRepository";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productCategoryService } from "@/lib/inventory/productCategoryService";

const businessService = createBusinessService(
  postgresBusinessRepository,
);

export async function getBusinessesAction() {
  return businessService.listBusinesses();
}

export async function ensureCurrentBoutiqueCategoriesAction() {
  const business = await getCurrentBusiness();

  if (business.type !== "boutique") {
    throw new Error(
      "Boutique category initialization is only available for Boutique businesses.",
    );
  }

  return productCategoryService.ensureBoutiqueCategories(
    business.id,
  );
}