import {
  recipeRepository,
  type CreateRecipeInput,
  type CreateRecipeIngredientInput,
} from "./recipeRepository";
import {
  convertQuantity,
  canConvertUnit,
} from "@/lib/inventory/unitConversion";
import { normalizeProductUnit } from "@/lib/inventory/normalizeProductUnit";
import type { ProductUnit } from "@/lib/inventory/productUnits";
import {
  calculateRecipeConsumption,
} from "./recipeConsumption";
import { inventoryService } from "@/lib/inventory/inventoryService";

export const recipeService = {
  async createRecipe(
    input: CreateRecipeInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.menuItemId) {
      throw new Error(
        "Menu item is required.",
      );
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error(
        "Recipe name is required.",
      );
    }

    return recipeRepository.createRecipe({
      ...input,
      name,
      description:
        input.description?.trim() || undefined,
    });
  },

  async findRecipeByMenuItemId(
    businessId: string,
    menuItemId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!menuItemId) {
      throw new Error(
        "Menu item is required.",
      );
    }

    return recipeRepository.findRecipeByMenuItemId(
      businessId,
      menuItemId,
    );
  },

  async addIngredient(
    input: CreateRecipeIngredientInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.recipeId) {
      throw new Error(
        "Recipe is required.",
      );
    }

    if (!input.productId) {
      throw new Error(
        "Ingredient product is required.",
      );
    }

    if (input.quantity <= 0) {
      throw new Error(
        "Ingredient quantity must be greater than zero.",
      );
    }

    const unit = input.unit.trim();

    if (!unit) {
      throw new Error(
        "Ingredient unit is required.",
      );
    }

    return recipeRepository.addIngredient({
      ...input,
      unit,
    });
  },

  async calculateRecipeCost(input: {
    businessId: string;
    menuItemId: string;
    warehouseId: string;
  }) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.menuItemId) {
      throw new Error(
        "Menu item is required.",
      );
    }

    if (!input.warehouseId) {
      throw new Error(
        "Warehouse is required.",
      );
    }

    const recipe =
      await recipeRepository.findRecipeByMenuItemId(
        input.businessId,
        input.menuItemId,
      );

    if (!recipe) {
      throw new Error(
        "No recipe exists for this menu item.",
      );
    }

    if (recipe.ingredients.length === 0) {
      throw new Error(
        "Recipe has no ingredients.",
      );
    }

    const ingredients = [];

    let totalCost = 0;

    for (const ingredient of recipe.ingredients) {
      const balance =
        await inventoryService.getBalance(
          input.businessId,
          ingredient.productId,
          input.warehouseId,
        );

      const averageCost =
        balance?.averageCost ?? 0;

      const recipeQuantity =
        ingredient.quantity.toNumber();

      const inventoryUnit =
        normalizeProductUnit(
          ingredient.product.unit,
        );

      const recipeUnit =
        ingredient.unit as ProductUnit;

      if (
        !canConvertUnit(
          recipeUnit,
          inventoryUnit,
        )
      ) {
        throw new Error(
          `Cannot convert recipe unit "${recipeUnit}" to inventory unit "${inventoryUnit}" for product "${ingredient.product.name}".`,
        );
      }

      const inventoryQuantity =
        convertQuantity(
          recipeQuantity,
          recipeUnit,
          inventoryUnit,
        );

      const ingredientCost =
        inventoryQuantity * averageCost;

      totalCost += ingredientCost;

      ingredients.push({
  productId:
    ingredient.productId,

  productName:
    ingredient.product.name,

  quantity:
    recipeQuantity,

  unit:
    recipeUnit,

  recipeQuantity,

  recipeUnit,

  inventoryQuantity,

  inventoryUnit,

  averageCost,

  totalCost:
    ingredientCost,
});
    }

    return {
      recipeId: recipe.id,

      menuItemId:
        input.menuItemId,

      recipeName:
        recipe.name,

      warehouseId:
        input.warehouseId,

      totalCost,

      ingredients,
    };
  },

     async calculateConsumption(input: {
    businessId: string;
    menuItemId: string;
    saleQuantity: number;
  }) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.menuItemId) {
      throw new Error(
        "Menu item is required.",
      );
    }

    if (input.saleQuantity <= 0) {
      throw new Error(
        "Sale quantity must be greater than zero.",
      );
    }

    const recipe =
      await recipeRepository.findRecipeByMenuItemId(
        input.businessId,
        input.menuItemId,
      );

    if (!recipe) {
      throw new Error(
        "No recipe exists for this menu item.",
      );
    }

    if (recipe.ingredients.length === 0) {
      throw new Error(
        "Recipe has no ingredients.",
      );
    }

    const ingredients =
      recipe.ingredients.map(
        (ingredient) => ({
          productId:
            ingredient.productId,

          quantity:
            ingredient.quantity.toNumber(),

          unit: ingredient.unit as
            | "piece"
            | "kg"
            | "g"
            | "litre"
            | "ml"
            | "pack"
            | "box"
            | "bottle"
            | "carton",
        }),
      );

    const products =
      recipe.ingredients.map(
        (ingredient) => ({
          id:
            ingredient.product.id,

          unit:
            ingredient.product.unit,
        }),
      );

    return {
      recipeId: recipe.id,

      menuItemId:
        input.menuItemId,

      saleQuantity:
        input.saleQuantity,

      consumption:
        calculateRecipeConsumption(
          ingredients,
          products,
          input.saleQuantity,
        ),
    };
  },

    async consumeRecipeStock(input: {
    businessId: string;
    menuItemId: string;
    warehouseId: string;
    saleQuantity: number;
    currency: string;
    createdBy: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
  }) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.menuItemId) {
      throw new Error(
        "Menu item is required.",
      );
    }

    if (!input.warehouseId) {
      throw new Error(
        "Warehouse is required.",
      );
    }

    if (input.saleQuantity <= 0) {
      throw new Error(
        "Sale quantity must be greater than zero.",
      );
    }

    if (!input.currency) {
      throw new Error(
        "Currency is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    const result =
      await this.calculateConsumption({
        businessId: input.businessId,
        menuItemId: input.menuItemId,
        saleQuantity: input.saleQuantity,
      });

    return inventoryService.consumeStockBatch({
      businessId: input.businessId,
      warehouseId: input.warehouseId,
      currency: input.currency,
      createdBy: input.createdBy,
      referenceType:
        input.referenceType ?? "RECIPE",
      referenceId:
        input.referenceId,
      notes: input.notes,
      items: result.consumption.map(
        (item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }),
      ),
    });
  },

    async consumeSaleRecipes(input: {
    businessId: string;
    warehouseId: string;
    currency: string;
    createdBy: string;
    referenceId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
    }>;
  }) {
    if (!input.businessId) {
      throw new Error("Business context is required.");
    }

    if (!input.warehouseId) {
      throw new Error("Warehouse is required.");
    }

    if (!input.currency) {
      throw new Error("Currency is required.");
    }

    if (!input.createdBy) {
      throw new Error("User context is required.");
    }

    if (!input.referenceId) {
      throw new Error("Sale reference is required.");
    }

    if (input.items.length === 0) {
      return [];
    }

    const consumptionByProduct = new Map<
      string,
      number
    >();

    for (const item of input.items) {
      if (!item.menuItemId) {
        continue;
      }

      if (item.quantity <= 0) {
        throw new Error(
          "Menu item sale quantity must be greater than zero.",
        );
      }

      const result =
        await this.calculateConsumption({
          businessId: input.businessId,
          menuItemId: item.menuItemId,
          saleQuantity: item.quantity,
        });

      for (const consumption of result.consumption) {
        const existing =
          consumptionByProduct.get(
            consumption.productId,
          ) ?? 0;

        consumptionByProduct.set(
          consumption.productId,
          existing + consumption.quantity,
        );
      }
    }

    if (consumptionByProduct.size === 0) {
      return [];
    }

    return inventoryService.consumeStockBatch({
      businessId: input.businessId,
      warehouseId: input.warehouseId,
      currency: input.currency,
      createdBy: input.createdBy,
      referenceType: "SALE",
      referenceId: input.referenceId,
      items: Array.from(
        consumptionByProduct.entries(),
      ).map(
        ([productId, quantity]) => ({
          productId,
          quantity,
        }),
      ),
    });
  },

    async restoreSaleRecipes(input: {
    businessId: string;
    warehouseId: string;
    currency: string;
    createdBy: string;
    referenceId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
    }>;
  }) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.warehouseId) {
      throw new Error(
        "Warehouse is required.",
      );
    }

    if (!input.currency) {
      throw new Error(
        "Currency is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    if (!input.referenceId) {
      throw new Error(
        "Sale reference is required.",
      );
    }

    if (input.items.length === 0) {
      return [];
    }

    const restorationByProduct = new Map<
      string,
      number
    >();

    for (const item of input.items) {
      if (!item.menuItemId) {
        continue;
      }

      if (item.quantity <= 0) {
        throw new Error(
          "Menu item sale quantity must be greater than zero.",
        );
      }

      const result =
        await this.calculateConsumption({
          businessId: input.businessId,
          menuItemId: item.menuItemId,
          saleQuantity: item.quantity,
        });

      for (
        const consumption of result.consumption
      ) {
        const existing =
          restorationByProduct.get(
            consumption.productId,
          ) ?? 0;

        restorationByProduct.set(
          consumption.productId,
          existing + consumption.quantity,
        );
      }
    }

    if (restorationByProduct.size === 0) {
      return [];
    }

    return inventoryService.returnStockBatch({
      businessId: input.businessId,
      warehouseId: input.warehouseId,
      currency: input.currency,
      createdBy: input.createdBy,
      referenceType: "SALE_REVERSAL",
      referenceId: input.referenceId,
      items: Array.from(
        restorationByProduct.entries(),
      ).map(
        ([productId, quantity]) => ({
          productId,
          quantity,
        }),
      ),
    });
  },
};