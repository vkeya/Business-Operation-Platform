import { prisma } from "@/lib/database/prisma";

export interface CreateRestaurantMenuInput {
  businessId: string;
  name: string;
  description?: string;
}

export interface CreateRestaurantMenuItemInput {
  businessId: string;
  menuId: string;
  productId?: string;
  name: string;
  description?: string;
  sellingPrice: number;
  currency: string;
  isAvailable?: boolean;
  displayOrder?: number;
}

function serializeMenuItem<
  T extends {
    sellingPrice: { toNumber(): number };
  },
>(item: T) {
  return {
    ...item,
    sellingPrice:
      item.sellingPrice.toNumber(),
  };
}

export const restaurantMenuRepository = {
  async createMenu(
    input: CreateRestaurantMenuInput,
  ) {
    return prisma.restaurantMenu.create({
      data: {
        businessId: input.businessId,
        name: input.name,
        description: input.description,
      },
    });
  },

  async listMenus(businessId: string) {
    return prisma.restaurantMenu.findMany({
      where: {
        businessId,
      },
      include: {
        items: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

    async findMenuById(
    businessId: string,
    menuId: string,
  ) {
    return prisma.restaurantMenu.findFirst({
      where: {
        id: menuId,
        businessId,
      },
      include: {
        items: true,
      },
    });
  },

  async createMenuItem(
    input: CreateRestaurantMenuItemInput,
  ) {
    const item =
      await prisma.restaurantMenuItem.create({
        data: {
          businessId: input.businessId,
          menuId: input.menuId,
          productId: input.productId,
          name: input.name,
          description: input.description,
          sellingPrice: input.sellingPrice,
          currency: input.currency,
          isAvailable:
            input.isAvailable ?? true,
          displayOrder:
            input.displayOrder ?? 0,
        },
      });

    return serializeMenuItem(item);
  },

  async listMenuItems(
    businessId: string,
    menuId: string,
  ) {
    const items =
      await prisma.restaurantMenuItem.findMany({
        where: {
          businessId,
          menuId,
        },
        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
      });

    return items.map(
      serializeMenuItem,
    );
  },

    async listAvailableMenuItems(
    businessId: string,
  ) {
    const items =
      await prisma.restaurantMenuItem.findMany({
        where: {
          businessId,
          isAvailable: true,
          menu: {
            isActive: true,
          },
        },
        include: {
          menu: true,
          product: true,
        },
        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
      });

    return items.map(
      serializeMenuItem,
    );
  },

    async findMenuItemById(
    businessId: string,
    menuItemId: string,
  ) {
    const item =
      await prisma.restaurantMenuItem.findFirst({
        where: {
          id: menuItemId,
          businessId,
        },
        include: {
          menu: true,
          product: true,
        },
      });

    return item
      ? serializeMenuItem(item)
      : null;
  },
};
