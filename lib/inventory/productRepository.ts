import { prisma } from "@/lib/database/prisma";

export interface CreateProductInput {
  businessId: string;
  categoryId?: string;
  name: string;
  sku: string;
  barcode?: string;
  type: "PRODUCT" | "SERVICE";
  description?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currency: string;
  taxRate?: number;
  taxCode?: string;
  trackInventory: boolean;
  minimumStock?: number;
  reorderLevel?: number;
}

function serializeProduct<T extends {
  costPrice: { toNumber(): number };
  sellingPrice: { toNumber(): number };
  taxRate?: { toNumber(): number } | null;
  minimumStock?: { toNumber(): number } | null;
  reorderLevel?: { toNumber(): number } | null;
}>(product: T) {
  return {
    ...product,
    costPrice: product.costPrice.toNumber(),
    sellingPrice: product.sellingPrice.toNumber(),
    taxRate: product.taxRate?.toNumber() ?? null,
    minimumStock: product.minimumStock?.toNumber() ?? null,
    reorderLevel: product.reorderLevel?.toNumber() ?? null,
  };
}

export const productRepository = {
  async create(input: CreateProductInput) {
    const product = await prisma.product.create({
      data: {
        businessId: input.businessId,
        categoryId: input.categoryId,
        name: input.name,
        sku: input.sku,
        barcode: input.barcode,
        type: input.type,
        description: input.description,
        unit: input.unit,
        costPrice: input.costPrice,
        sellingPrice: input.sellingPrice,
        currency: input.currency,
        taxRate: input.taxRate,
        taxCode: input.taxCode,
        trackInventory: input.trackInventory,
        minimumStock: input.minimumStock,
        reorderLevel: input.reorderLevel,
      },
    });

    return serializeProduct(product);
  },

  async list(businessId: string) {
    const products = await prisma.product.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products.map(serializeProduct);
  },

  async search(
  businessId: string,
  query: string,
) {
  const searchTerm = query.trim();

  if (!searchTerm) {
    return this.list(businessId);
  }

  const products = await prisma.product.findMany({
    where: {
      businessId,
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          barcode: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      name: "asc",
    },
  });

  return products.map(serializeProduct);
},

  async findBySku(
    businessId: string,
    sku: string,
  ) {
    const product = await prisma.product.findUnique({
      where: {
        businessId_sku: {
          businessId,
          sku,
        },
      },
    });

    return product ? serializeProduct(product) : null;
  },

    async findById(
    businessId: string,
    productId: string,
  ) {
    const product =
      await prisma.product.findFirst({
        where: {
          id: productId,
          businessId,
        },
      });

    return product
      ? serializeProduct(product)
      : null;
  },
};