
import { prisma } from "@/lib/database/prisma";
import {
  purchaseRepository,
  type CreatePurchaseInput,
} from "./purchaseRepository";
import { postPurchaseToAccounting } from "@/lib/accounting/posting/purchasePosting";
import {
  generateBusinessReference,
} from "@/lib/business/reference/referenceGenerator";
import { assertActiveProduct } from "@/lib/inventory/productStatus";

export const purchaseService = {
  async createPurchase(
  input: Omit<
    CreatePurchaseInput,
    "referenceNumber"
  > & {
    operationId: string;
  },
) {
  if (!input.businessId) {
    throw new Error(
      "Business context is required.",
    );
  }

  if (!input.operationId?.trim()) {
    throw new Error(
      "Operation ID is required.",
    );
  }

  if (!input.createdBy) {
    throw new Error(
      "User context is required.",
    );
  }

  if (!input.supplierId) {
    throw new Error(
      "Supplier is required.",
    );
  }

  if (!input.currency.trim()) {
    throw new Error(
      "Purchase currency is required.",
    );
  }

  if (input.items.length === 0) {
    throw new Error(
      "At least one purchase item is required.",
    );
  }

  for (const item of input.items) {
    if (!item.productId) {
      throw new Error(
        "Each purchase item must have a product.",
      );
    }

    if (item.quantity <= 0) {
      throw new Error(
        "Purchase quantities must be greater than zero.",
      );
    }

    if (item.unitCost < 0) {
      throw new Error(
        "Purchase unit cost cannot be negative.",
      );
    }
  }

  const maxAttempts = 3;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const supplier =
            await tx.supplier.findFirst({
              where: {
                id:
                  input.supplierId,

                businessId:
                  input.businessId,

                isActive: true,
              },

              select: {
                id: true,
              },
            });

          if (!supplier) {
            throw new Error(
              "Supplier does not belong to the current business or is inactive.",
            );
          }

          if (input.branchId) {
            const branch =
              await tx.branch.findFirst({
                where: {
                  id:
                    input.branchId,

                  businessId:
                    input.businessId,

                  isActive: true,
                },

                select: {
                  id: true,
                },
              });

            if (!branch) {
              throw new Error(
                "Branch does not belong to the current business or is inactive.",
              );
            }
          }

          for (const item of input.items) {
            const product =
              await tx.product.findFirst({
                where: {
                  id:
                    item.productId,

                  businessId:
                    input.businessId,

                  status: "ACTIVE",
                },

                select: {
                  id: true,
                },
              });

            if (!product) {
              throw new Error(
                "Purchase item product does not belong to the current business or is inactive.",
              );
            }
          }

          const operation =
            await tx.operationRequest.create({
              data: {
                businessId:
                  input.businessId,

                operationId:
                  input.operationId,

                operation:
                  "PURCHASE_CREATE",

                status:
                  "PROCESSING",

                entityType:
                  "PURCHASE",

                createdBy:
                  input.createdBy,
              },
            });

          const referenceNumber =
            await generateBusinessReference({
              businessId:
                input.businessId,

              referenceType:
                "PURCHASE",

              prefix: "PUR",

              client: tx,
            });

          const purchase =
            await purchaseRepository.create(
              {
                ...input,

                referenceNumber,

                currency:
                  input.currency.trim(),
              },
              tx,
            );

          await tx.operationRequest.update({
            where: {
              id: operation.id,
            },

            data: {
              status:
                "COMPLETED",

              entityType:
                "PURCHASE",

              entityId:
                purchase.id,

              response: {
                purchaseId:
                  purchase.id,

                referenceNumber:
                  purchase.referenceNumber,
              },
            },
          });

          return purchase;
        },
        {
          isolationLevel:
            "Serializable",
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code ===
          "P2034" &&
        attempt < maxAttempts
      ) {
        continue;
      }

      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code ===
          "P2002"
      ) {
        const existing =
          await prisma.operationRequest.findUnique({
            where: {
              businessId_operationId: {
                businessId:
                  input.businessId,

                operationId:
                  input.operationId,
              },
            },
          });

        if (existing?.entityId) {
          const purchase =
            await purchaseRepository.findById(
              input.businessId,
              existing.entityId,
            );

          if (purchase) {
            return purchase;
          }
        }
      }

      throw error;
    }
  }

  throw new Error(
    "Unable to complete purchase creation after multiple concurrent attempts.",
  );
},

  async listPurchases(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return purchaseRepository.list(
      businessId,
    );
  },

  async findPurchaseByReference(
    businessId: string,
    referenceNumber: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return purchaseRepository.findByReference(
      businessId,
      referenceNumber,
    );
  },

    async findPurchaseById(
    businessId: string,
    purchaseId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!purchaseId) {
      throw new Error(
        "Purchase is required.",
      );
    }

    return purchaseRepository.findById(
      businessId,
      purchaseId,
    );
  },

    async orderPurchase(
    businessId: string,
    purchaseId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!purchaseId) {
      throw new Error(
        "Purchase is required.",
      );
    }



    const purchase =
      await purchaseRepository.findById(
        businessId,
        purchaseId,
      );

    if (!purchase) {
      throw new Error(
        "Purchase not found.",
      );
    }

    if (purchase.status !== "DRAFT") {
      throw new Error(
        "Only draft purchases can be ordered.",
      );
    }

    return purchaseRepository.updateStatus(
      businessId,
      purchaseId,
      "ORDERED",
    );
  },
  async receivePurchase(
  businessId: string,
  purchaseId: string,
) {
  if (!businessId) {
    throw new Error(
      "Business context is required.",
    );
  }

  if (!purchaseId) {
    throw new Error(
      "Purchase is required.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const purchase =
      await tx.purchase.findFirst({
        where: {
          id: purchaseId,
          businessId,
        },
        include: {
          supplier: true,
          items: true,
        },
      });

    if (!purchase) {
      throw new Error(
        "Purchase not found.",
      );
    }

    if (purchase.status !== "ORDERED") {
      throw new Error(
        "Only ordered purchases can be received.",
      );
    }

    const receivedPurchase =
  await purchaseRepository.receivePurchaseWithClient(
    businessId,
    purchaseId,
    tx,
  );

await postPurchaseToAccounting({
  businessId:
    purchase.businessId,

  purchaseId:
    purchase.id,

  referenceNumber:
    purchase.referenceNumber,

  totalAmount:
    purchase.totalAmount.toNumber(),

  currency:
    purchase.currency,

  createdBy:
    purchase.createdBy,

  client: tx,
});

return receivedPurchase;
  });
},

    async cancelPurchase(
    businessId: string,
    purchaseId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!purchaseId) {
      throw new Error(
        "Purchase is required.",
      );
    }

    const purchase =
      await purchaseRepository.findById(
        businessId,
        purchaseId,
      );

    if (!purchase) {
      throw new Error(
        "Purchase not found.",
      );
    }

    if (
      purchase.status !== "DRAFT" &&
      purchase.status !== "ORDERED"
    ) {
      throw new Error(
        "Only draft or ordered purchases can be cancelled.",
      );
    }

    return purchaseRepository.cancelPurchase(
      businessId,
      purchaseId,
    );
  },



  };