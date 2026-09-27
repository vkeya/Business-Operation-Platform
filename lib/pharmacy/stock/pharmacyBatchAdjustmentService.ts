import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

export type PharmacyBatchAdjustmentType =
  | "ADJUSTMENT"
  | "DAMAGE"
  | "EXPIRY";

export interface PharmacyBatchAdjustmentInput {
  businessId: string;
  pharmacyBatchId: string;
  quantity: Prisma.Decimal;
  type: PharmacyBatchAdjustmentType;
  operationId: string;
  createdBy: string;
  reason: string;
  notes?: string;
}

export const pharmacyBatchAdjustmentService = {
  async adjust(
    input: PharmacyBatchAdjustmentInput,
    client?: PrismaTransactionClient,
  ) {
    if (!input.businessId) {
      throw new Error("Business context is required.");
    }

    if (!input.pharmacyBatchId) {
      throw new Error("Pharmacy batch is required.");
    }

    if (!input.operationId?.trim()) {
      throw new Error("Operation ID is required.");
    }

    if (!input.createdBy) {
      throw new Error("User context is required.");
    }

    if (input.quantity.lessThanOrEqualTo(0)) {
      throw new Error(
        "Adjustment quantity must be greater than zero.",
      );
    }

    if (!input.reason?.trim()) {
      throw new Error(
        "A reason is required for pharmacy stock adjustment.",
      );
    }

    const execute = async (
      tx: PrismaTransactionClient,
    ) => {
		
	  await requireBusinessPermission(
        input.createdBy,
        input.businessId,
        "pharmacy.batch_adjust",
        tx,
    );

      const existingOperation =
        await tx.operationRequest.findUnique({
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

        if (
          existingOperation.status === "PROCESSING"
        ) {
          throw new Error(
            "This pharmacy batch adjustment is already being processed.",
          );
        }

        throw new Error(
          "This pharmacy batch adjustment has already been recorded.",
        );
      }

      const operation =
        await tx.operationRequest.create({
          data: {
            businessId: input.businessId,
            operationId: input.operationId,
            operation: "PHARMACY_BATCH_ADJUSTMENT",
            status: "PROCESSING",
            entityType: "INVENTORY_MOVEMENT",
            createdBy: input.createdBy,
          },
        });

      const batch =
        await tx.pharmacyBatch.findFirst({
          where: {
            id: input.pharmacyBatchId,
            warehouse: {
              businessId: input.businessId,
            },
          },
          select: {
            id: true,
            pharmacyProductId: true,
            warehouseId: true,
            batchNumber: true,
            quantityReceived: true,
            quantityRemaining: true,
            unitCost: true,
            isRecalled: true,
            expiryDate: true,
            pharmacyProduct: {
              select: {
                productId: true,
              },
            },
          },
        });

      if (!batch) {
        throw new Error(
          "Pharmacy batch does not belong to the current business.",
        );
      }

      if (
        input.type === "EXPIRY" &&
        batch.expiryDate > new Date()
      ) {
        throw new Error(
          "An expiry adjustment can only be recorded for an expired batch.",
        );
      }

      if (
        input.type === "DAMAGE" &&
        batch.quantityRemaining.lessThan(
          input.quantity,
        )
      ) {
        throw new Error(
          "Damage quantity exceeds the remaining batch quantity.",
        );
      }

      if (
        input.type === "EXPIRY" &&
        batch.quantityRemaining.lessThan(
          input.quantity,
        )
      ) {
        throw new Error(
          "Expiry quantity exceeds the remaining batch quantity.",
        );
      }

      const inventoryBalance =
        await tx.inventoryBalance.findUnique({
          where: {
            productId_warehouseId: {
              productId:
                batch.pharmacyProduct.productId,
              warehouseId: batch.warehouseId,
            },
          },
        });

      if (!inventoryBalance) {
        throw new Error(
          "Inventory balance does not exist for this pharmacy product and warehouse.",
        );
      }

      if (
        inventoryBalance.quantity.lessThan(
          input.quantity,
        )
      ) {
        throw new Error(
          "Inventory quantity is insufficient for this pharmacy batch adjustment.",
        );
      }

      const result =
        await tx.pharmacyBatch.updateMany({
          where: {
            id: batch.id,
            warehouseId: batch.warehouseId,
            quantityRemaining: {
              gte: input.quantity,
            },
          },
          data: {
            quantityRemaining: {
              decrement: input.quantity,
            },
          },
        });

      if (result.count !== 1) {
        throw new Error(
          `Unable to adjust pharmacy batch ${batch.batchNumber}. Stock may have changed.`,
        );
      }

      const movementType =
        input.type === "DAMAGE"
          ? "DAMAGE"
          : input.type === "EXPIRY"
            ? "EXPIRY"
            : "ADJUSTMENT";

      const unitCost =
        batch.unitCost ??
        inventoryBalance.averageCost;

      const movement =
        await tx.inventoryMovement.create({
          data: {
            businessId: input.businessId,
            productId:
              batch.pharmacyProduct.productId,
            warehouseId: batch.warehouseId,
            type: movementType,
            quantity: input.quantity.negated(),
            unitCost,
            totalCost: input.quantity
              .mul(unitCost)
              .negated(),
            referenceType:
              "PHARMACY_BATCH_ADJUSTMENT",
            referenceId: batch.id,
            createdBy: input.createdBy,
            notes: [
              `Batch: ${batch.batchNumber}`,
              `Reason: ${input.reason.trim()}`,
              input.notes?.trim()
                ? `Notes: ${input.notes.trim()}`
                : null,
            ]
              .filter(Boolean)
              .join(" | "),
          },
        });

      const updatedBalance =
        await tx.inventoryBalance.update({
          where: {
            productId_warehouseId: {
              productId:
                batch.pharmacyProduct.productId,
              warehouseId: batch.warehouseId,
            },
          },
          data: {
            quantity: {
              decrement: input.quantity,
            },
          },
        });

      const response = {
        movementId: movement.id,
        pharmacyBatchId: batch.id,
        batchNumber: batch.batchNumber,
        productId:
          batch.pharmacyProduct.productId,
        warehouseId: batch.warehouseId,
        type: input.type,
        quantity: input.quantity.toString(),
        remainingQuantity:
          batch.quantityRemaining
            .sub(input.quantity)
            .toString(),
        reason: input.reason.trim(),
      };

      await tx.operationRequest.update({
        where: {
          id: operation.id,
        },
        data: {
          status: "COMPLETED",
          entityId: movement.id,
          response,
        },
      });

      return response;
    };

    if (client) {
      return execute(client);
    }

    const maxAttempts = 3;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        return await prisma.$transaction(
          execute,
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
      "Unable to complete pharmacy batch adjustment.",
    );
  },
};