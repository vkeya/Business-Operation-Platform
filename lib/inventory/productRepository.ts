import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export type ProductAttributes =
  Record<string, string | number>;

function normalizeProductAttributes(
  attributes: unknown,
): ProductAttributes | null {
  if (
    !attributes ||
    typeof attributes !== "object" ||
    Array.isArray(attributes)
  ) {
    return null;
  }

  const normalized: ProductAttributes = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      normalized[key] = value;
    }
  }

  return normalized;
}

export interface CreateProductInput {
  businessId: string;
  createdBy?: string;
  categoryId?: string;
  name: string;
  sku: string;
  barcode?: string;
  type: "PRODUCT" | "SERVICE";
  description?: string;
  unit: string;

  attributes?: ProductAttributes;

  inventoryMode?: "DISCRETE" | "LIQUID";

  costPrice: number;
  sellingPrice: number;
  currency: string;
  taxRate?: number;
  taxCode?: string;
  trackInventory: boolean;
  minimumStock?: number;
  reorderLevel?: number;

    pharmacy?: {
    medicineType:
      | "MEDICINE"
      | "SUPPLEMENT"
      | "MEDICAL_DEVICE"
      | "PERSONAL_CARE"
      | "OTHER";

    prescriptionType:
      | "OTC"
      | "PRESCRIPTION"
      | "CONTROLLED";

    activeIngredient?: string;
    strength?: string;
    dosageForm?: string;
    routeOfAdministration?: string;
    manufacturer?: string;
    registrationNumber?: string;
    packSize?: string;
  };
}

 export interface CreateProductSellingUnitInput {
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  sellingPrice: number;
  conversionQuantity?: number;
  conversionUnit?: string;
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
	attributes?: unknown;
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
  conversionQuantity?: { toNumber(): number } | null;
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
  attributes,
  ...rest
} = product;

  return {
    ...rest,
	attributes:
      normalizeProductAttributes(attributes),
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
			  conversionQuantity:
                 sellingUnit.conversionQuantity?.toNumber() ?? null,
            }),
          ),
        }
      : {}),
  };
}

export const productRepository = {
    async create(
    input: CreateProductInput,
    client: PrismaTransactionClient = prisma,
  ) {
    const product = await client.product.create({
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
		inventoryMode: input.inventoryMode ?? "DISCRETE",
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

    if (input.pharmacy) {
      await client.pharmacyProduct.create({
        data: {
          productId: product.id,

          medicineType:
            input.pharmacy.medicineType,

          prescriptionType:
            input.pharmacy.prescriptionType,

          activeIngredient:
            input.pharmacy.activeIngredient,

          strength:
            input.pharmacy.strength,

          dosageForm:
            input.pharmacy.dosageForm,

          routeOfAdministration:
            input.pharmacy.routeOfAdministration,

          manufacturer:
            input.pharmacy.manufacturer,

          registrationNumber:
            input.pharmacy.registrationNumber,

          packSize:
            input.pharmacy.packSize,

          status: "ACTIVE",
        },
      });
    }

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
		businessId,
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
		inventoryMode: input.inventoryMode,
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
	 status: "ACTIVE",
  },
  include: {
  category: true,
  pharmacyProduct: true,
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

  async listArchived(
  businessId: string,
) {
  const products =
    await prisma.product.findMany({
      where: {
        businessId,
        status: "ARCHIVED",
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
  status: "ACTIVE",
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
  pharmacyProduct: true,
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

  async findById(
    businessId: string,
    productId: string,
  ) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        businessId,
        status: "ACTIVE",
      },
      include: {
        category: true,
        pharmacyProduct: true,
        sellingUnits: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return product ? serializeProduct(product) : null;
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
      status: "ACTIVE",
    },
    include: {
	  category: true,
      pharmacyProduct: true,
      sellingUnits: {
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  });

    return product
      ? serializeProduct(product)
      : null;
  },

    async findByIdWithSellingUnits(
      businessId: string,
      productId: string,
    ) {
      return prisma.product.findFirst({
        where: {
          id: productId,
          businessId,
        },
        include: {
          sellingUnits: {
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
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
		conversionQuantity: input.conversionQuantity ?? null,
        conversionUnit: input.conversionUnit ?? null,
      },
    });

  return {
  ...sellingUnit,
  quantity: sellingUnit.quantity.toNumber(),
  sellingPrice:
    sellingUnit.sellingPrice.toNumber(),
  conversionQuantity:
    sellingUnit.conversionQuantity?.toNumber() ?? null,
};
},

  async findSellingUnitById(
  productId: string,
  sellingUnitId: string,
  client: PrismaTransactionClient = prisma,
) {
  const sellingUnit =
    await client.productSellingUnit.findFirst({
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
		  conversionQuantity:
            sellingUnit.conversionQuantity?.toNumber() ?? null,
        }
      : null;
  },

async updateSellingUnit(
  productId: string,
  sellingUnitId: string,
  input: {
    name: string;
    quantity: number;
    unit: string;
    conversionQuantity?: number;
    conversionUnit?: string;
    sellingPrice: number;
  },
  client: PrismaTransactionClient = prisma,
) {
  const existing = await client.productSellingUnit.findFirst({
    where: {
      id: sellingUnitId,
      productId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new Error("Selling unit not found.");
  }

  const sellingUnit = await client.productSellingUnit.update({
    where: {
      id: existing.id,
    },
    data: {
      name: input.name.trim(),
      quantity: input.quantity,
      unit: input.unit.trim(),
      conversionQuantity: input.conversionQuantity ?? null,
      conversionUnit: input.conversionUnit?.trim() || null,
      sellingPrice: input.sellingPrice,
    },
  });

  return {
    ...sellingUnit,
    quantity: sellingUnit.quantity.toNumber(),
    sellingPrice: sellingUnit.sellingPrice.toNumber(),
    conversionQuantity:
      sellingUnit.conversionQuantity?.toNumber() ?? null,
  };
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
  sellingPrice: sellingUnit.sellingPrice.toNumber(),
  conversionQuantity:
    sellingUnit.conversionQuantity?.toNumber() ?? null,
}));
},
};