import type { BusinessType } from "./business";

export interface BusinessSetup {
  business: {
    name: string;
    type: BusinessType;
    country: string;
    baseCurrency: string;
    language: string;
    timezone: string;
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