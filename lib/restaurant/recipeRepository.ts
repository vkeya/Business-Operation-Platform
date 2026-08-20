import { prisma } from "@/lib/database/prisma";

export interface CreateRecipeInput {
  businessId: string;
  menuItemId: string;
  name: string;
  description?: string;
}

export interface CreateRecipeIngredientInput {
  businessId: string;
  recipeId: string;
  productId: string;
  quantity: number;
  unit: string;
}

export const recipeRepository = {
  async createRecipe(input: CreateRecipeInput) {
    return prisma.recipe.create({
      data: {
        businessId: input.businessId,
        menuItemId: input.menuItemId,
        name: input.name,
        description: input.description,
      },
    });
  },

  async findRecipeByMenuItemId(
    businessId: string,
    menuItemId: string,
  ) {
    return prisma.recipe.findFirst({
      where: {
        businessId,
        menuItemId,
      },
      include: {
        ingredients: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            product: true,
          },
        },
      },
    });
  },

  async addIngredient(
    input: CreateRecipeIngredientInput,
  ) {
    return prisma.recipeIngredient.create({
      data: {
        businessId: input.businessId,
        recipeId: input.recipeId,
        productId: input.productId,
        quantity: input.quantity,
        unit: input.unit,
      },
      include: {
        product: true,
      },
    });
  },
};