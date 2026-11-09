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

  inventoryMode: "DISCRETE" | "LIQUID";

  sellingPrice: number;
  taxRate?: number | null;

  trackInventory: boolean;

  availableQuantity: number;

    containerSummary?: Array<{
    containerType: "BOTTLE" | "KEG" | "CAN" | "JAR" | "OTHER";
    status: "SEALED" | "OPEN";
    count: number;
    remainingQuantity: number;
    unit: string;
  }>;

  sellingUnits: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
	conversionQuantity?: number | null;
    conversionUnit?: string | null;
    sellingPrice: number;
  }>;
}

type ProductSearchResult = Awaited<
  ReturnType<typeof productService.searchProducts>
>[number];

function toPosProduct(
  product: ProductSearchResult,
  availableQuantity = 0,
  containerSummary: PosProduct["containerSummary"] = [],
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

	inventoryMode: product.inventoryMode,

    sellingPrice: product.sellingPrice,
    taxRate: product.taxRate,

    trackInventory:
      product.trackInventory,

    availableQuantity,

	containerSummary,

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

	      const liquidProductIds = products
      .filter(
        (product) =>
          product.inventoryMode === "LIQUID",
      )
      .map((product) => product.id);

    const containers =
      liquidProductIds.length > 0
        ? await prisma.inventoryContainer.findMany({
            where: {
              businessId,
              warehouseId,
              productId: {
                in: liquidProductIds,
              },
              status: {
                in: ["SEALED", "OPEN"],
              },
              remainingQuantity: {
                gt: 0,
              },
            },
          })
        : [];

    const containersByProduct =
      new Map<
        string,
        NonNullable<
          PosProduct["containerSummary"]
        >
      >();

    for (const container of containers) {
      const summary =
        containersByProduct.get(
          container.productId,
        ) ?? [];

      const existing = summary.find(
        (item) =>
          item.containerType ===
            container.containerType &&
          item.status ===
            container.status &&
          item.unit === container.unit,
      );

      if (existing) {
        existing.count += 1;
        existing.remainingQuantity +=
          container.remainingQuantity.toNumber();
      } else {
        summary.push({
          containerType:
            container.containerType,
          status: container.status as "SEALED" | "OPEN",
          count: 1,
          remainingQuantity:
            container.remainingQuantity.toNumber(),
          unit: container.unit,
        });
      }

      containersByProduct.set(
        container.productId,
        summary,
      );
    }

        return products.map((product) =>
      toPosProduct(
        product,
        balanceByProduct.get(
          product.id,
        ) ?? 0,
        containersByProduct.get(
          product.id,
        ) ?? [],
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

	      const containerSummary =
      product.inventoryMode === "LIQUID"
        ? await prisma.inventoryContainer.findMany({
            where: {
              businessId,
              productId: product.id,
              warehouseId,
              status: {
                in: ["SEALED", "OPEN"],
              },
              remainingQuantity: {
                gt: 0,
              },
            },
          })
        : [];

    return toPosProduct(
      product,
      balance?.quantity ?? 0,
    );
  },
};