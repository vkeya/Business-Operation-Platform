"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { productService } from "@/lib/inventory/productService";

export async function getProductsAction() {
  const business = await getCurrentBusiness();

  return productService.listProducts(business.id);
}

export async function searchProductsAction(
  query: string,
) {
  const business = await getCurrentBusiness();

  return productService.searchProducts(
    business.id,
    query,
  );
}