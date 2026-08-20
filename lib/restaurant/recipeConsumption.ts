import {
  convertQuantity,
  canConvertUnit,
} from "@/lib/inventory/unitConversion";
import { normalizeProductUnit } from "@/lib/inventory/normalizeProductUnit";

import type { ProductUnit } from "@/lib/inventory/productUnits";

export interface RecipeConsumptionIngredient {
  productId: string;
  quantity: number;
  unit: ProductUnit;
}

export interface InventoryProduct {
  id: string;
  unit: string;
}

export interface InventoryConsumption {
  productId: string;
  quantity: number;
  unit: ProductUnit;
}

export function calculateRecipeConsumption(
  ingredients: RecipeConsumptionIngredient[],
  products: InventoryProduct[],
  saleQuantity: number,
): InventoryConsumption[] {
  if (saleQuantity <= 0) {
    throw new Error(
      "Sale quantity must be greater than zero.",
    );
  }

  return ingredients.map((ingredient) => {
    const product = products.find(
      (item) =>
        item.id === ingredient.productId,
    );

    if (!product) {
      throw new Error(
        `Inventory product "${ingredient.productId}" was not found.`,
      );
    }

    const inventoryUnit =
  normalizeProductUnit(product.unit);

if (
  !canConvertUnit(
    ingredient.unit,
    inventoryUnit,
  )
) {
  throw new Error(
    `Cannot convert recipe unit "${ingredient.unit}" to inventory unit "${inventoryUnit}".`,
  );
}

const quantityPerSale =
  convertQuantity(
    ingredient.quantity,
    ingredient.unit,
    inventoryUnit,
  );

return {
  productId: ingredient.productId,
  quantity:
    quantityPerSale * saleQuantity,
  unit: inventoryUnit,
};
  });
}