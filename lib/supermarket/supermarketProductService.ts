import { prisma } from "@/lib/database/prisma";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireSupermarketProductAccess } from "@/lib/supermarket/supermarketProductAccessService";
import type {
  SupermarketProductInput,
  SupermarketSellingMode,
} from "@/lib/supermarket/supermarketProductTypes";
import type { BusinessType } from "@/types";

function normalizeSellingMode(
  value?: SupermarketSellingMode,
): SupermarketSellingMode {
  return value ?? "UNIT";
}

export async function listSupermarketProducts() {
  const context = await getCurrentBusinessContext();

  requireSupermarketProductAccess(
    context.business.type as BusinessType,
  );

  return prisma.product.findMany({
    where: {
      businessId: context.business.id,
      status: "ACTIVE",
      type: "PRODUCT",
    },
    include: {
      category: true,
      prices: {
        where: {
          isActive: true,
        },
        orderBy: {
          type: "asc",
        },
      },
      inventoryBalances: {
        include: {
          warehouse: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getSupermarketProduct(
  productId: string,
) {
  const context = await getCurrentBusinessContext();

  requireSupermarketProductAccess(
    context.business.type as BusinessType,
  );

  return prisma.product.findFirst({
    where: {
      id: productId,
      businessId: context.business.id,
      type: "PRODUCT",
    },
    include: {
      category: true,
      prices: {
        where: {
          isActive: true,
        },
      },
      inventoryBalances: {
        include: {
          warehouse: true,
        },
      },
    },
  });
}

export async function updateSupermarketProduct(
  input: SupermarketProductInput,
) {
  const context = await getCurrentBusinessContext();

  requireSupermarketProductAccess(
    context.business.type as BusinessType,
  );

  const product = await prisma.product.findFirst({
    where: {
      id: input.productId,
      businessId: context.business.id,
      type: "PRODUCT",
    },
  });

  if (!product) {
    throw new Error(
      "Product was not found in this supermarket.",
    );
  }

  const existingAttributes =
    product.attributes &&
    typeof product.attributes === "object" &&
    !Array.isArray(product.attributes)
      ? product.attributes as Record<string, unknown>
      : {};

  const supermarketAttributes = {
    sellingMode: normalizeSellingMode(
      input.sellingMode,
    ),
    weighted:
      input.weighted ??
      existingAttributes.weighted ??
      false,
    shelfLocation:
      input.shelfLocation ??
      existingAttributes.shelfLocation ??
      null,
    aisle:
      input.aisle ??
      existingAttributes.aisle ??
      null,
    section:
      input.section ??
      existingAttributes.section ??
      null,
    reorderEnabled:
      input.reorderEnabled ??
      existingAttributes.reorderEnabled ??
      true,
    reorderPoint:
      input.reorderPoint ??
      existingAttributes.reorderPoint ??
      null,
    reorderQuantity:
      input.reorderQuantity ??
      existingAttributes.reorderQuantity ??
      null,
    promotionEligible:
      input.promotionEligible ??
      existingAttributes.promotionEligible ??
      true,
  };

  return prisma.product.update({
    where: {
      id: product.id,
    },
    data: {
      attributes: {
        ...existingAttributes,
        supermarket: supermarketAttributes,
      },
    },
    include: {
      category: true,
      prices: {
        where: {
          isActive: true,
        },
      },
      inventoryBalances: {
        include: {
          warehouse: true,
        },
      },
    },
  });
}
