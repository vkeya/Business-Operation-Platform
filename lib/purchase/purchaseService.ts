import {
  purchaseRepository,
  type CreatePurchaseInput,
} from "./purchaseRepository";

export const purchaseService = {
  async createPurchase(
    input: CreatePurchaseInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.supplierId) {
      throw new Error(
        "Supplier is required.",
      );
    }

    if (!input.referenceNumber.trim()) {
      throw new Error(
        "Purchase reference is required.",
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

    return purchaseRepository.create({
      ...input,
      referenceNumber:
        input.referenceNumber.trim(),
      currency: input.currency.trim(),
    });
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

    return purchaseRepository.receivePurchase(
      businessId,
      purchaseId,
    );
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