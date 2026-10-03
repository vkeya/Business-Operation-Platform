import { prisma } from "@/lib/database/prisma";

import {
  productService,
} from "@/lib/inventory/productService";

import {
  inventoryRepository,
} from "@/lib/inventory/inventoryRepository";

export interface PosProduct {
  productId: string;
  name: string;
  sku: string;
  barcode?: string | null;
  pharmacyProduct?: {
    medicineType:
      | "MEDICINE"
      | "SUPPLEMENT"
      | "MEDICAL_DEVICE"
      | "PERSONAL_CARE"
      | "OTHER";
    prescriptionType:
      | "OTC"
      | "PRESCRIPTION"
      | "CONTROLLED";
    activeIngredient?: string | null;
    strength?: string | null;
    dosageForm?: string | null;
    routeOfAdministration?: string | null;
    manufacturer?: string | null;
    status:
      | "ACTIVE"
      | "DISCONTINUED"
      | "RECALLED";
  } | null;
  category?: {
  id: string;
  name: string;
} | null;

  type: "PRODUCT" | "SERVICE";

  unit: string;
  currency: string;

  sellingPrice: number;
  taxRate?: number | null;

  trackInventory: boolean;

  availableQuantity: number;

  sellingUnits: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    sellingPrice: number;
  }>;
}

type ProductSearchResult = Awaited<
  ReturnType<typeof productService.searchProducts>
>[number];

function toPosProduct(
  product: ProductSearchResult,
  availableQuantity = 0,
): PosProduct {
  return {
    productId: product.id,
    name: product.name,
    sku: product.sku,
    
	pharmacyProduct: product.pharmacyProduct
  ? {
      medicineType:
        product.pharmacyProduct.medicineType,
      prescriptionType:
        product.pharmacyProduct.prescriptionType,
      activeIngredient:
        product.pharmacyProduct.activeIngredient,
      strength:
        product.pharmacyProduct.strength,
      dosageForm:
        product.pharmacyProduct.dosageForm,
      routeOfAdministration:
        product.pharmacyProduct.routeOfAdministration,
      manufacturer:
        product.pharmacyProduct.manufacturer,
      status:
        product.pharmacyProduct.status,
    }
  : null,
    barcode: product.barcode,
	category: product.category
  ? {
      id: product.category.id,
      name: product.category.name,
    }
  : null,

    type: product.type,

    unit: product.unit,
    currency: product.currency,

    sellingPrice: product.sellingPrice,
    taxRate: product.taxRate,

    trackInventory:
      product.trackInventory,

    availableQuantity,

    sellingUnits:
      product.sellingUnits ?? [],
  };
}

export const posProductService = {
  async search(
    businessId: string,
    warehouseId: string,
    query: string,
  ): Promise<PosProduct[]> {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!warehouseId) {
      throw new Error(
        "Warehouse is required.",
      );
    }

    const products =
      await productService.searchProducts(
        businessId,
        query,
      );

    const balances =
      await inventoryRepository.listBalances(
        businessId,
        undefined,
        warehouseId,
      );

    const balanceByProduct =
      new Map(
        balances.map((balance) => [
          balance.productId,
          balance.quantity,
        ]),
      );

    return products.map((product) =>
      toPosProduct(
        product,
        balanceByProduct.get(
          product.id,
        ) ?? 0,
      ),
    );
  },

  async findByBarcode(
    businessId: string,
    warehouseId: string,
    barcode: string,
  ): Promise<PosProduct | null> {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!warehouseId) {
      throw new Error(
        "Warehouse is required.",
      );
    }

    const searchBarcode =
      barcode.trim();

    if (!searchBarcode) {
      throw new Error(
        "Barcode is required.",
      );
    }

    const product =
      await productService.findProductByBarcode(
        businessId,
        searchBarcode,
      );

    if (!product) {
      return null;
    }

    const balance =
      await inventoryRepository.getBalance(
        businessId,
        product.id,
        warehouseId,
      );

    return toPosProduct(
      product,
      balance?.quantity ?? 0,
    );
  },
};