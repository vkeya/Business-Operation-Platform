import { inventoryRepository } from "./inventoryRepository";

export const inventoryService = {

	async adjustStock(input: {
  businessId: string;
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

  if (!input.warehouseId) {
    throw new Error("Warehouse is required.");
  }

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
  businessId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost: number;
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

  if (!input.warehouseId) {
    throw new Error("Warehouse is required.");
  }

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

  if (!input.createdBy) {
    throw new Error("User context is required.");
  }

  return inventoryRepository.receiveStock(input);
},
async transferStock(input: {
  businessId: string;
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
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
        "At least one stock consumption item is required.",
      );
    }

    return inventoryRepository.consumeStockBatch(
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

    async returnStockBatch(input: {
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

    return inventoryRepository.returnStockBatch(
      input,
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
      throw new Error("Business context is required.");
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