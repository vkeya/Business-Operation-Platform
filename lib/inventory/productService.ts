import { prisma } from "@/lib/database/prisma";
import {
  productRepository,
  type CreateProductInput,
  type CreateProductSellingUnitInput,
} from "./productRepository";

import {
  generateBusinessReference,
} from "@/lib/business/reference/referenceGenerator";

import {
  productCategoryRepository,
} from "./productCategoryRepository";

import {
  getProductSkuPrefix,
} from "./productSku";
import {
  requireWithinSubscriptionLimit,
} from "@/lib/subscription/subscriptionLimitService";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

function validateInventoryConfiguration(input: {
  inventoryMode?: "DISCRETE" | "LIQUID";
  unit: string;
  trackInventory: boolean;
  attributes?: Record<string, string | number>;
}) {
  if (input.inventoryMode !== "LIQUID") {
    return;
  }

  if (!input.trackInventory) {
    throw new Error(
      "Liquid inventory products must have inventory tracking enabled.",
    );
  }

  if (input.unit.trim().toLowerCase() !== "ml") {
    throw new Error(
      "Liquid inventory products must use ml as their base inventory unit.",
    );
  }

  const volume = Number(input.attributes?.volume);

  if (!Number.isFinite(volume) || volume <= 0) {
    throw new Error(
      "Liquid inventory products must have a positive numeric container volume in ml.",
    );
  }
}

export const productService = {
  async createProduct(
  input: Omit<CreateProductInput, "sku"> & {
    operationId: string;
  },
) {
  if (!input.operationId?.trim()) {
    throw new Error("Operation ID is required.");
  }

  const name = input.name.trim();

  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!input.unit.trim()) {
    throw new Error("Product unit is required.");
  }

  validateInventoryConfiguration(input);

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existingOperation =
            await tx.operationRequest.findUnique({
              where: {
                businessId_operationId: {
                  businessId: input.businessId,
                  operationId: input.operationId,
                },
              },
            });

          if (existingOperation?.status === "COMPLETED") {
            if (!existingOperation.entityId) {
              throw new Error(
                "Completed product operation is missing its entity.",
              );
            }

            const existingProduct =
              await tx.product.findFirst({
                where: {
                  id: existingOperation.entityId,
                  businessId: input.businessId,
                },
              });

            if (!existingProduct) {
              throw new Error(
                "Completed product operation references a missing product.",
              );
            }

            return existingProduct;
          }

          await requireWithinSubscriptionLimit({
            businessId: input.businessId,
            limit: "products",
          });

          const categoryName = input.categoryId
            ? (
                await tx.productCategory.findFirst({
                  where: {
                    id: input.categoryId,
                    businessId: input.businessId,
                  },
                  select: {
                    name: true,
                  },
                })
              )?.name
            : undefined;

          if (input.categoryId && !categoryName) {
            throw new Error("Product category not found.");
          }

          const operation =
            existingOperation ??
            (await tx.operationRequest.create({
              data: {
                businessId: input.businessId,
                operationId: input.operationId,
                operation: "PRODUCT_CREATE",
                status: "PROCESSING",
                entityType: "PRODUCT",
                createdBy: input.createdBy ?? "",
              },
            }));

          const prefix = getProductSkuPrefix(categoryName);

          const sku = await generateBusinessReference({
            businessId: input.businessId,
            referenceType: "PRODUCT_SKU",
            prefix,
            client: tx,
          });

          const barcode =
            input.barcode?.trim() ||
            (await generateBusinessReference({
              businessId: input.businessId,
              referenceType: "PRODUCT_BARCODE",
              prefix: "",
              padLength: 7,
              client: tx,
            }));

          const product =
            await productRepository.create(
              {
                ...input,
                name,
                sku,
                unit: input.unit.trim(),
                barcode,
                description:
                  input.description?.trim() || undefined,
                taxCode:
                  input.taxCode?.trim() || undefined,
              },
              tx,
            );

          await tx.operationRequest.update({
            where: {
              id: operation.id,
            },
            data: {
              status: "COMPLETED",
              entityType: "PRODUCT",
              entityId: product.id,
              response: product,
            },
          });

          return product;
        },
        {
          isolationLevel: "Serializable",
          maxWait: 10000,
          timeout: 15000,
        },
      );
    } catch (error: unknown) {
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? error.code
          : undefined;

      if (errorCode === "P2034" && attempt < maxAttempts) {
        continue;
      }

      if (errorCode === "P2002") {
        const existingOperation =
          await prisma.operationRequest.findUnique({
            where: {
              businessId_operationId: {
                businessId: input.businessId,
                operationId: input.operationId,
              },
            },
          });

        if (
          existingOperation?.status === "COMPLETED" &&
          existingOperation.entityId
        ) {
          return productRepository.findById(
            input.businessId,
            existingOperation.entityId,
          );
        }
      }

      throw error;
    }
  }

  throw new Error("Product creation failed after retries.");
},

  async listProducts(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return productRepository.list(businessId);
  },

  async listArchivedProducts(
  businessId: string,
) {
  if (!businessId) {
    throw new Error(
      "Business context is required.",
    );
  }

  return productRepository.listArchived(
    businessId,
  );
},

  async listServices(businessId: string) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  return productRepository.listByType(
    businessId,
    "SERVICE",
  );
},

async listServicesByCategory(
  businessId: string,
  categoryId: string,
) {
  if (!businessId) {
    throw new Error(
      "Business context is required.",
    );
  }

  if (!categoryId) {
    throw new Error(
      "Service category is required.",
    );
  }

  return productRepository.listByTypeAndCategory(
    businessId,
    "SERVICE",
    categoryId,
  );
},

  async searchProducts(
  businessId: string,
  query: string,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  return productRepository.search(
    businessId,
    query,
  );
},

  async findProductByBarcode(
    businessId: string,
    barcode: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    const normalizedBarcode = barcode.trim();

    if (!normalizedBarcode) {
      throw new Error(
        "Product barcode is required.",
      );
    }

    return productRepository.findByBarcode(
      businessId,
      normalizedBarcode,
    );
  },

    async createSellingUnit(
    businessId: string,
    input: CreateProductSellingUnitInput,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.productId) {
      throw new Error(
        "Product ID is required.",
      );
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error(
        "Selling unit name is required.",
      );
    }

    if (input.quantity <= 0) {
      throw new Error(
        "Selling unit quantity must be greater than zero.",
      );
    }

    if (input.sellingPrice < 0) {
      throw new Error(
        "Selling unit price cannot be negative.",
      );
    }

    const product =
      await productRepository.findById(
        businessId,
        input.productId,
      );

    if (!product) {
      throw new Error(
        "Product not found.",
      );
    }

	const normalizedUnit = input.unit.trim();

    if (!normalizedUnit) {
      throw new Error(
        "Selling unit is required.",
      );
    }

    const hasConversionQuantity =
  input.conversionQuantity !== undefined &&
  input.conversionQuantity !== null;

const hasConversionUnit =
  typeof input.conversionUnit === "string" &&
  input.conversionUnit.trim().length > 0;

if (hasConversionQuantity !== hasConversionUnit) {
  throw new Error(
    "conversionQuantity and conversionUnit must be provided together.",
  );
}

if (hasConversionQuantity) {
  const conversionQuantity = input.conversionQuantity;

  if (
    conversionQuantity === undefined ||
    !Number.isFinite(conversionQuantity) ||
    conversionQuantity <= 0
  ) {
    throw new Error(
      "conversionQuantity must be greater than zero.",
    );
  }
}

const conversionUnit =
  input.conversionUnit?.trim().toLowerCase();

if (hasConversionQuantity && !conversionUnit) {
  throw new Error(
    "conversionUnit is required when conversionQuantity is provided.",
  );
}

const existingSellingUnit =
  await prisma.productSellingUnit.findFirst({
    where: {
      productId: input.productId,
      name: {
        equals: name,
        mode: "insensitive",
      },
      quantity: input.quantity,
      unit: {
        equals: normalizedUnit,
        mode: "insensitive",
      },
      isActive: true,
    },
    select: {
      id: true,
    },
  });

if (existingSellingUnit) {
  throw new Error(
    "This selling unit already exists for this product.",
  );
}

    try {
  return await productRepository.createSellingUnit({
    ...input,
    name,
    unit: normalizedUnit,
  });
} catch (error: unknown) {
  const errorCode =
    typeof error === "object" && error !== null && "code" in error
      ? error.code
      : undefined;

  if (errorCode === "P2002") {
    throw new Error(
      "This selling unit already exists for this product.",
    );
  }

  throw error;
}
  },

    async reconcileSellingUnits(
    businessId: string,
    productId: string,
    inputs: Array<{
      id?: string;
      name: string;
      quantity: number;
      unit: string;
      conversionQuantity?: number;
      conversionUnit?: string;
      sellingPrice: number;
    }>,
  ) {
    if (!businessId || !productId) {
      throw new Error("Business and product context are required.");
    }

    const normalized = inputs.map((item) => {
      const name = item.name.trim();
      const unit = item.unit.trim();
      const conversionUnit = item.conversionUnit?.trim().toLowerCase() || undefined;
      const hasConversionQuantity =
        item.conversionQuantity !== undefined &&
        item.conversionQuantity !== null;

      if (!name) throw new Error("Selling unit name is required.");
      if (!unit) throw new Error("Selling unit is required.");
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        throw new Error("Selling unit quantity must be greater than zero.");
      }
      if (!Number.isFinite(item.sellingPrice) || item.sellingPrice < 0) {
        throw new Error("Selling unit price must be zero or greater.");
      }
      if (
        hasConversionQuantity !== Boolean(conversionUnit) ||
        (hasConversionQuantity &&
          (!Number.isFinite(item.conversionQuantity) ||
            Number(item.conversionQuantity) <= 0))
      ) {
        throw new Error(
          "Provide a positive conversion quantity and conversion unit together.",
        );
      }

      return {
        ...item,
        name,
        unit,
        conversionQuantity: hasConversionQuantity
          ? Number(item.conversionQuantity)
          : undefined,
        conversionUnit,
      };
    });

    const keys = new Set<string>();
    for (const item of normalized) {
      const key = `${item.name.toLocaleLowerCase()}|${item.quantity}|${item.unit.toLocaleLowerCase()}`;
      if (keys.has(key)) {
        throw new Error("Duplicate selling units are not allowed.");
      }
      keys.add(key);
    }

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, businessId, status: "ACTIVE" },
        select: { id: true },
      });
      if (!product) {
        throw new Error("Product does not belong to the current business or is inactive.");
      }

      const existing = await tx.productSellingUnit.findMany({
        where: { productId, isActive: true },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((unit) => unit.id));
      const submittedIds = new Set(
        normalized.map((item) => item.id).filter((id): id is string => Boolean(id)),
      );

      for (const id of submittedIds) {
        if (!existingIds.has(id)) {
          throw new Error("A selling unit does not belong to this product or is inactive.");
        }
      }

      for (const item of normalized) {
        const data = {
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          conversionQuantity: item.conversionQuantity ?? null,
          conversionUnit: item.conversionUnit ?? null,
          sellingPrice: item.sellingPrice,
        };

        if (item.id) {
          await tx.productSellingUnit.update({
            where: { id: item.id },
            data,
          });
        } else {
          // The schema has a unique constraint that includes inactive rows.
          // Reuse a matching inactive row instead of violating that constraint.
          const inactiveMatch = await tx.productSellingUnit.findFirst({
            where: {
              productId,
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              isActive: false,
            },
            select: { id: true },
          });

          if (inactiveMatch) {
            await tx.productSellingUnit.update({
              where: { id: inactiveMatch.id },
              data: { ...data, isActive: true },
            });
          } else {
            await tx.productSellingUnit.create({
              data: { productId, ...data },
            });
          }
        }
      }

      const removedIds = [...existingIds].filter((id) => !submittedIds.has(id));
      if (removedIds.length) {
        await tx.productSellingUnit.updateMany({
          where: { productId, id: { in: removedIds }, isActive: true },
          data: { isActive: false },
        });
      }

      return tx.productSellingUnit.findMany({
        where: { productId, isActive: true },
        orderBy: { createdAt: "asc" },
      });
    });
  },

  async findSellingUnitById(
  businessId: string,
  productId: string,
  sellingUnitId: string,
  client?: PrismaTransactionClient,
) {
    if (!productId) {
      throw new Error(
        "Product is required.",
      );
    }



    if (!sellingUnitId) {
      throw new Error(
        "Selling unit is required.",
      );
    }

	if (!businessId) {
  throw new Error(
    "Business context is required.",
  );
}

const product = client
  ? await client.product.findFirst({
      where: {
        id: productId,
        businessId,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    })
  : await prisma.product.findFirst({
      where: {
        id: productId,
        businessId,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

if (!product) {
  throw new Error(
    "Product does not belong to the current business or is inactive.",
  );
}

    return productRepository.findSellingUnitById(
  productId,
  sellingUnitId,
  client,
);
  },

  async listSellingUnits(
    businessId: string,
    productId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!productId) {
      throw new Error(
        "Product ID is required.",
      );
    }

    const product =
      await productRepository.findById(
        businessId,
        productId,
      );

    if (!product) {
      throw new Error(
        "Product not found.",
      );
    }

    return productRepository.listSellingUnits(
      productId,
    );
  },



  async updateProduct(
    businessId: string,
    productId: string,
    input: Omit<CreateProductInput, "businessId">,
  ) {
    const name = input.name.trim();
    const sku = input.sku.trim().toUpperCase();

    if (!businessId) {
      throw new Error("Business context is required.");
    }

    if (!productId) {
      throw new Error("Product ID is required.");
    }

    if (!name) {
      throw new Error("Product name is required.");
    }

    if (!sku) {
      throw new Error("Product SKU is required.");
    }

    if (!input.currency) {
      throw new Error("Product currency is required.");
    }

    if (!input.unit.trim()) {
      throw new Error("Product unit is required.");
    }

	validateInventoryConfiguration(input);

    if (input.costPrice < 0) {
      throw new Error("Cost price cannot be negative.");
    }

    if (input.sellingPrice < 0) {
      throw new Error("Selling price cannot be negative.");
    }

    if (
      input.minimumStock !== undefined &&
      input.minimumStock < 0
    ) {
      throw new Error("Minimum stock cannot be negative.");
    }

    if (
      input.reorderLevel !== undefined &&
      input.reorderLevel < 0
    ) {
      throw new Error("Reorder level cannot be negative.");
    }

    const existingProduct =
      await productRepository.findBySku(
        businessId,
        sku,
      );

    if (
      existingProduct &&
      existingProduct.id !== productId
    ) {
      throw new Error(
        `A product with SKU "${sku}" already exists.`,
      );
    }

    const product =
      await productRepository.findById(
        businessId,
        productId,
      );

    if (!product) {
      throw new Error("Product not found.");
    }

	if (input.categoryId) {
  const category =
    await productCategoryRepository.findById(
      businessId,
      input.categoryId,
    );

  if (!category || !category.isActive) {
    throw new Error(
      "Product category does not belong to the current business or is inactive.",
    );
  }
}

    return productRepository.update(
      businessId,
      productId,
      {
        ...input,
        name,
        sku,
        unit: input.unit.trim(),
        barcode:
          input.barcode?.trim() || undefined,
        description:
          input.description?.trim() || undefined,
        taxCode:
          input.taxCode?.trim() || undefined,
      },
    );
  },
};