"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productService } from "@/lib/inventory/productService";
import { productCategoryService } from "@/lib/inventory/productCategoryService";
import type { CreateProductInput } from "@/lib/inventory/productRepository";
import type { CreateProductCategoryInput } from "@/lib/inventory/productCategoryRepository";

export async function createServiceAction(
  input: Omit<
    CreateProductInput,
    "businessId" | "type" | "trackInventory"
  >,
) {
  const business = await getCurrentBusiness();

  return productService.createProduct({
    ...input,
    businessId: business.id,
    type: "SERVICE",
    trackInventory: false,
  });
}

export async function getServiceDefaultsAction() {
  const business = await getCurrentBusiness();

  return {
    currency: business.baseCurrency,
  };
}

export async function getServicesAction() {
  const business = await getCurrentBusiness();

  return productService.listServices(
    business.id,
  );
}

export async function getServiceCategoriesAction() {
  const business = await getCurrentBusiness();

  return productCategoryService.listCategories(
    business.id,
  );
}

export async function getAllServiceCategoriesAction() {
  const business = await getCurrentBusiness();

  return productCategoryService.listAllCategories(
    business.id,
  );
}

export async function createServiceCategoryAction(
  input: Omit<
    CreateProductCategoryInput,
    "businessId"
  >,
) {
  const business = await getCurrentBusiness();

  return productCategoryService.createCategory({
    ...input,
    businessId: business.id,
  });
}

export async function updateServiceCategoryAction(
  categoryId: string,
  input: {
    name?: string;
    description?: string;
    isActive?: boolean;
  },
) {
  const business = await getCurrentBusiness();

  return productCategoryService.updateCategory(
    business.id,
    categoryId,
    input,
  );
}

export async function getServicesByCategoryAction(
  categoryId: string,
) {
  const business = await getCurrentBusiness();

  return productService.listServicesByCategory(
    business.id,
    categoryId,
  );
}