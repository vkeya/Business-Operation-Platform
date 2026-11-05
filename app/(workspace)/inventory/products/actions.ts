"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import {
  getAuthenticatedUserId,
} from "@/lib/auth/auth";
import { productService } from "@/lib/inventory/productService";
import type { CreateProductInput } from "@/lib/inventory/productRepository";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import { SubscriptionLimitError } from "@/lib/subscription/subscriptionLimitService";

export async function createProductAction(
  input: Omit<CreateProductInput, "businessId" | "sku"> & {
    operationId: string;
  },
) {
  const business = await getCurrentBusiness();
  const userId = await getAuthenticatedUserId();

  try {
    await requireBusinessOperationAccess(
      userId,
      business.id,
      "inventory.manage",
    );

    const product = await productService.createProduct({
      ...input,
      businessId: business.id,
      createdBy: userId,
    });

    if (!product) {
      return {
        ok: false as const,
        code: "PRODUCT_CREATE_FAILED" as const,
        message: "Unable to create the product.",
      };
    }

    return { ok: true as const, product };
  } catch (error) {
    if (
      error instanceof SubscriptionEntitlementError ||
      error instanceof SubscriptionLimitError
    ) {
      return {
        ok: false as const,
        code:
          error instanceof SubscriptionEntitlementError
            ? "SUBSCRIPTION_REQUIRED" as const
            : "SUBSCRIPTION_LIMIT_REACHED" as const,
        message: error.message,
      };
    }

    throw error;
  }
}

export async function getProductDefaultsAction() {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

await requireBusinessPermission(
  userId,
  business.id,
  "inventory.read",
);

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

  const userId =
  await getAuthenticatedUserId();

await requireBusinessOperationAccess(
  userId,
  business.id,
  "inventory.manage",
);

  return productService.updateProduct(
    business.id,
    productId,
    input,
  );
}

export async function saveProductSellingUnitsAction(
  productId: string,
  sellingUnits: Array<{
    id?: string;
    name: string;
    quantity: number;
    unit: string;
    conversionQuantity?: number;
    conversionUnit?: string;
    sellingPrice: number;
  }>,
) {
  const business = await getCurrentBusiness();
  const userId = await getAuthenticatedUserId();

  await requireBusinessOperationAccess(
    userId,
    business.id,
    "inventory.manage",
  );

  return productService.reconcileSellingUnits(
    business.id,
    productId,
    sellingUnits,
  );
}

export async function createProductSellingUnitAction(
  productId: string,
  input: {
  name: string;
  quantity: number;
  unit: string;
  conversionQuantity?: number;
  conversionUnit?: string;
  sellingPrice: number;
},
) {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

await requireBusinessOperationAccess(
  userId,
  business.id,
  "inventory.manage",
);

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

  const userId =
  await getAuthenticatedUserId();

await requireBusinessOperationAccess(
  userId,
  business.id,
  "inventory.manage",
);

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

  await prisma.product.updateMany({
    where: {
      id: {
        in: ids,
      },
      businessId: business.id,
    },
    data: {
      status: "ARCHIVED",
    },
  });

  return {
    deletedCount: ids.length,
  };
}

export async function restoreProductsAction(
  productIds: string[],
) {
  const business = await getCurrentBusiness();

  const userId =
  await getAuthenticatedUserId();

await requireBusinessOperationAccess(
  userId,
  business.id,
  "inventory.manage",
);

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
        status: "ARCHIVED",
      },
      select: {
        id: true,
      },
    });

  if (products.length !== ids.length) {
    throw new Error(
      "One or more selected products are not archived products in the current business.",
    );
  }

  await prisma.product.updateMany({
    where: {
      id: {
        in: ids,
      },
      businessId: business.id,
      status: "ARCHIVED",
    },
    data: {
      status: "ACTIVE",
    },
  });

  return {
    restoredCount: ids.length,
  };
}

