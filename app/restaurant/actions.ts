"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { restaurantMenuService } from "@/lib/restaurant/restaurantMenuService";
import type {
  CreateRestaurantMenuInput,
  CreateRestaurantMenuItemInput,
} from "@/lib/restaurant/restaurantMenuRepository";
import { productService } from "@/lib/inventory/productService";
import { recipeService } from "@/lib/restaurant/recipeService";
import type {
  CreateRecipeInput,
  CreateRecipeIngredientInput,
} from "@/lib/restaurant/recipeRepository";

export async function createRestaurantMenuAction(
  input: Omit<
    CreateRestaurantMenuInput,
    "businessId"
  >,
) {
  const business =
    await getCurrentBusiness();

  return restaurantMenuService.createMenu({
    ...input,
    businessId: business.id,
  });
}

export async function getRestaurantMenusAction() {
  const business =
    await getCurrentBusiness();

  return restaurantMenuService.listMenus(
    business.id,
  );
}

export async function createRestaurantMenuItemAction(
  input: Omit<
    CreateRestaurantMenuItemInput,
    "businessId"
  >,
) {
  const business =
    await getCurrentBusiness();

  return restaurantMenuService.createMenuItem({
    ...input,
    businessId: business.id,
  });
}

export async function getRestaurantMenuItemsAction(
  menuId: string,
) {
  const business =
    await getCurrentBusiness();

  return restaurantMenuService.listMenuItems(
    business.id,
    menuId,
  );
}

export async function getRestaurantMenuProductsAction() {
  const business =
    await getCurrentBusiness();

  return productService.listProducts(
    business.id,
  );
}

export async function getRestaurantMenuAction(
  menuId: string,
) {
  const business =
    await getCurrentBusiness();

  return restaurantMenuService.findMenuById(
    business.id,
    menuId,
  );
}

export async function createRestaurantRecipeAction(
  input: Omit<CreateRecipeInput, "businessId">,
) {
  const business = await getCurrentBusiness();

  if (business.type !== "restaurant") {
    throw new Error(
      "Recipe management is only available for restaurants.",
    );
  }

  return recipeService.createRecipe({
    ...input,
    businessId: business.id,
  });
}

export async function getRestaurantRecipeAction(
  menuItemId: string,
) {
  const business = await getCurrentBusiness();

  if (business.type !== "restaurant") {
    throw new Error(
      "Recipe management is only available for restaurants.",
    );
  }

  return recipeService.findRecipeByMenuItemId(
    business.id,
    menuItemId,
  );
}

export async function addRestaurantRecipeIngredientAction(
  input: Omit<
    CreateRecipeIngredientInput,
    "businessId"
  >,
) {
  const business = await getCurrentBusiness();

  if (business.type !== "restaurant") {
    throw new Error(
      "Recipe management is only available for restaurants.",
    );
  }

  return recipeService.addIngredient({
    ...input,
    businessId: business.id,
  });
}

export async function consumeRestaurantRecipeStockAction(
  input: {
    menuItemId: string;
    warehouseId: string;
    saleQuantity: number;
    currency: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
  },
) {
  const business =
    await getCurrentBusiness();

  if (business.type !== "restaurant") {
    throw new Error(
      "Recipe consumption is only available for restaurants.",
    );
  }

  return recipeService.consumeRecipeStock({
    ...input,
    businessId: business.id,
    createdBy: business.id,
  });
}

export async function getRestaurantMenuItemAction(
  menuItemId: string,
) {
  const business =
    await getCurrentBusiness();

  if (business.type !== "restaurant") {
    throw new Error(
      "Menu management is only available for restaurants.",
    );
  }

  return restaurantMenuService.findMenuItemById(
    business.id,
    menuItemId,
  );
}

export async function getAvailableRestaurantMenuItemsAction() {
  const business =
    await getCurrentBusiness();

  if (business.type !== "restaurant") {
    throw new Error(
      "Menu management is only available for restaurants.",
    );
  }

  return restaurantMenuService.listAvailableMenuItems(
    business.id,
  );
}