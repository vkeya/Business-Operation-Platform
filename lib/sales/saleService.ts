import {
  saleRepository,
  type CreateSaleInput,
} from "./saleRepository";

export const saleService = {
  async create(input: CreateSaleInput) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.referenceNumber.trim()) {
      throw new Error(
        "Sale reference number is required.",
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
        "A sale must contain at least one item.",
      );
    }

    if (input.subtotal < 0) {
      throw new Error(
        "Subtotal cannot be negative.",
      );
    }

    if (input.discountAmount < 0) {
      throw new Error(
        "Discount amount cannot be negative.",
      );
    }

    if (input.taxAmount < 0) {
      throw new Error(
        "Tax amount cannot be negative.",
      );
    }

    if (input.totalAmount < 0) {
      throw new Error(
        "Total amount cannot be negative.",
      );
    }

    for (const item of input.items) {
      if (!item.productId) {
        throw new Error(
          "Sale item product is required.",
        );
      }

      if (item.quantity <= 0) {
        throw new Error(
          "Sale item quantity must be greater than zero.",
        );
      }

      if (item.unitPrice < 0) {
        throw new Error(
          "Sale item price cannot be negative.",
        );
      }
    }

    return saleRepository.create({
      ...input,
      referenceNumber:
        input.referenceNumber.trim(),
    });
  },

  async list(businessId: string) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return saleRepository.list(
      businessId,
    );
  },

  async findByReference(
    businessId: string,
    referenceNumber: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!referenceNumber.trim()) {
      throw new Error(
        "Sale reference number is required.",
      );
    }

    return saleRepository.findByReference(
      businessId,
      referenceNumber.trim(),
    );
  },

  async findById(
    businessId: string,
    saleId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    return saleRepository.findById(
      businessId,
      saleId,
    );
  },

  async updateStatus(
    businessId: string,
    saleId: string,
    status:
      | "DRAFT"
      | "COMPLETED"
      | "CANCELLED",
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    const sale =
      await saleRepository.findById(
        businessId,
        saleId,
      );

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    if (sale.status === "CANCELLED") {
      throw new Error(
        "Cancelled sales cannot be changed.",
      );
    }

    if (
      sale.status === "COMPLETED" &&
      status !== "COMPLETED"
    ) {
      throw new Error(
        "Completed sales cannot be changed.",
      );
    }

    if (
      status === "COMPLETED" &&
      sale.items.length === 0
    ) {
      throw new Error(
        "A sale must contain at least one item.",
      );
    }

    if (
      status === "COMPLETED" &&
      !sale.warehouseId
    ) {
      throw new Error(
        "A warehouse is required to complete a sale.",
      );
    }

    if (
      sale.status === "DRAFT" &&
      status === "CANCELLED"
    ) {
      return saleRepository.updateStatus(
        businessId,
        saleId,
        status,
      );
    }

    if (
      sale.status === "DRAFT" &&
      status === "COMPLETED"
    ) {
      const restaurantItems =
        sale.items
          .filter(
            (item) => item.menuItemId,
          )
          .map((item) => ({
            menuItemId:
              item.menuItemId!,
            quantity:
              item.quantity.toNumber(),
          }));

      if (
        restaurantItems.length > 0 &&
        sale.warehouseId
      ) {
        const { recipeService } =
          await import(
            "@/lib/restaurant/recipeService"
          );

        await recipeService.consumeSaleRecipes({
          businessId,
          warehouseId:
            sale.warehouseId,
          currency: sale.currency,
          createdBy:
            sale.createdBy,
          referenceId: sale.id,
          items: restaurantItems,
        });
      }

      return saleRepository.updateStatus(
        businessId,
        saleId,
        status,
      );
    }

    if (
      sale.status === "DRAFT" &&
      status !== "COMPLETED"
    ) {
      throw new Error(
        "Draft sales can only be completed or cancelled.",
      );
    }

    return saleRepository.updateStatus(
      businessId,
      saleId,
      status,
    );
  },

  async cancel(
    businessId: string,
    saleId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    return saleRepository.cancel(
      businessId,
      saleId,
    );
  },
};