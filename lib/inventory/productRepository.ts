import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export type ProductAttributes =
  Record<string, string | number>;

export interface CreateProductInput {
  businessId: string;
  categoryId?: string;
  name: string;
  sku: string;
  barcode?: string;
  type: "PRODUCT" | "SERVICE";
  description?: string;
  unit: string;

  attributes?: ProductAttributes;

  costPrice: number;
  sellingPrice: number;
  currency: string;
  taxRate?: number;
  taxCode?: string;
  trackInventory: boolean;
  minimumStock?: number;
  reorderLevel?: number;
}

 export interface CreateProductSellingUnitInput {
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  sellingPrice: number;
}

export interface CreateProductPriceInput {
  productId: string;
  type:
    | "RETAIL"
    | "WHOLESALE"
    | "MINIMUM"
    | "RATE_1"
    | "RATE_2"
    | "RATE_3"
    | "RATE_4";
  price: number;
  currency: string;
}

function serializeProduct<
  T extends {
    costPrice: { toNumber(): number };
    sellingPrice: { toNumber(): number };
    taxRate?: { toNumber(): number } | null;
    minimumStock?: { toNumber(): number } | null;
    reorderLevel?: { toNumber(): number } | null;
    sellingUnits?: Array<{
  id: string;
  name: string;
  unit: string;
  quantity: { toNumber(): number };
  sellingPrice: { toNumber(): number };
}>;
  },
>(product: T) {
  const {
    sellingUnits,
    costPrice,
    sellingPrice,
    taxRate,
    minimumStock,
    reorderLevel,
    ...rest
  } = product;

  return {
    ...rest,
    costPrice: costPrice.toNumber(),
    sellingPrice: sellingPrice.toNumber(),
    taxRate: taxRate?.toNumber() ?? null,
    minimumStock: minimumStock?.toNumber() ?? null,
    reorderLevel: reorderLevel?.toNumber() ?? null,
    ...(sellingUnits
      ? {
          sellingUnits: sellingUnits.map(
            (sellingUnit) => ({
              ...sellingUnit,
              quantity:
                sellingUnit.quantity.toNumber(),
              sellingPrice:
                sellingUnit.sellingPrice.toNumber(),
            }),
          ),
        }
      : {}),
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
		attributes: input.attributes,
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

  async createPrice(
  input: CreateProductPriceInput,
  client: PrismaTransactionClient = prisma,
) {
  const price =
    await client.productPrice.create({
        data: {
          productId: input.productId,
          type: input.type,
          price: input.price,
          currency: input.currency,
        },
      });

    return {
      ...price,
      price: price.price.toNumber(),
    };
  },

  async listPrices(
    productId: string,
  ) {
    const prices =
      await prisma.productPrice.findMany({
        where: {
          productId,
          isActive: true,
        },
        orderBy: {
          type: "asc",
        },
      });

    return prices.map((price) => ({
      ...price,
      price: price.price.toNumber(),
    }));
  },

  async updatePrice(
    productId: string,
    type:
      | "RETAIL"
      | "WHOLESALE"
      | "MINIMUM"
      | "RATE_1"
      | "RATE_2"
      | "RATE_3"
      | "RATE_4",
    input: {
      price: number;
      currency: string;
    },
  ) {
    const price =
      await prisma.productPrice.update({
        where: {
          productId_type: {
            productId,
            type,
          },
        },
        data: {
          price: input.price,
          currency: input.currency,
          isActive: true,
        },
      });

    return {
      ...price,
      price: price.price.toNumber(),
    };
  },


    async update(
    businessId: string,
    productId: string,
    input: Omit<CreateProductInput, "businessId">,
  ) {
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        categoryId: input.categoryId,
        name: input.name,
        sku: input.sku,
        barcode: input.barcode,
        type: input.type,
        description: input.description,
        unit: input.unit,
		attributes: input.attributes,
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
  include: {
  category: true,
  sellingUnits: {
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    },
  },
  orderBy: {
    name: "asc",
  },
});

    return products.map(serializeProduct);
  },

  async listByType(
  businessId: string,
  type: "PRODUCT" | "SERVICE",
) {
  const products = await prisma.product.findMany({
  where: {
    businessId,
    type,
  },
  include: {
    category: true,
  },
  orderBy: {
    name: "asc",
  },
});

  return products.map(serializeProduct);
},

async listByTypeAndCategory(
  businessId: string,
  type: "PRODUCT" | "SERVICE",
  categoryId: string,
) {
  const products = await prisma.product.findMany({
    where: {
      businessId,
      type,
      categoryId,
    },
    include: {
      category: true,
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
	include: {
    category: true,
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

    async findByBarcode(
    businessId: string,
    barcode: string,
  ) {
    const product =
      await prisma.product.findFirst({
        where: {
          businessId,
          barcode,
        },
      });

    return product
      ? serializeProduct(product)
      : null;
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

  async createSellingUnit(
  input: CreateProductSellingUnitInput,
) {
  const sellingUnit =
    await prisma.productSellingUnit.create({
      data: {
        productId: input.productId,
        name: input.name,
        quantity: input.quantity,
		unit: input.unit,
        sellingPrice: input.sellingPrice,
      },
    });

  return {
    ...sellingUnit,
    quantity: sellingUnit.quantity.toNumber(),
    sellingPrice:
      sellingUnit.sellingPrice.toNumber(),
  };
},

  async findSellingUnitById(
    productId: string,
    sellingUnitId: string,
  ) {
    const sellingUnit =
      await prisma.productSellingUnit.findFirst({
        where: {
          id: sellingUnitId,
          productId,
          isActive: true,
        },
      });

    return sellingUnit
      ? {
          ...sellingUnit,
          quantity:
            sellingUnit.quantity.toNumber(),
          sellingPrice:
            sellingUnit.sellingPrice.toNumber(),
        }
      : null;
  },

async listSellingUnits(
  productId: string,
) {
  const sellingUnits =
    await prisma.productSellingUnit.findMany({
      where: {
        productId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

  return sellingUnits.map((sellingUnit) => ({
    ...sellingUnit,
    quantity: sellingUnit.quantity.toNumber(),
    sellingPrice:
      sellingUnit.sellingPrice.toNumber(),
  }));
},
};