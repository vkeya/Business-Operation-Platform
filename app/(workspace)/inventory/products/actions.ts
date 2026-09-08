"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";
import { productService } from "@/lib/inventory/productService";
import type { CreateProductInput } from "@/lib/inventory/productRepository";

export async function createProductAction(
  input: Omit<
  CreateProductInput,
  "businessId" | "sku"
>,
) {
  const business = await getCurrentBusiness();

  return productService.createProduct({
    ...input,
    businessId: business.id,
  });
}

export async function getProductDefaultsAction() {
  const business = await getCurrentBusiness();

  const {
    productCategoryService,
  } = await import(
    "@/lib/inventory/productCategoryService"
  );

  const categories =
    await productCategoryService.listCategories(
      business.id,
    );

  return {
    currency: business.baseCurrency,
    categories,
  };
}

export async function updateProductAction(
  productId: string,
  input: Omit<CreateProductInput, "businessId">,
) {
  const business = await getCurrentBusiness();

  return productService.updateProduct(
    business.id,
    productId,
    input,
  );
}

export async function createProductSellingUnitAction(
  productId: string,
  input: {
    name: string;
    quantity: number;
    unit: string;
    sellingPrice: number;
  },
) {
  const business = await getCurrentBusiness();

  return productService.createSellingUnit(
    business.id,
    {
      productId,
      ...input,
    },
  );
}

export async function deleteProductsAction(
  productIds: string[],
) {
  const business = await getCurrentBusiness();

  const ids = Array.from(
    new Set(
      productIds
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

  if (ids.length === 0) {
    throw new Error("No products selected.");
  }

  const products =
    await prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
        businessId: business.id,
      },
      select: {
        id: true,
        sku: true,
        name: true,
      },
    });

  if (products.length !== ids.length) {
    throw new Error(
      "One or more selected products were not found in the current business.",
    );
  }

  const protectedIngredients =
    await prisma.recipeIngredient.findMany({
      where: {
        productId: {
          in: ids,
        },
      },
      select: {
        productId: true,
      },
    });

  const protectedIds = new Set(
    protectedIngredients.map(
      (ingredient) => ingredient.productId,
    ),
  );

  if (protectedIds.size > 0) {
    const protectedProducts = products
      .filter((product) =>
        protectedIds.has(product.id),
      )
      .map((product) => product.sku)
      .join(", ");

    throw new Error(
      `The following products cannot be deleted because they are used in recipes: ${protectedProducts}.`,
    );
  }

  await prisma.product.deleteMany({
    where: {
      id: {
        in: ids,
      },
      businessId: business.id,
    },
  });

  return {
    deletedCount: ids.length,
  };
}

