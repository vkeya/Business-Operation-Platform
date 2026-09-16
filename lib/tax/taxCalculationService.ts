export type TaxPricingMode = "EXCLUSIVE" | "INCLUSIVE";

export interface TaxCalculationInput {
  subtotal: number;
  discountAmount?: number;
  taxEnabled: boolean;
  taxRate?: number;
  pricingMode?: TaxPricingMode;
}

export interface TaxCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  taxRate: number;
  pricingMode: TaxPricingMode;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeNonNegative(value: number | undefined, field: string): number {
  const normalized = value ?? 0;

  if (!Number.isFinite(normalized)) {
    throw new Error(`${field} must be a finite number.`);
  }

  if (normalized < 0) {
    throw new Error(`${field} cannot be negative.`);
  }

  return normalized;
}

/**
 * Calculates tax from a business-level tax configuration.
 *
 * Discounts are applied before tax. For inclusive pricing, the tax component
 * is extracted from the discounted amount instead of being added on top.
 */
export function calculateTax(
  input: TaxCalculationInput,
): TaxCalculationResult {
  const subtotal = roundCurrency(
    normalizeNonNegative(input.subtotal, "Subtotal"),
  );
  const requestedDiscount = roundCurrency(
    normalizeNonNegative(input.discountAmount, "Discount amount"),
  );
  const discountAmount = Math.min(requestedDiscount, subtotal);
  const taxableAmount = roundCurrency(subtotal - discountAmount);

  const taxRate = normalizeNonNegative(input.taxRate, "Tax rate");
  const pricingMode = input.pricingMode ?? "EXCLUSIVE";

  if (pricingMode !== "EXCLUSIVE" && pricingMode !== "INCLUSIVE") {
    throw new Error("Invalid tax pricing mode.");
  }

  if (!input.taxEnabled || taxRate === 0 || taxableAmount === 0) {
    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount: 0,
      totalAmount: taxableAmount,
      taxRate,
      pricingMode,
    };
  }

  if (taxRate > 100) {
    throw new Error("Tax rate cannot exceed 100%.");
  }

  const rateMultiplier = taxRate / 100;

  if (pricingMode === "INCLUSIVE") {
    const netAmount = taxableAmount / (1 + rateMultiplier);
    const taxAmount = roundCurrency(taxableAmount - netAmount);

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      totalAmount: taxableAmount,
      taxRate,
      pricingMode,
    };
  }

  const taxAmount = roundCurrency(taxableAmount * rateMultiplier);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount: roundCurrency(taxableAmount + taxAmount),
    taxRate,
    pricingMode,
  };
}
