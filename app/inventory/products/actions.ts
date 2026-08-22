"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productService } from "@/lib/inventory/productService";
import type { CreateProductInput } from "@/lib/inventory/productRepository";

export async function createProductAction(
  input: Omit<CreateProductInput, "businessId">,
) {
  const business = await getCurrentBusiness();

  return productService.createProduct({
    ...input,
    businessId: business.id,
  });
}

export async function getProductDefaultsAction() {
  const business = await getCurrentBusiness();

  return {
    currency: business.baseCurrency,
  };
}

export async function updateProductAction(
  productId: string,
  input: Omit<CreateProductInput, "businessId">,
) {
  const business = await getCurrentBusiness();

  return productService.updateProduct(
    business.id,
    productId,
    input,
  );
}