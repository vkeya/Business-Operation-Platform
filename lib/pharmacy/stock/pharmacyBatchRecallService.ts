import { prisma } from "@/lib/database/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";

export interface PharmacyBatchRecallInput {
  businessId: string;
  pharmacyBatchId: string;
  operationId: string;
  createdBy: string;
  reason: string;
}

export const pharmacyBatchRecallService = {
  async recall(input: PharmacyBatchRecallInput) {
    if (!input.businessId) {
      throw new Error("Business is required.");
    }

    if (!input.pharmacyBatchId) {
      throw new Error("Pharmacy batch is required.");
    }

    if (!input.operationId) {
      throw new Error("Operation ID is required.");
    }

    if (!input.createdBy) {
      throw new Error("User is required.");
    }

    const reason = input.reason.trim();

    if (!reason) {
      throw new Error("A recall reason is required.");
    }
	
	await requireBusinessPermission(
      input.createdBy,
      input.businessId,
      "pharmacy.batch_recall",
    );

    for (let attempt = 0; attempt < 3; attempt++) {
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
              return existingOperation.response;
            }

            const batch =
              await tx.pharmacyBatch.findFirst({
                where: {
                  id: input.pharmacyBatchId,
                  pharmacyProduct: {
                    product: {
                      businessId: input.businessId,
                    },
                  },
                },
                select: {
                  id: true,
                  batchNumber: true,
                  isRecalled: true,
                  recallReason: true,
                  quantityRemaining: true,
                  pharmacyProduct: {
                    select: {
                      id: true,
                      product: {
                        select: {
                          id: true,
                          name: true,
                          sku: true,
                        },
                      },
                    },
                  },
                  warehouse: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              });

            if (!batch) {
              throw new Error(
                "Pharmacy batch not found.",
              );
            }

            if (batch.isRecalled) {
              throw new Error(
                `Batch ${batch.batchNumber} is already recalled.`,
              );
            }

            const recalledBatch =
              await tx.pharmacyBatch.updateMany({
                where: {
                  id: batch.id,
                  isRecalled: false,
                },
                data: {
                  isRecalled: true,
                  recallReason: reason,
                },
              });

            if (recalledBatch.count !== 1) {
              throw new Error(
                "The batch recall could not be completed because the batch was changed by another operation.",
              );
            }

            const response = {
              pharmacyBatchId: batch.id,
              batchNumber: batch.batchNumber,
              productId:
                batch.pharmacyProduct.product.id,
              productName:
                batch.pharmacyProduct.product.name,
              sku: batch.pharmacyProduct.product.sku,
              warehouseId: batch.warehouse.id,
              warehouseName: batch.warehouse.name,
              quantityRemaining:
                batch.quantityRemaining.toString(),
              reason,
              recalledBy: input.createdBy,
              recalledAt: new Date().toISOString(),
            };

            if (existingOperation) {
              await tx.operationRequest.update({
                where: {
                  id: existingOperation.id,
                },
                data: {
                  status: "COMPLETED",
                  response,
                },
              });
            } else {
              await tx.operationRequest.create({
               data: {
                 businessId: input.businessId,
                 operationId: input.operationId,
                 operation: "PHARMACY_BATCH_RECALL",
                 createdBy: input.createdBy,
                 status: "COMPLETED",
                 response,
               },
             });
            }

            return response;
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034" &&
          attempt < 2
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new Error(
      "Unable to complete pharmacy batch recall.",
    );
  },
};