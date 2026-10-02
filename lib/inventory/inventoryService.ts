import { inventoryRepository } from "./inventoryRepository";
import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;


async function validateWarehouse(
  businessId: string,
  warehouseId: string,
) {
  const warehouse = await prisma.warehouse.findFirst({
    where: {
      id: warehouseId,
      businessId,
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
}

async function validateProduct(
  businessId: string,
  productId: string,
) {
  const product = await prisma.product.findFirst({
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
}

export const inventoryService = {

	  async findMovementsByReference(
    businessId: string,
    referenceType: string,
    referenceId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!referenceType) {
      throw new Error(
        "Reference type is required.",
      );
    }

    if (!referenceId) {
      throw new Error(
        "Reference ID is required.",
      );
    }

    return inventoryRepository.findMovementsByReference(
      businessId,
      referenceType,
      referenceId,
    );
  },

	async adjustStock(input: {
  businessId: string;
  operationId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost?: number;
  currency: string;
  createdBy: string;
  notes?: string;
}) {
  if (!input.businessId) {
    throw new Error("Business context is required.");
  }

  if (!input.productId) {
  throw new Error("Product is required.");
}

await validateProduct(
  input.businessId,
  input.productId,
);

if (!input.warehouseId) {
    throw new Error("Warehouse is required.");
  }

  await validateWarehouse(
  input.businessId,
  input.warehouseId,
);

  if (input.quantity === 0) {
    throw new Error(
      "Adjustment quantity cannot be zero.",
    );
  }

  if (
    input.unitCost !== undefined &&
    input.unitCost < 0
  ) {
    throw new Error(
      "Unit cost cannot be negative.",
    );
  }

  if (!input.currency) {
    throw new Error("Currency is required.");
  }

  if (!input.createdBy) {
    throw new Error("User context is required.");
  }

  return inventoryRepository.adjustStock(input);
},

	async receiveStock(input: {
  operationId: string;
  businessId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost: number;
  currency: string;
  createdBy: string;
  containerType?:
  | "BOTTLE"
  | "KEG"
  | "CAN"
  | "JAR"
  | "OTHER";

containerCapacityQuantity?: number;

containerUnit?: string;
  notes?: string;

  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
}) {

	if (!input.operationId) {
  throw new Error("Operation ID is required.");
}

  if (!input.businessId) {
    throw new Error("Business context is required.");
  }

  if (!input.productId) {
  throw new Error("Product is required.");
}

await validateProduct(
  input.businessId,
  input.productId,
);

const product = await prisma.product.findFirst({
  where: {
    id: input.productId,
    businessId: input.businessId,
  },
  select: {
    id: true,
    inventoryMode: true,
  },
});

if (!product) {
  throw new Error("Product not found.");
}

if (!input.warehouseId) {
    throw new Error("Warehouse is required.");
  }

  await validateWarehouse(
  input.businessId,
  input.warehouseId,
);

  if (input.quantity <= 0) {
    throw new Error(
      "Receipt quantity must be greater than zero.",
    );
  }

  if (input.unitCost < 0) {
    throw new Error(
      "Unit cost cannot be negative.",
    );
  }

  if (!input.currency) {
    throw new Error("Currency is required.");
  }

  if (product.inventoryMode === "LIQUID") {
  if (!input.containerType) {
    throw new Error(
      "Container type is required for liquid inventory.",
    );
  }

  if (
    !input.containerCapacityQuantity ||
    input.containerCapacityQuantity <= 0
  ) {
    throw new Error(
      "Container capacity is required for liquid inventory.",
    );
  }

  if (!input.containerUnit) {
    throw new Error(
      "Container unit is required for liquid inventory.",
    );
  }
}

  if (!input.createdBy) {
    throw new Error("User context is required.");
  }

  const pharmacyProduct =
  await prisma.pharmacyProduct.findUnique({
    where: {
      productId: input.productId,
    },
    select: {
      id: true,
      status: true,
    },
  });

if (pharmacyProduct) {
  if (pharmacyProduct.status !== "ACTIVE") {
    throw new Error(
      "This pharmacy product is not active and cannot receive stock.",
    );
  }

  if (!input.batchNumber?.trim()) {
    throw new Error(
      "Batch number is required for pharmacy products.",
    );
  }

  if (!input.expiryDate) {
    throw new Error(
      "Expiry date is required for pharmacy products.",
    );
  }

  const now = new Date();
  const expiryDate = new Date(input.expiryDate);

  if (Number.isNaN(expiryDate.getTime())) {
    throw new Error(
      "Expiry date is invalid.",
    );
  }

  if (expiryDate <= now) {
    throw new Error(
      "Expiry date must be in the future.",
    );
  }

  if (input.manufacturingDate) {
    const manufacturingDate =
      new Date(input.manufacturingDate);

    if (Number.isNaN(manufacturingDate.getTime())) {
      throw new Error(
        "Manufacturing date is invalid.",
      );
    }

    if (manufacturingDate > now) {
      throw new Error(
        "Manufacturing date cannot be in the future.",
      );
    }

    if (manufacturingDate >= expiryDate) {
      throw new Error(
        "Manufacturing date must be before the expiry date.",
      );
    }
  }

  const existingBatch =
    await prisma.pharmacyBatch.findUnique({
      where: {
        pharmacyProductId_batchNumber: {
          pharmacyProductId: pharmacyProduct.id,
          batchNumber: input.batchNumber.trim(),
        },
      },
      select: {
        id: true,
      },
    });

  if (existingBatch) {
    throw new Error(
      `Batch ${input.batchNumber.trim()} already exists for this pharmacy product.`,
    );
  }
}

  return inventoryRepository.receiveStock(input);
},
async transferStock(input: {
  businessId: string;
  operationId: string;
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  currency: string;
  createdBy: string;
  notes?: string;
}) {

	if (!input.operationId) {
  throw new Error("Operation ID is required.");
}
  if (!input.businessId) {
    throw new Error("Business context is required.");
  }

  if (!input.productId) {
  throw new Error("Product is required.");
}

await validateProduct(
  input.businessId,
  input.productId,
);

if (!input.fromWarehouseId) {
    throw new Error(
      "Source warehouse is required.",
    );
  }

  if (!input.toWarehouseId) {
    throw new Error(
      "Destination warehouse is required.",
    );
  }

  await validateWarehouse(
  input.businessId,
  input.fromWarehouseId,
);

await validateWarehouse(
  input.businessId,
  input.toWarehouseId,
);

  if (
    input.fromWarehouseId ===
    input.toWarehouseId
  ) {
    throw new Error(
      "Source and destination warehouses must be different.",
    );
  }

  if (input.quantity <= 0) {
    throw new Error(
      "Transfer quantity must be greater than zero.",
    );
  }

  if (!input.currency) {
    throw new Error("Currency is required.");
  }

  if (!input.createdBy) {
    throw new Error("User context is required.");
  }

  return inventoryRepository.transferStock(
    input,
  );
},

  async consumeStock(input: {
  businessId: string;
  operationId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  currency: string;
  createdBy: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}) {
  if (!input.businessId) {
    throw new Error(
      "Business context is required.",
    );
  }

  if (!input.operationId) {
    throw new Error(
      "Operation ID is required.",
    );
  }

  if (!input.productId) {
    throw new Error(
      "Product is required.",
    );
  }

  if (!input.warehouseId) {
    throw new Error(
      "Warehouse is required.",
    );
  }

  await validateWarehouse(
    input.businessId,
    input.warehouseId,
  );

  if (input.quantity <= 0) {
    throw new Error(
      "Consumption quantity must be greater than zero.",
    );
  }

  if (!input.currency) {
    throw new Error(
      "Currency is required.",
    );
  }

  if (!input.createdBy) {
    throw new Error(
      "User context is required.",
    );
  }

  return inventoryRepository.consumeStock(
    input,
  );
},
    async consumeStockBatch(input: {
	operationId: string;
    businessId: string;
    warehouseId: string;
    currency: string;
    createdBy: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  }) {

	if (!input.operationId) {
      throw new Error(
        "Operation ID is required.",
      );
    }

    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.warehouseId) {
      throw new Error(
        "Warehouse is required.",
      );
    }

	await validateWarehouse(
  input.businessId,
  input.warehouseId,
);

    if (!input.currency) {
      throw new Error(
        "Currency is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    if (input.items.length === 0) {
      throw new Error(
        "At least one stock consumption item is required.",
      );
    }

	for (const item of input.items) {
  await validateProduct(
    input.businessId,
    item.productId,
  );
}

    return inventoryRepository.consumeStockBatch(
      input,
    );
  },

    async returnStock(input: {
    businessId: string;
    productId: string;
    warehouseId: string;
    quantity: number;
    unitCost: number;
    currency: string;
    createdBy: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;

	batchNumber?: string;
    manufacturingDate?: string;
    expiryDate?: string;
  }) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.productId) {
      throw new Error(
        "Product is required.",
      );
    }

	await validateProduct(
  input.businessId,
  input.productId,
);

    if (!input.warehouseId) {
      throw new Error(
        "Warehouse is required.",
      );
    }

	await validateWarehouse(
  input.businessId,
  input.warehouseId,
);

    if (input.quantity <= 0) {
      throw new Error(
        "Return quantity must be greater than zero.",
      );
    }

    if (input.unitCost < 0) {
      throw new Error(
        "Unit cost cannot be negative.",
      );
    }

    if (!input.currency) {
      throw new Error(
        "Currency is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    return inventoryRepository.returnStock(
      input,
    );
  },



  async getBalance(
    businessId: string,
    productId: string,
    warehouseId: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    if (!productId) {
      throw new Error("Product is required.");
    }

    if (!warehouseId) {
      throw new Error("Warehouse is required.");
    }

    return inventoryRepository.getBalance(
      businessId,
      productId,
      warehouseId,
    );
  },

  async listBalances(
    businessId: string,
    productId?: string,
    warehouseId?: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return inventoryRepository.listBalances(
      businessId,
      productId,
      warehouseId,
    );
  },

        async returnStockBatch(
    input: {
      businessId: string;
      warehouseId: string;
      currency: string;
      createdBy: string;
      referenceType?: string;
      referenceId?: string;
      notes?: string;
      items: Array<{
        productId: string;
        quantity: number;
      }>;
    },
    client: PrismaTransactionClient = prisma,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.warehouseId) {
      throw new Error(
        "Warehouse is required.",
      );
    }

    if (!input.currency) {
      throw new Error(
        "Currency is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    if (input.items.length === 0) {
      throw new Error(
        "At least one stock return item is required.",
      );
    }

    for (const item of input.items) {
      if (!item.productId) {
        throw new Error(
          "Product is required for stock return.",
        );
      }

      if (item.quantity <= 0) {
        throw new Error(
          "Return quantity must be greater than zero.",
        );
      }
    }

    return inventoryRepository.returnStockBatch(
      input,
      client,
    );
  },

  async listMovements(
    businessId: string,
    productId?: string,
    warehouseId?: string,
    movementType?:
      | "RECEIPT"
      | "SALE"
      | "RETURN"
      | "ADJUSTMENT"
      | "TRANSFER_IN"
      | "TRANSFER_OUT"
      | "DAMAGE"
      | "EXPIRY",
    fromDate?: Date,
    toDate?: Date,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return inventoryRepository.listMovements(
      businessId,
      productId,
      warehouseId,
      movementType,
      fromDate,
      toDate,
    );
  },
};
