import { Prisma } from "@/generated/prisma/client";
import { PharmacyFefoService } from "@/lib/pharmacy/fefo/pharmacyFefoService";
import {
  pharmacyDispensingPolicyService,
} from "@/lib/pharmacy/compliance/pharmacyDispensingPolicyService";
import {
  generateBusinessReference,
} from "@/lib/business/reference/referenceGenerator";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";

type PrismaTransactionClient = Parameters<
  typeof import("@/lib/database/prisma").prisma.$transaction
>[0] extends (client: infer T) => unknown
  ? T
  : never;

export interface PharmacyDispensingInput {
  businessId: string;
  productId: string;
  warehouseId: string;
  quantity: Prisma.Decimal;
  operationId: string;
  createdBy: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  unitCost?: Prisma.Decimal;
  saleItemId?: string;
  customerId?: string;
  hasPrescription?: boolean;
  prescriptionId?: string;
  prescriptionItemId?: string;
  pharmacistName?: string;
  pharmacistLicense?: string;
  registerReference?: string;
  reason?: string;
}

export const pharmacyDispensingService = {
  async dispense(
    input: PharmacyDispensingInput,
    tx: PrismaTransactionClient,
  ) {
    if (!input.businessId) {
      throw new Error("Business context is required.");
    }

    if (!input.productId) {
      throw new Error("Product is required.");
    }

    if (!input.warehouseId) {
      throw new Error("Warehouse is required.");
    }

    if (!input.operationId?.trim()) {
      throw new Error("Operation ID is required.");
    }

    if (!input.createdBy) {
      throw new Error("User context is required.");
    }

    if (input.quantity.lessThanOrEqualTo(0)) {
      throw new Error(
        "Dispensing quantity must be greater than zero.",
      );
    }

    /*
     * Idempotency
     */
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

      if (existingOperation.status === "PROCESSING") {
        throw new Error(
          "This pharmacy dispensing operation is already being processed.",
        );
      }

      throw new Error(
        "This pharmacy dispensing operation has already been recorded.",
      );
    }

    const operation =
      await tx.operationRequest.create({
        data: {
          businessId: input.businessId,
          operationId: input.operationId,
          operation: "PHARMACY_DISPENSING",
          status: "PROCESSING",
          entityType: "INVENTORY_MOVEMENT",
          createdBy: input.createdBy,
        },
      });

    /*
     * Validate warehouse.
     */
    const warehouse =
      await tx.warehouse.findFirst({
        where: {
          id: input.warehouseId,
          businessId: input.businessId,
        },
        select: {
          id: true,
        },
      });

    if (!warehouse) {
      throw new Error(
        "Warehouse does not belong to the current business.",
      );
    }

    /*
     * Validate pharmacy product.
     */
    const pharmacyProduct =
      await tx.pharmacyProduct.findUnique({
        where: {
          productId: input.productId,
        },
        select: {
          id: true,
          status: true,
          prescriptionType: true,
          medicineType: true,
        },
      });

    if (!pharmacyProduct) {
      throw new Error(
        "Product is not configured as a pharmacy product.",
      );
    }

    if (pharmacyProduct.status !== "ACTIVE") {
      throw new Error(
        "Pharmacy product is not active.",
      );
    }
	
	/*
 * Validate prescription requirements.
 */
let prescriptionItem:
  | {
      id: string;
      prescriptionId: string;
      productId: string;
      quantityPrescribed: Prisma.Decimal;
      quantityDispensed: Prisma.Decimal;
    }
  | null = null;

if (
  pharmacyProduct.prescriptionType === "OTC"
) {
  pharmacyDispensingPolicyService.validate({
    prescriptionType:
      pharmacyProduct.prescriptionType,
    hasPrescription: false,
  });
} else {
  if (
    !input.prescriptionId ||
    !input.prescriptionItemId
  ) {
    throw new Error(
      "A valid prescription is required before dispensing this medicine.",
    );
  }

  pharmacyDispensingPolicyService.validate({
    prescriptionType:
      pharmacyProduct.prescriptionType,
    hasPrescription: true,
  });

  const prescription =
    await tx.pharmacyPrescription.findFirst({
      where: {
        id: input.prescriptionId,
        businessId: input.businessId,
      },
      select: {
        id: true,
        status: true,
        expiryDate: true,
      },
    });

  if (!prescription) {
    throw new Error(
      "Prescription does not belong to the current business.",
    );
  }

  if (
    prescription.status === "CANCELLED"
  ) {
    throw new Error(
      "This prescription has been cancelled.",
    );
  }

  if (
    prescription.status === "EXPIRED"
  ) {
    throw new Error(
      "This prescription has expired.",
    );
  }

  if (
    prescription.expiryDate &&
    prescription.expiryDate <= new Date()
  ) {
    throw new Error(
      "This prescription has expired.",
    );
  }

  prescriptionItem =
    await tx.pharmacyPrescriptionItem.findFirst({
      where: {
        id: input.prescriptionItemId,
        prescriptionId:
          input.prescriptionId,
        productId:
          input.productId,
      },
      select: {
        id: true,
        prescriptionId: true,
        productId: true,
        quantityPrescribed: true,
        quantityDispensed: true,
      },
    });

  if (!prescriptionItem) {
    throw new Error(
      "Prescription item does not match the medicine being dispensed.",
    );
  }

  const remainingQuantity =
    prescriptionItem.quantityPrescribed.sub(
      prescriptionItem.quantityDispensed,
    );

  if (
    remainingQuantity.lessThanOrEqualTo(0)
  ) {
    throw new Error(
      "The prescribed quantity has already been fully dispensed.",
    );
  }

  if (
    input.quantity.greaterThan(
      remainingQuantity,
    )
  ) {
    throw new Error(
      `Dispensing quantity exceeds the remaining prescribed quantity of ${remainingQuantity.toString()}.`,
    );
  }
}
	
	

    /*
     * Load eligible batches for this product
     * and warehouse.
     */
    const batches =
      await tx.pharmacyBatch.findMany({
        where: {
          pharmacyProductId:
            pharmacyProduct.id,

          warehouseId:
            input.warehouseId,

          isRecalled: false,

          expiryDate: {
            gt: new Date(),
          },

          quantityRemaining: {
            gt: 0,
          },
        },

        select: {
          id: true,
          batchNumber: true,
          expiryDate: true,
          quantityRemaining: true,
          isRecalled: true,
        },

        orderBy: {
          expiryDate: "asc",
        },
      });

    /*
     * FEFO allocation.
     */
    const allocations =
      PharmacyFefoService.allocate(
        batches,
        input.quantity,
      );

    /*
     * Verify aggregate inventory.
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
        "Inventory balance does not exist for this product and warehouse.",
      );
    }

    if (
      inventoryBalance.quantity.lessThan(
        input.quantity,
      )
    ) {
      throw new Error(
        "Insufficient inventory quantity.",
      );
    }

    /*
     * Deduct each FEFO batch.
     */
	 
	/*
 * Prepare controlled-dispensing authorization once.
 */
let controlledRegisterReference: string | undefined;
let dispensingUser: {
  id: string;
  name: string | null;
  email: string | null;
} | null = null;

if (
  pharmacyProduct.prescriptionType ===
  "CONTROLLED"
) {
  await requireBusinessPermission(
    input.createdBy,
    input.businessId,
    "pharmacy.controlled_dispense",
    tx,
  );

  if (!input.saleItemId) {
    throw new Error(
      "Controlled medicine dispensing requires a sale item.",
    );
  }

  if (!input.referenceId) {
    throw new Error(
      "Controlled medicine dispensing requires a sale reference.",
    );
  }

  if (!input.prescriptionId) {
    throw new Error(
      "Controlled medicine dispensing requires a prescription.",
    );
  }

  controlledRegisterReference =
    input.registerReference?.trim() ||
    await generateBusinessReference({
      businessId: input.businessId,
      referenceType:
        "PHARMACY_CONTROLLED_DISPENSING",
      prefix: "CTRL",
      client: tx,
    });

  dispensingUser =
    await tx.user.findUnique({
      where: {
        id: input.createdBy,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

  if (!dispensingUser) {
    throw new Error(
      "The dispensing user could not be verified.",
    );
  }
}

/*
 * Deduct each FEFO batch.
 */
let controlledDispensedQuantity =
  new Prisma.Decimal(0);

for (const allocation of allocations) {
  const result =
    await tx.pharmacyBatch.updateMany({
      where: {
        id: allocation.batchId,

        warehouseId:
          input.warehouseId,

        isRecalled: false,

        expiryDate: {
          gt: new Date(),
        },

        quantityRemaining: {
          gte: allocation.quantity,
        },
      },

      data: {
        quantityRemaining: {
          decrement:
            allocation.quantity,
        },
      },
    });

  if (result.count !== 1) {
    throw new Error(
      `Unable to allocate pharmacy batch ${allocation.batchNumber}. Stock may have changed.`,
    );
  }

  if (
    pharmacyProduct.prescriptionType ===
      "CONTROLLED" &&
    dispensingUser &&
    controlledRegisterReference
  ) {
    controlledDispensedQuantity =
      controlledDispensedQuantity.add(
        allocation.quantity,
      );

    await tx.pharmacyControlledDispensingRecord.create(
      {
        data: {
          businessId:
            input.businessId,

          saleId:
            input.referenceId!,

          saleItemId:
            input.saleItemId!,

          pharmacyProductId:
            pharmacyProduct.id,

          pharmacyBatchId:
            allocation.batchId,

          prescriptionId:
            input.prescriptionId,

          prescriptionItemId:
            input.prescriptionItemId,

          customerId:
            input.customerId,

          quantity:
            allocation.quantity,

          dispensedBy:
            input.createdBy,

          pharmacistName:
            dispensingUser.name ??
            dispensingUser.email,

          pharmacistLicense:
            input.pharmacistLicense,

          registerReference:
            controlledRegisterReference,

          reason:
            input.reason,

          status: "DISPENSED",
        },
      },
    );
  }
}

/*
 * Verify controlled dispensing reconciles
 * exactly to the requested quantity.
 */
if (
  pharmacyProduct.prescriptionType ===
    "CONTROLLED" &&
  !controlledDispensedQuantity.equals(
    input.quantity,
  )
) {
  throw new Error(
    "Controlled dispensing quantity does not reconcile with the requested quantity.",
  );
}

    /*
     * Determine inventory cost.
     */
    const unitCost =
      input.unitCost ??
      inventoryBalance.averageCost;

    const totalCost =
      unitCost.mul(input.quantity);
	  
	 

    /*
     * Record the existing SmatPic SALE movement.
     *
     * Negative quantity represents stock leaving
     * inventory.
     */
    const movement =
      await tx.inventoryMovement.create({
        data: {
          businessId:
            input.businessId,

          productId:
            input.productId,

          warehouseId:
            input.warehouseId,

          type: "SALE",

          quantity:
            input.quantity.negated(),

          unitCost,

          totalCost:
            totalCost.negated(),

          referenceType:
            input.referenceType ??
            "PHARMACY_DISPENSING",

          referenceId:
            input.referenceId,

          createdBy:
            input.createdBy,

          notes:
            input.notes ??
            "Pharmacy FEFO dispensing",
        },
      });

    /*
     * Update aggregate inventory.
     */
    await tx.inventoryBalance.update({
      where: {
        productId_warehouseId: {
          productId:
            input.productId,

          warehouseId:
            input.warehouseId,
        },
      },

      data: {
        quantity: {
          decrement:
            input.quantity,
        },
      },
    });
	
	/*
 * Update prescription dispensing quantity.
 */
/*
 * Update prescription dispensing quantity
 * with a guarded write.
 *
 * The WHERE clause requires the quantity to
 * still be exactly what we originally read.
 * This prevents a stale concurrent request
 * from overwriting a newer dispensing update.
 */
if (prescriptionItem) {
  const previousQuantityDispensed =
    prescriptionItem.quantityDispensed;

  const newQuantityDispensed =
    previousQuantityDispensed.add(
      input.quantity,
    );

  if (
    newQuantityDispensed.greaterThan(
      prescriptionItem.quantityPrescribed,
    )
  ) {
    throw new Error(
      "Dispensing quantity exceeds the remaining prescribed quantity.",
    );
  }

  const fullyDispensed =
    newQuantityDispensed.equals(
      prescriptionItem.quantityPrescribed,
    );

  const prescriptionUpdate =
    await tx.pharmacyPrescriptionItem.updateMany({
      where: {
        id: prescriptionItem.id,

        prescriptionId:
          prescriptionItem.prescriptionId,

        productId:
          prescriptionItem.productId,

        quantityDispensed:
          previousQuantityDispensed,
      },

      data: {
        quantityDispensed:
          newQuantityDispensed,
      },
    });

  if (prescriptionUpdate.count !== 1) {
    throw new Error(
      "Prescription quantity changed while dispensing. Please retry the dispensing operation.",
    );
  }

  const prescriptionItems =
  await tx.pharmacyPrescriptionItem.findMany({
    where: {
      prescriptionId:
        prescriptionItem.prescriptionId,
    },
    select: {
      quantityPrescribed: true,
      quantityDispensed: true,
    },
  });

const allFullyDispensed =
  prescriptionItems.length > 0 &&
  prescriptionItems.every((item) =>
    item.quantityDispensed.equals(
      item.quantityPrescribed,
    ),
  );

const anyDispensed =
  prescriptionItems.some((item) =>
    item.quantityDispensed.greaterThan(0),
  );

await tx.pharmacyPrescription.update({
  where: {
    id: prescriptionItem.prescriptionId,
  },
  data: {
    status: allFullyDispensed
      ? "FULLY_DISPENSED"
      : anyDispensed
        ? "PARTIALLY_DISPENSED"
        : "ACTIVE",
  },
});
}

    /*
     * Complete idempotency record.
     */
    const response = {
      movementId: movement.id,

      productId:
        input.productId,

      warehouseId:
        input.warehouseId,
		
	  saleItemId:
        input.saleItemId,

      quantity:
        input.quantity.toString(),

      prescriptionType:
        pharmacyProduct.prescriptionType,

      medicineType:
        pharmacyProduct.medicineType,
		
	  prescriptionId:
        input.prescriptionId,

      prescriptionItemId:
        input.prescriptionItemId,

      allocations:
        allocations.map(
          (allocation) => ({
            batchId:
              allocation.batchId,

            batchNumber:
              allocation.batchNumber,

            quantity:
              allocation.quantity.toString(),

            expiryDate:
              allocation.expiryDate.toISOString(),
          }),
        ),
    };

    await tx.operationRequest.update({
      where: {
        id: operation.id,
      },

      data: {
        status: "COMPLETED",

        entityId:
          movement.id,

        response,
      },
    });

    return response;
  },
};