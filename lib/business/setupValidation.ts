import type { BusinessSetup } from "@/types/setup";

export interface SetupValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateBusinessSetup(
  setup: BusinessSetup,
): SetupValidationResult {
  const errors: Record<string, string> = {};

  if (!setup.business.name.trim()) {
    errors.businessName = "Business name is required.";
  }

  if (!setup.business.country.trim()) {
    errors.country = "Country is required.";
  }

  if (!setup.business.baseCurrency.trim()) {
    errors.baseCurrency = "Base currency is required.";
  }

  if (!setup.business.language.trim()) {
    errors.language = "Language is required.";
  }

  if (!setup.business.timezone.trim()) {
    errors.timezone = "Timezone is required.";
  }

  if (!setup.business.tax.name.trim()) {
    errors.taxName = "Tax name is required.";
  }

  const taxRate = Number(setup.business.tax.rate);

  if (
    !Number.isFinite(taxRate) ||
    taxRate < 0 ||
    taxRate > 100
  ) {
    errors.taxRate =
      "Tax rate must be a number between 0 and 100.";
  }

  if (
    setup.business.tax.pricingMode !== "EXCLUSIVE" &&
    setup.business.tax.pricingMode !== "INCLUSIVE"
  ) {
    errors.taxPricingMode =
      "Tax pricing mode is invalid.";
  }

  if (!setup.branch.name.trim()) {
    errors.branchName = "Branch name is required.";
  }

  if (!setup.branch.code.trim()) {
    errors.branchCode = "Branch code is required.";
  }

  if (!setup.warehouse.name.trim()) {
    errors.warehouseName =
      "Inventory location name is required.";
  }

  if (!setup.warehouse.code.trim()) {
    errors.warehouseCode =
      "Inventory location code is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}