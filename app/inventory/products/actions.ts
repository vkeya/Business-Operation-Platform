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

  const {
    productCategoryService,
  } = await import(
    "@/lib/inventory/productCategoryService"
  );

  const categories =
    await productCategoryService.listCategories(
      business.id,
    );

  return {
    currency: business.baseCurrency,
    categories,
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

export async function createProductSellingUnitAction(
  productId: string,
  input: {
    name: string;
    quantity: number;
    unit: string;
    sellingPrice: number;
  },
) {
  const business = await getCurrentBusiness();

  return productService.createSellingUnit(
    business.id,
    {
      productId,
      ...input,
    },
  );
}