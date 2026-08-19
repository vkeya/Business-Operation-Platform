import { inventoryRepository } from "./inventoryRepository";

export const inventoryService = {
	
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

  async listMovements(
    businessId: string,
    productId?: string,
    warehouseId?: string,
  ) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return inventoryRepository.listMovements(
      businessId,
      productId,
      warehouseId,
    );
  },
};