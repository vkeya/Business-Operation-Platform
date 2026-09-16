import type { BusinessType } from "./business";

export type TaxPricingMode =
  | "EXCLUSIVE"
  | "INCLUSIVE";

export interface BusinessTaxSetup {
  enabled: boolean;
  name: string;
  rate: string;
  pricingMode: TaxPricingMode;
}

export interface BusinessSetup {
  business: {
    name: string;
    type: BusinessType;
    country: string;
    baseCurrency: string;
    language: string;
    timezone: string;
    tax: BusinessTaxSetup;
  };

  branch: {
    name: string;
    code: string;
  };

  warehouse: {
    name: string;
    code: string;
  };
}