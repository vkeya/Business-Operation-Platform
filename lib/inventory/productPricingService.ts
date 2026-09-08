import {
  productRepository,
  type CreateProductPriceInput,
} from "./productRepository";

export type ProductPriceType =
  | "RETAIL"
  | "WHOLESALE"
  | "MINIMUM"
  | "RATE_1"
  | "RATE_2"
  | "RATE_3"
  | "RATE_4";

function validateProductId(productId: string) {
  if (!productId.trim()) {
    throw new Error("Product ID is required.");
  }
}

function validatePriceType(type: ProductPriceType) {
  const validTypes: ProductPriceType[] = [
    "RETAIL",
    "WHOLESALE",
    "MINIMUM",
    "RATE_1",
    "RATE_2",
    "RATE_3",
    "RATE_4",
  ];

  if (!validTypes.includes(type)) {
    throw new Error("Invalid product price type.");
  }
}

function validatePrice(price: number) {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(
      "Price must be a valid non-negative number.",
    );
  }
}

function validateCurrency(currency: string) {
  if (!currency.trim()) {
    throw new Error("Currency is required.");
  }
}

async function validateProductOwnership(
  businessId: string,
  productId: string,
) {
  if (!businessId.trim()) {
    throw new Error("Business context is required.");
  }

  validateProductId(productId);

  const product =
    await productRepository.findById(
      businessId,
      productId,
    );

  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
}

export async function getProductPrices(
  businessId: string,
  productId: string,
) {
  await validateProductOwnership(
    businessId,
    productId,
  );

  return productRepository.listPrices(productId);
}

export async function getProductPrice(
  businessId: string,
  productId: string,
  type: string,
) {
  await validateProductOwnership(
    businessId,
    productId,
  );

  const priceType =
    type as ProductPriceType;

  validatePriceType(priceType);

  const prices =
    await productRepository.listPrices(
      productId,
    );

  return (
    prices.find(
      (price) => price.type === priceType,
    ) ?? null
  );
}

export async function createProductPrice(
  businessId: string,
  input: CreateProductPriceInput,
) {
  await validateProductOwnership(
    businessId,
    input.productId,
  );

  validatePriceType(input.type);
  validatePrice(input.price);
  validateCurrency(input.currency);

  return productRepository.createPrice(input);
}

export async function updateProductPrice(
  businessId: string,
  productId: string,
  type: ProductPriceType,
  input: {
    price: number;
    currency: string;
  },
) {
  await validateProductOwnership(
    businessId,
    productId,
  );

  validatePriceType(type);
  validatePrice(input.price);
  validateCurrency(input.currency);

  return productRepository.updatePrice(
    productId,
    type,
    input,
  );
}