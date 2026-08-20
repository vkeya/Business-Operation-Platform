import {
  recipeRepository,
  type CreateRecipeInput,
  type CreateRecipeIngredientInput,
} from "./recipeRepository";
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
};