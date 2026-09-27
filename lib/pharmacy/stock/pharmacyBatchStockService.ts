import { prisma } from "@/lib/database/prisma";
import { Prisma } from "@/generated/prisma/client";
import { PharmacyFefoService } from "../fefo/pharmacyFefoService";

export interface PharmacyBatchStockAllocationInput {
  businessId: string;
  productId: string;
  warehouseId: string;
  quantity: Prisma.Decimal;
  createdBy: string;
  operationId: string;
  referenceType: string;
  referenceId: string;
  currency: string;
  unitCost?: Prisma.Decimal;
  notes?: string;
}

export const pharmacyBatchStockService = {
  async allocate(input: PharmacyBatchStockAllocationInput) {
    if (!input.businessId) {
      throw new Error("Business context is required.");
    }

    if (!input.productId) {
      throw new Error("Product is required.");
    }

    if (!input.warehouseId) {
      throw new Error("Warehouse is required.");
    }

    if (input.quantity.lessThanOrEqualTo(0)) {
      throw new Error("Allocation quantity must be greater than zero.");
    }

    if (!input.createdBy) {
      throw new Error("User context is required.");
    }

    if (!input.operationId) {
      throw new Error("Operation ID is required.");
    }

    if (!input.referenceType) {
      throw new Error("Reference type is required.");
    }

    if (!input.referenceId) {
      throw new Error("Reference ID is required.");
    }

    if (!input.currency) {
      throw new Error("Currency is required.");
    }

    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await prisma.$transaction(
          async (tx) => {
			  
			  const existingOperation = await tx.operationRequest.findUnique({
  where: {
    businessId_operationId: {
      businessId: input.businessId,
      operationId: input.operationId,
    },
  },
});

if (existingOperation) {
  if (
    existingOperation.status === "COMPLETED" &&
    existingOperation.response
  ) {
    return existingOperation.response;
  }

  if (existingOperation.status === "PROCESSING") {
    throw new Error(
      "This pharmacy stock operation is already being processed.",
    );
  }

  throw new Error(
    "This pharmacy stock operation has already been recorded.",
  );
}


const operation = await tx.operationRequest.create({
  data: {
    businessId: input.businessId,
    operationId: input.operationId,
    operation: "PHARMACY_BATCH_ALLOCATION",
    status: "PROCESSING",
    entityType: "INVENTORY_MOVEMENT",
    createdBy: input.createdBy,
  },
});
            /*
             * 1. Verify the product belongs to the business.
             */
            const product = await tx.product.findFirst({
              where: {
                id: input.productId,
                businessId: input.businessId,
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

            /*
             * 2. Verify warehouse ownership.
             */
            const warehouse = await tx.warehouse.findFirst({
              where: {
                id: input.warehouseId,
                businessId: input.businessId,
                isActive: true,
              },
              select: {
                id: true,
              },
            });

            if (!warehouse) {
              throw new Error(
                "Warehouse does not belong to the current business or is inactive.",
              );
            }

            /*
             * 3. Load eligible batches.
             */
            const batches = await tx.pharmacyBatch.findMany({
              where: {
                warehouseId: input.warehouseId,
                pharmacyProduct: {
                  productId: input.productId,
                },
                isRecalled: false,
                expiryDate: {
                  gt: new Date(),
                },
                quantityRemaining: {
                  gt: 0,
                },
              },
              orderBy: [
                {
                  expiryDate: "asc",
                },
                {
                  createdAt: "asc",
                },
              ],
            });

            if (batches.length === 0) {
              throw new Error(
                "No eligible non-expired pharmacy batches are available.",
              );
            }

            /*
             * 4. FEFO allocation.
             */
            const allocations = PharmacyFefoService.allocate(
              batches,
              input.quantity,
            );

            /*
             * 5. Verify existing inventory.
             */
            const inventoryBalance =
              await tx.inventoryBalance.findUnique({
                where: {
                  productId_warehouseId: {
                    productId: input.productId,
                    warehouseId: input.warehouseId,
                  },
                },
              });

            if (!inventoryBalance) {
              throw new Error(
                "No inventory balance exists for this product and warehouse.",
              );
            }

            if (
              inventoryBalance.quantity.lessThan(input.quantity)
            ) {
              throw new Error(
                "Insufficient inventory stock for pharmacy allocation.",
              );
            }

            const previousQuantity =
              inventoryBalance.quantity;

            const newQuantity =
              previousQuantity.minus(input.quantity);

            /*
             * 6. Update each batch atomically.
             */
            for (const allocation of allocations) {
              const updated =
                await tx.pharmacyBatch.updateMany({
                  where: {
                    id: allocation.batchId,
                    warehouseId: input.warehouseId,
                    quantityRemaining: {
                      gte: allocation.quantity,
                    },
                    isRecalled: false,
                    expiryDate: {
                      gt: new Date(),
                    },
                  },
                  data: {
                    quantityRemaining: {
                      decrement: allocation.quantity,
                    },
                  },
                });

              if (updated.count !== 1) {
                throw new Error(
                  `Pharmacy batch ${allocation.batchNumber} could not be allocated safely.`,
                );
              }
            }

            /*
             * 7. Create the authoritative inventory movement.
             */
            const unitCost =
              input.unitCost ??
              inventoryBalance.averageCost;

            const movement =
              await tx.inventoryMovement.create({
                data: {
                  businessId: input.businessId,
                  productId: input.productId,
                  warehouseId: input.warehouseId,
                  type: "SALE",
                  quantity: input.quantity.negated(),
                  unitCost,
                  totalCost: input.quantity
                    .times(unitCost)
                    .negated(),
                  referenceType: input.referenceType,
                  referenceId: input.referenceId,
                  notes:
                    input.notes ??
                    "Pharmacy FEFO stock allocation",
                  createdBy: input.createdBy,
                },
              });

            /*
             * 8. Update the authoritative inventory balance.
             */
            const balance =
              await tx.inventoryBalance.update({
                where: {
                  productId_warehouseId: {
                    productId: input.productId,
                    warehouseId: input.warehouseId,
                  },
                },
                data: {
                  quantity: newQuantity,
                },
              });
			  
			  await tx.operationRequest.update({
  where: {
    id: operation.id,
  },
  data: {
    status: "COMPLETED",
    entityId: movement.id,
    response: {
      movementId: movement.id,
      productId: input.productId,
      warehouseId: input.warehouseId,
      requestedQuantity: input.quantity.toString(),
      allocations: allocations.map((allocation) => ({
        batchId: allocation.batchId,
        batchNumber: allocation.batchNumber,
        quantity: allocation.quantity.toString(),
        expiryDate: allocation.expiryDate.toISOString(),
      })),
      referenceType: input.referenceType,
      referenceId: input.referenceId,
    },
  },
});

            return {
              movementId: movement.id,
              productId: input.productId,
              warehouseId: input.warehouseId,
              requestedQuantity: input.quantity,
              previousInventoryQuantity: previousQuantity,
              newInventoryQuantity: newQuantity,
              allocations,
              referenceType: input.referenceType,
              referenceId: input.referenceId,
              balance,
            };
          },
          {
            isolationLevel: "Serializable",
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

        throw error;
      }
    }

    throw new Error(
      "Pharmacy stock allocation failed after maximum retry attempts.",
    );
  },
};