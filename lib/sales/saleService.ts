import {
  saleRepository,
  type CreateSaleInput,
} from "./saleRepository";
import { postSaleToAccounting } from "@/lib/accounting/posting/salesPosting";
import { inventoryService } from "@/lib/inventory/inventoryService";
import { productService } from "@/lib/inventory/productService";
import {
  generateBusinessReference,
} from "@/lib/business/reference/referenceGenerator";


export type CreateSaleServiceInput =
  Omit<CreateSaleInput, "referenceNumber">;

export const saleService = {
  async create(
  input: CreateSaleServiceInput,
) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
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

	const referenceNumber =
  await generateBusinessReference({
    businessId: input.businessId,
    referenceType: "SALE",
    prefix: "SALE",
  });

    return saleRepository.create({
      ...input,
      referenceNumber,
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
      | "CANCELLED"
	  | "REVERSED",
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

    const existingSale = sale;

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
      menuItemId: item.menuItemId!,
      quantity:
        item.quantity.toNumber(),
    }));

  const inventoryItems: Array<{
    productId: string;
    quantity: number;
  }> = [];

  const { productService } =
    await import(
      "@/lib/inventory/productService"
    );

  for (const item of sale.items) {
    // Restaurant menu items consume stock
    // through their recipes.
    if (item.menuItemId) {
      continue;
    }

    let inventoryQuantity =
  Number(item.quantity);

    if (item.sellingUnitId) {
      const sellingUnit =
        await productService.findSellingUnitById(
          item.productId,
          item.sellingUnitId,
        );

      if (!sellingUnit) {
        throw new Error(
          `Selling unit not found for product "${item.productName}".`,
        );
      }

      inventoryQuantity =
        item.quantity *
        sellingUnit.quantity;
    }

    inventoryItems.push({
      productId:
        item.productId,
      quantity:
        inventoryQuantity,
    });
  }

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
      currency:
        sale.currency,
      createdBy:
        sale.createdBy,
      referenceId:
        sale.id,
      items:
        restaurantItems,
    });
  }

  if (
    inventoryItems.length > 0 &&
    sale.warehouseId
  ) {
    const { inventoryService } =
      await import(
        "@/lib/inventory/inventoryService"
      );

    await inventoryService.consumeStockBatch({
      businessId,
      warehouseId:
        sale.warehouseId,
      currency:
        sale.currency,
      createdBy:
        sale.createdBy,
      referenceType:
        "SALE",
      referenceId:
        sale.id,
      notes:
        `Inventory consumption for sale ${sale.referenceNumber}.`,
      items:
        inventoryItems,
    });
  }

  await postSaleToAccounting({
    businessId,
    saleId:
      existingSale.id,
    referenceNumber:
      existingSale.referenceNumber,
    totalAmount:
      existingSale.totalAmount,
    currency:
      existingSale.currency,
    customerId:
      existingSale.customerId,
    createdBy:
      existingSale.createdBy,
  });

  return saleRepository.updateStatus(
    businessId,
    saleId,
    status,
  );
} {
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

      async reverse(
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

    if (sale.status !== "COMPLETED") {
      throw new Error(
        "Only completed sales can be reversed.",
      );
    }

    if (!sale.warehouseId) {
      throw new Error(
        "Completed sale has no warehouse for stock reversal.",
      );
    }

    const restaurantItems =
      sale.items
        .filter(
          (item) => item.menuItemId,
        )
        .map((item) => ({
          menuItemId:
            item.menuItemId!,
          quantity:
            Number(item.quantity),
        }));

    const inventoryItems: Array<{
      productId: string;
      quantity: number;
    }> = [];

    for (const item of sale.items) {
      // Restaurant menu items are restored
      // through their recipes.
      if (item.menuItemId) {
        continue;
      }

      let inventoryQuantity =
        Number(item.quantity);

      if (item.sellingUnitId) {
        const sellingUnit =
          await productService.findSellingUnitById(
            item.productId,
            item.sellingUnitId,
          );

        if (!sellingUnit) {
          throw new Error(
            `Selling unit not found for product "${item.productName}".`,
          );
        }

        inventoryQuantity =
          Number(item.quantity) *
          sellingUnit.quantity;
      }

      inventoryItems.push({
        productId:
          item.productId,
        quantity:
          inventoryQuantity,
      });
    }

    if (restaurantItems.length > 0) {
  const { recipeService } =
    await import(
      "@/lib/restaurant/recipeService"
    );

  await recipeService.restoreSaleRecipes({
    businessId,
    warehouseId:
      sale.warehouseId,
    currency:
      sale.currency,
    createdBy:
      sale.createdBy,
    referenceId:
      sale.id,
    items:
      restaurantItems,
  });
}

    if (inventoryItems.length > 0) {
      await inventoryService.returnStockBatch({
        businessId,
        warehouseId:
          sale.warehouseId,
        currency:
          sale.currency,
        createdBy:
          sale.createdBy,
        referenceType:
          "SALE_REVERSAL",
        referenceId:
          sale.id,
        notes:
          `Stock restored from reversed sale ${sale.referenceNumber}.`,
        items:
          inventoryItems,
      });
    }

    return saleRepository.updateStatus(
      businessId,
      saleId,
      "REVERSED",
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

    if (sale.status === "COMPLETED") {
      throw new Error(
        "Completed sales must be reversed instead of cancelled.",
      );
    }

    if (sale.status === "CANCELLED") {
      throw new Error(
        "Sale is already cancelled.",
      );
    }

    return saleRepository.cancel(
      businessId,
      saleId,
    );
  },
};