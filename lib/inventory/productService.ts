import {
  productRepository,
  type CreateProductInput,
  type CreateProductSellingUnitInput,
} from "./productRepository";

export const productService = {
  async createProduct(input: CreateProductInput) {
    const name = input.name.trim();
    const sku = input.sku.trim().toUpperCase();

    if (!name) {
      throw new Error("Product name is required.");
    }

    if (!sku) {
      throw new Error("Product SKU is required.");
    }

    if (!input.businessId) {
      throw new Error("Business context is required.");
    }

    if (!input.currency) {
      throw new Error("Product currency is required.");
    }

    if (!input.unit.trim()) {
      throw new Error("Product unit is required.");
    }

    if (input.costPrice < 0) {
      throw new Error("Cost price cannot be negative.");
    }

    if (input.sellingPrice < 0) {
      throw new Error("Selling price cannot be negative.");
    }

    if (
      input.minimumStock !== undefined &&
      input.minimumStock < 0
    ) {
      throw new Error("Minimum stock cannot be negative.");
    }

    if (
      input.reorderLevel !== undefined &&
      input.reorderLevel < 0
    ) {
      throw new Error("Reorder level cannot be negative.");
    }

    const existingProduct =
      await productRepository.findBySku(
        input.businessId,
        sku,
      );

    if (existingProduct) {
      throw new Error(
        `A product with SKU "${sku}" already exists.`,
      );
    }

    return productRepository.create({
      ...input,
      name,
      sku,
      unit: input.unit.trim(),
      barcode: input.barcode?.trim() || undefined,
      description: input.description?.trim() || undefined,
      taxCode: input.taxCode?.trim() || undefined,
    });
  },

  async listProducts(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return productRepository.list(businessId);
  },

  async listServices(businessId: string) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  return productRepository.listByType(
    businessId,
    "SERVICE",
  );
},

async listServicesByCategory(
  businessId: string,
  categoryId: string,
) {
  if (!businessId) {
    throw new Error(
      "Business context is required.",
    );
  }

  if (!categoryId) {
    throw new Error(
      "Service category is required.",
    );
  }

  return productRepository.listByTypeAndCategory(
    businessId,
    "SERVICE",
    categoryId,
  );
},

  async searchProducts(
  businessId: string,
  query: string,
) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  return productRepository.search(
    businessId,
    query,
  );
},

  async findProductByBarcode(
    businessId: string,
    barcode: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    const normalizedBarcode = barcode.trim();

    if (!normalizedBarcode) {
      throw new Error(
        "Product barcode is required.",
      );
    }

    return productRepository.findByBarcode(
      businessId,
      normalizedBarcode,
    );
  },

    async createSellingUnit(
    businessId: string,
    input: CreateProductSellingUnitInput,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.productId) {
      throw new Error(
        "Product ID is required.",
      );
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error(
        "Selling unit name is required.",
      );
    }

    if (input.quantity <= 0) {
      throw new Error(
        "Selling unit quantity must be greater than zero.",
      );
    }

    if (input.sellingPrice < 0) {
      throw new Error(
        "Selling unit price cannot be negative.",
      );
    }

    const product =
      await productRepository.findById(
        businessId,
        input.productId,
      );

    if (!product) {
      throw new Error(
        "Product not found.",
      );
    }

    return productRepository.createSellingUnit({
      ...input,
      name,
    });
  },

    async findSellingUnitById(
    productId: string,
    sellingUnitId: string,
  ) {
    if (!productId) {
      throw new Error(
        "Product is required.",
      );
    }

    if (!sellingUnitId) {
      throw new Error(
        "Selling unit is required.",
      );
    }

    return productRepository.findSellingUnitById(
      productId,
      sellingUnitId,
    );
  },

  async listSellingUnits(
    businessId: string,
    productId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!productId) {
      throw new Error(
        "Product ID is required.",
      );
    }

    const product =
      await productRepository.findById(
        businessId,
        productId,
      );

    if (!product) {
      throw new Error(
        "Product not found.",
      );
    }

    return productRepository.listSellingUnits(
      productId,
    );
  },



  async updateProduct(
    businessId: string,
    productId: string,
    input: Omit<CreateProductInput, "businessId">,
  ) {
    const name = input.name.trim();
    const sku = input.sku.trim().toUpperCase();

    if (!businessId) {
      throw new Error("Business context is required.");
    }

    if (!productId) {
      throw new Error("Product ID is required.");
    }

    if (!name) {
      throw new Error("Product name is required.");
    }

    if (!sku) {
      throw new Error("Product SKU is required.");
    }

    if (!input.currency) {
      throw new Error("Product currency is required.");
    }

    if (!input.unit.trim()) {
      throw new Error("Product unit is required.");
    }

    if (input.costPrice < 0) {
      throw new Error("Cost price cannot be negative.");
    }

    if (input.sellingPrice < 0) {
      throw new Error("Selling price cannot be negative.");
    }

    if (
      input.minimumStock !== undefined &&
      input.minimumStock < 0
    ) {
      throw new Error("Minimum stock cannot be negative.");
    }

    if (
      input.reorderLevel !== undefined &&
      input.reorderLevel < 0
    ) {
      throw new Error("Reorder level cannot be negative.");
    }

    const existingProduct =
      await productRepository.findBySku(
        businessId,
        sku,
      );

    if (
      existingProduct &&
      existingProduct.id !== productId
    ) {
      throw new Error(
        `A product with SKU "${sku}" already exists.`,
      );
    }

    const product =
      await productRepository.findById(
        businessId,
        productId,
      );

    if (!product) {
      throw new Error("Product not found.");
    }

    return productRepository.update(
      businessId,
      productId,
      {
        ...input,
        name,
        sku,
        unit: input.unit.trim(),
        barcode:
          input.barcode?.trim() || undefined,
        description:
          input.description?.trim() || undefined,
        taxCode:
          input.taxCode?.trim() || undefined,
      },
    );
  },
};