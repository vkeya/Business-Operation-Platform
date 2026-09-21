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

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

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
        },
      );
    } catch (error: any) {
      if (error?.code === "P2034" && attempt < maxAttempts) {
        continue;
      }

      if (error?.code === "P2002") {
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
} catch (error: any) {
  if (error?.code === "P2002") {
    throw new Error(
      "This selling unit already exists for this product.",
    );
  }

  throw error;
}
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