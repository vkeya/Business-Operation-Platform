import {
  restaurantMenuRepository,
  type CreateRestaurantMenuInput,
  type CreateRestaurantMenuItemInput,
} from "./restaurantMenuRepository";
import { productRepository } from "@/lib/inventory/productRepository";

export const restaurantMenuService = {
  async createMenu(
    input: CreateRestaurantMenuInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.name.trim()) {
      throw new Error(
        "Menu name is required.",
      );
    }

    return restaurantMenuRepository.createMenu({
      ...input,
      name: input.name.trim(),
      description:
        input.description?.trim() || undefined,
    });
  },

  async listMenus(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return restaurantMenuRepository.listMenus(
      businessId,
    );
  },
  
    async findMenuById(
    businessId: string,
    menuId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!menuId) {
      throw new Error(
        "Menu is required.",
      );
    }

    const menu =
      await restaurantMenuRepository.findMenuById(
        businessId,
        menuId,
      );

    if (!menu) {
      throw new Error(
        "Menu not found.",
      );
    }

    return menu;
  },

  async createMenuItem(
    input: CreateRestaurantMenuItemInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.menuId) {
      throw new Error(
        "Menu is required.",
      );
    }
	
	    if (input.productId) {
      const product =
        await productRepository.findById(
          input.businessId,
          input.productId,
        );

      if (!product) {
        throw new Error(
          "Selected product was not found in this business.",
        );
      }
    }

    if (!input.name.trim()) {
      throw new Error(
        "Menu item name is required.",
      );
    }

    if (input.sellingPrice < 0) {
      throw new Error(
        "Menu item price cannot be negative.",
      );
    }

    if (!input.currency.trim()) {
      throw new Error(
        "Menu item currency is required.",
      );
    }

    if (
      input.displayOrder !== undefined &&
      input.displayOrder < 0
    ) {
      throw new Error(
        "Menu item display order cannot be negative.",
      );
    }

    return restaurantMenuRepository.createMenuItem({
      ...input,
      name: input.name.trim(),
      description:
        input.description?.trim() || undefined,
      currency: input.currency.trim(),
    });
  },

  async listMenuItems(
    businessId: string,
    menuId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!menuId) {
      throw new Error(
        "Menu is required.",
      );
    }

    return restaurantMenuRepository.listMenuItems(
      businessId,
      menuId,
    );
  },
};