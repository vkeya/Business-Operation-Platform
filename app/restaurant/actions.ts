"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { restaurantMenuService } from "@/lib/restaurant/restaurantMenuService";
import type {
  CreateRestaurantMenuInput,
  CreateRestaurantMenuItemInput,
} from "@/lib/restaurant/restaurantMenuRepository";
import { productService } from "@/lib/inventory/productService";

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