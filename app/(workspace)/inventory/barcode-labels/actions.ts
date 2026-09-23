"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { listBarcodeLabelProducts } from "@/lib/barcode/labels/barcodeLabelService";

export async function searchBarcodeLabelProductsAction(
  warehouseId: string,
  search?: string,
  categoryId?: string,
) {
  const business = await getCurrentBusiness();

  return listBarcodeLabelProducts({
    businessId: business.id,
    warehouseId,
    search,
    categoryId,
  });
} 