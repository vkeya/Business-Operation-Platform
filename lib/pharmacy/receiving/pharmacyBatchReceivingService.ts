import { Prisma } from "@/generated/prisma/client";

export interface PharmacyBatchReceivingInput {
  businessId: string;
  purchaseId: string;
  warehouseId: string;
  supplierId: string;
  createdBy: string;
  batches: Array<{
    purchaseItemId: string;
    productId: string;
    batchNumber: string;
    expiryDate: Date;
    manufacturingDate?: Date;
    quantity: Prisma.Decimal;
    unitCost: Prisma.Decimal;
  }>;
}

type PrismaTransactionClient = Parameters<
  typeof import("@/lib/database/prisma").prisma.$transaction
>[0] extends (client: infer T) => unknown
  ? T
  : never;

export const pharmacyBatchReceivingService = {
  async receive(
    input: PharmacyBatchReceivingInput,
    tx: PrismaTransactionClient,
  ) {
    if (!input.businessId) {
      throw new Error("Business context is required.");
    }

    if (!input.purchaseId) {
      throw new Error("Purchase is required.");
    }

    if (!input.warehouseId) {
      throw new Error("Receiving warehouse is required.");
    }

    if (!input.supplierId) {
      throw new Error("Supplier is required.");
    }

    if (!input.createdBy) {
      throw new Error("User context is required.");
    }

    const now = new Date();

const purchase = await tx.purchase.findFirst({
  where: {
    id: input.purchaseId,
    businessId: input.businessId,
  },
  select: {
    id: true,
    businessId: true,
    warehouseId: true,
    supplierId: true,
  },
});

if (!purchase) {
  throw new Error("Purchase not found.");
}

if (purchase.warehouseId !== input.warehouseId) {
  throw new Error(
    "Pharmacy batch warehouse does not match the purchase warehouse.",
  );
}

if (purchase.supplierId !== input.supplierId) {
  throw new Error(
    "Pharmacy batch supplier does not match the purchase supplier.",
  );
}

const warehouse = await tx.warehouse.findFirst({
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

const purchaseItems = await tx.purchaseItem.findMany({
  where: {
    purchaseId: input.purchaseId,
  },
  select: {
    id: true,
    productId: true,
    quantity: true,
    unitCost: true,
  },
});

const purchaseItemMap = new Map(
  purchaseItems.map((item) => [item.id, item]),
);

const pharmacyProducts =
  await tx.pharmacyProduct.findMany({
    where: {
      productId: {
        in: purchaseItems.map(
          (item) => item.productId,
        ),
      },
    },
    select: {
      id: true,
      productId: true,
      status: true,
    },
  });

const pharmacyProductMap = new Map(
  pharmacyProducts.map((product) => [
    product.productId,
    product,
  ]),
);

const pharmacyPurchaseItems =
  purchaseItems.filter((item) =>
    pharmacyProductMap.has(item.productId),
  );

if (
  pharmacyPurchaseItems.length > 0 &&
  input.batches.length === 0
) {
  throw new Error(
    "Pharmacy purchase items require batch information before receiving.",
  );
}

for (const purchaseItem of pharmacyPurchaseItems) {
  const pharmacyProduct =
    pharmacyProductMap.get(
      purchaseItem.productId,
    );

  if (!pharmacyProduct) {
    throw new Error(
      `Product ${purchaseItem.productId} could not be verified as a pharmacy product.`,
    );
  }

  if (pharmacyProduct.status !== "ACTIVE") {
    throw new Error(
      `Pharmacy product ${purchaseItem.productId} is not active and cannot be received.`,
    );
  }
}

const batchQuantities = new Map<
  string,
  Prisma.Decimal
>();


for (const batchInput of input.batches) {
  const purchaseItem =
    purchaseItemMap.get(
      batchInput.purchaseItemId,
    );

  if (!purchaseItem) {
    throw new Error(
      "Batch purchase item does not belong to this purchase.",
    );
  }

  if (
    purchaseItem.productId !==
    batchInput.productId
  ) {
    throw new Error(
      `Batch product does not match purchase item ${batchInput.purchaseItemId}.`,
    );
  }

  const currentQuantity =
    batchQuantities.get(
      batchInput.purchaseItemId,
    ) ?? new Prisma.Decimal(0);

  batchQuantities.set(
    batchInput.purchaseItemId,
    currentQuantity.add(
      batchInput.quantity,
    ),
  );
}

for (const [
  purchaseItemId,
  allocatedQuantity,
] of batchQuantities) {
  const purchaseItem =
    purchaseItemMap.get(
      purchaseItemId,
    );

  if (!purchaseItem) {
    throw new Error(
      "Purchase item could not be verified.",
    );
  }

  if (
    !allocatedQuantity.equals(
      purchaseItem.quantity,
    )
  ) {
    throw new Error(
      `Batch quantities for purchase item ${purchaseItem.productId} must equal the purchased quantity of ${purchaseItem.quantity.toString()}. Allocated ${allocatedQuantity.toString()}.`,
    );
  }
}

const createdBatches = [];

const requestedBatchKeys = new Set<string>();

for (const batchInput of input.batches) {
	
      if (!batchInput.purchaseItemId) {
        throw new Error("Purchase item is required for every batch.");
      }

      if (!batchInput.productId) {
        throw new Error("Product is required for every batch.");
      }

      if (!batchInput.batchNumber.trim()) {
        throw new Error("Batch number is required.");
      }
	  
	  const requestedBatchKey =
  `${batchInput.productId}:${batchInput.batchNumber.trim()}`;

if (requestedBatchKeys.has(requestedBatchKey)) {
  throw new Error(
    `Batch ${batchInput.batchNumber.trim()} is duplicated in this receiving request.`,
  );
}

requestedBatchKeys.add(requestedBatchKey);

      if (batchInput.expiryDate <= now) {
        throw new Error(
          `Batch ${batchInput.batchNumber} has already expired.`,
        );
      }
	  
	  if (
           batchInput.manufacturingDate &&
           batchInput.manufacturingDate > now
         ) {
           throw new Error(
             `Batch ${batchInput.batchNumber} manufacturing date cannot be in the future.`,
           );
         }
         
         if (
           batchInput.manufacturingDate &&
           batchInput.manufacturingDate >=
             batchInput.expiryDate
         ) {
           throw new Error(
             `Batch ${batchInput.batchNumber} manufacturing date must be before the expiry date.`,
           );
         }

      if (batchInput.quantity.lessThanOrEqualTo(0)) {
        throw new Error(
          `Batch ${batchInput.batchNumber} quantity must be greater than zero.`,
        );
      }

      if (batchInput.unitCost.lessThan(0)) {
        throw new Error(
          `Batch ${batchInput.batchNumber} unit cost cannot be negative.`,
        );
      }

      const purchaseItem = purchaseItemMap.get(
        batchInput.purchaseItemId,
      );

      if (!purchaseItem) {
        throw new Error(
          `Purchase item ${batchInput.purchaseItemId} does not belong to this purchase.`,
        );
      }

      if (purchaseItem.productId !== batchInput.productId) {
        throw new Error(
          `Batch Product does not match purchase item ${batchInput.purchaseItemId}.`,
        );
      }
	  
	  if (
         !batchInput.unitCost.equals(
           purchaseItem.unitCost,
         )
       ) {
         throw new Error(
           `Batch unit cost for purchase item ${batchInput.purchaseItemId} must match the purchase unit cost of ${purchaseItem.unitCost.toString()}.`,
         );
       }

      const pharmacyProduct =
        await tx.pharmacyProduct.findUnique({
          where: {
            productId: batchInput.productId,
          },
          select: {
            id: true,
            status: true,
          },
        });

      if (!pharmacyProduct) {
        throw new Error(
          `Product ${batchInput.productId} is not configured as a pharmacy product.`,
        );
      }

      if (pharmacyProduct.status !== "ACTIVE") {
        throw new Error(
          `Pharmacy product ${batchInput.productId} is not active.`,
        );
      }

      const existingBatch =
        await tx.pharmacyBatch.findUnique({
          where: {
            pharmacyProductId_batchNumber: {
              pharmacyProductId: pharmacyProduct.id,
              batchNumber: batchInput.batchNumber.trim(),
            },
          },
          select: {
            id: true,
            warehouseId: true,
          },
        });

      if (existingBatch) {
        throw new Error(
          `Batch ${batchInput.batchNumber} already exists for this pharmacy product.`,
        );
      }

      const batch =
        await tx.pharmacyBatch.create({
          data: {
            pharmacyProductId:
              pharmacyProduct.id,

            warehouseId:
              input.warehouseId,

            batchNumber:
              batchInput.batchNumber.trim(),

            manufacturingDate:
              batchInput.manufacturingDate,

            expiryDate:
              batchInput.expiryDate,

            supplierId:
              input.supplierId,

            purchaseId:
              input.purchaseId,

            purchaseItemId:
              batchInput.purchaseItemId,

            quantityReceived:
              batchInput.quantity,

            quantityRemaining:
              batchInput.quantity,

            unitCost:
              batchInput.unitCost,

            isRecalled: false,
          },
        });

      createdBatches.push(batch);
    }

    return createdBatches;
  },
};