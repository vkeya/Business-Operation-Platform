import { prisma } from "@/lib/database/prisma";

export interface ListBarcodeLabelProductsInput {
  businessId: string;
  warehouseId: string;
  search?: string;
  categoryId?: string;
}

export async function listBarcodeLabelProducts(
  input: ListBarcodeLabelProductsInput,
) {
  const search = input.search?.trim();

  const products = await prisma.product.findMany({
    where: {
      businessId: input.businessId,
      status: "ACTIVE",
      type: "PRODUCT",

      ...(input.categoryId
        ? {
            categoryId: input.categoryId,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                sku: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                barcode: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    include: {
  category: true,
  inventoryBalances: {
    where: {
      warehouseId: input.warehouseId,
    },
  },
},

    orderBy: {
      name: "asc",
    },
  });

  return products
    .filter((product) => Boolean(product.barcode?.trim()))
    .map((product) => {
      const availableQuantity =
        product.inventoryBalances.reduce(
          (total, balance) =>
            total + Number(balance.quantity),
          0,
        );

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode!.trim(),
        sellingPrice: Number(product.sellingPrice),
        currency: product.currency,
        categoryName:
          product.category?.name ?? null,
        availableQuantity,
      };
    });
}