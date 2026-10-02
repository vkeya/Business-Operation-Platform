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
import {
  pharmacyBatchReceivingService,
} from "@/lib/pharmacy/receiving/pharmacyBatchReceivingService";
import { Prisma } from "@/generated/prisma/client";
import {
  recordAuditEvent,
} from "@/lib/audit/auditService";

import {
  AUDIT_ACTIONS,
} from "@/lib/audit/auditActions";

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

		  await recordAuditEvent(
           {
             businessId: input.businessId,
             actorId: input.createdBy,
             action:
               AUDIT_ACTIONS.PURCHASE_CREATED,
             category: "PURCHASES",
             severity: "INFO",
             outcome: "SUCCESS",
             entityType: "PURCHASE",
             entityId: purchase.id,
             afterData: {
               status: purchase.status,
               referenceNumber:
                 purchase.referenceNumber,
             },
             metadata: {
               supplierId: input.supplierId,
               warehouseId: input.warehouseId,
               currency: input.currency,
               itemCount: input.items.length,
             },
           },
           tx,
         );

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
  pharmacyBatches: Array<{
    purchaseItemId: string;
    productId: string;
    batchNumber: string;
    expiryDate: Date;
    manufacturingDate?: Date;
    quantity: Prisma.Decimal;
    unitCost: Prisma.Decimal;
  }> = [],
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

  const operationId =
    `PURCHASE_RECEIVE:${purchaseId}`;

  const maxAttempts = 3;

for (
  let attempt = 1;
  attempt <= maxAttempts;
  attempt++
) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        // existing receive workflow

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

          const existingOperation =
            await tx.operationRequest.findUnique({
              where: {
                businessId_operationId: {
                  businessId,
                  operationId,
                },
              },
            });

          if (existingOperation) {
            if (
              existingOperation.status === "COMPLETED" &&
              existingOperation.entityId
            ) {
              const existingPurchase =
                await tx.purchase.findFirst({
                  where: {
                    id: existingOperation.entityId,
                    businessId,
                  },
                  include: {
                    supplier: true,
                    items: true,
                  },
                });

              if (existingPurchase) {
                return existingPurchase;
              }
            }

            if (
              existingOperation.status ===
              "PROCESSING"
            ) {
              throw new Error(
                "This purchase receiving operation is already being processed.",
              );
            }
          }

          if (purchase.status !== "ORDERED") {
            throw new Error(
              "Only ordered purchases can be received.",
            );
          }

          await tx.operationRequest.create({
            data: {
              businessId,
              operationId,
              operation: "PURCHASE_RECEIVE",
              status: "PROCESSING",
              entityType: "PURCHASE",
              entityId: purchaseId,
              createdBy: purchase.createdBy,
            },
          });

          const receivedPurchase =
            await purchaseRepository.receivePurchaseWithClient(
              businessId,
              purchaseId,
              tx,
            );

          if (pharmacyBatches.length > 0) {
            await pharmacyBatchReceivingService.receive(
              {
                businessId,
                purchaseId,
                warehouseId:
                  purchase.warehouseId!,
                supplierId:
                  purchase.supplierId,
                createdBy:
                  purchase.createdBy,
                batches: pharmacyBatches,
              },
              tx,
            );
          }

          await postPurchaseToAccounting({
            businessId:
              purchase.businessId,
            purchaseId:
              purchase.id,
            referenceNumber:
              purchase.referenceNumber,
            subtotal:
              purchase.subtotal.toNumber(),
            discountAmount:
              purchase.discountAmount.toNumber(),
            taxAmount:
              purchase.taxAmount.toNumber(),
            totalAmount:
              purchase.totalAmount.toNumber(),
            currency:
              purchase.currency,
            createdBy:
              purchase.createdBy,
            client: tx,
          });

		  await recordAuditEvent(
            {
              businessId,
              actorId: purchase.createdBy,
              action:
                AUDIT_ACTIONS.PURCHASE_RECEIVED,
              category: "PURCHASES",
              severity: "INFO",
              outcome: "SUCCESS",
              entityType: "PURCHASE",
              entityId: purchaseId,
              afterData: {
                status: "RECEIVED",
              },
              metadata: {
                purchaseReference:
                  purchase.referenceNumber,
                pharmacyBatchCount:
                  pharmacyBatches.length,
              },
            },
            tx,
          );

          await tx.operationRequest.update({
            where: {
              businessId_operationId: {
                businessId,
                operationId,
              },
            },
            data: {
              status: "COMPLETED",
              entityType: "PURCHASE",
              entityId: purchaseId,
              response: {
                purchaseId,
                status: "RECEIVED",
              },
            },
          });

          return receivedPurchase;

      },
      {
        isolationLevel: "Serializable",
        timeout: 15000,
      },
    );
  } catch (error: unknown) {
    const prismaError = error as {
      code?: string;
    };

    if (
      prismaError.code === "P2034" &&
      attempt < maxAttempts
    ) {
      continue;
    }

    if (prismaError.code === "P2002") {
      const existingOperation =
        await prisma.operationRequest.findUnique({
          where: {
            businessId_operationId: {
              businessId,
              operationId,
            },
          },
        });

      if (
        existingOperation?.status === "COMPLETED"
      ) {
        const receivedPurchase =
          await purchaseRepository.findById(
            businessId,
            purchaseId,
          );

        if (receivedPurchase) {
          return receivedPurchase;
        }
      }
    }

    throw error;
  }
 }
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

  return prisma.$transaction(
    async (tx) => {
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

      if (
        purchase.status !== "DRAFT" &&
        purchase.status !== "ORDERED"
      ) {
        throw new Error(
          "Only draft or ordered purchases can be cancelled.",
        );
      }

      const cancelledPurchase =
        await tx.purchase.update({
          where: {
            id: purchaseId,
            businessId,
          },
          data: {
            status: "CANCELLED",
          },
          include: {
            supplier: true,
            items: true,
          },
        });

      await recordAuditEvent(
        {
          businessId,
          actorId: purchase.createdBy,
          action:
            AUDIT_ACTIONS.PURCHASE_CANCELLED,
          category: "PURCHASES",
          severity: "WARNING",
          outcome: "SUCCESS",
          entityType: "PURCHASE",
          entityId: purchaseId,
          beforeData: {
            status: purchase.status,
            referenceNumber:
              purchase.referenceNumber,
          },
          afterData: {
            status:
              cancelledPurchase.status,
            referenceNumber:
              cancelledPurchase.referenceNumber,
          },
          metadata: {
            purchaseReference:
              purchase.referenceNumber,
          },
        },
        tx,
      );

      return cancelledPurchase;
    },
    {
      isolationLevel: "Serializable",
      timeout: 15000,
    },
  );
},
};