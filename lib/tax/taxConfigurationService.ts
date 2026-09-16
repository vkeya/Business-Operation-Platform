import { prisma } from "@/lib/database/prisma";
import type { TaxPricingMode } from "@/lib/tax/taxCalculationService";

export interface TaxConfiguration {
  enabled: boolean;
  name: string;
  rate: number;
  pricingMode: TaxPricingMode;
}

function mapTaxConfiguration(
  configuration: {
    enabled: boolean;
    name: string;
    rate: unknown;
    pricingMode: TaxPricingMode;
  },
): TaxConfiguration {
  return {
    enabled: configuration.enabled,
    name: configuration.name,
    rate: Number(configuration.rate),
    pricingMode: configuration.pricingMode,
  };
}

export const taxConfigurationService = {
  async get(businessId: string): Promise<TaxConfiguration> {
    if (!businessId.trim()) {
      throw new Error("Business ID is required.");
    }

    const configuration = await prisma.taxConfiguration.findUnique({
      where: {
        businessId,
      },
    });

    if (!configuration) {
      return {
        enabled: false,
        name: "VAT",
        rate: 0,
        pricingMode: "EXCLUSIVE",
      };
    }

    return mapTaxConfiguration(configuration);
  },

  async update(
    businessId: string,
    input: TaxConfiguration,
  ): Promise<TaxConfiguration> {
    if (!businessId.trim()) {
      throw new Error("Business ID is required.");
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error("Tax name is required.");
    }

    if (!Number.isFinite(input.rate) || input.rate < 0 || input.rate > 100) {
      throw new Error("Tax rate must be a number between 0 and 100.");
    }

    if (
      input.pricingMode !== "EXCLUSIVE" &&
      input.pricingMode !== "INCLUSIVE"
    ) {
      throw new Error("Invalid tax pricing mode.");
    }

    const configuration = await prisma.taxConfiguration.upsert({
      where: {
        businessId,
      },
      create: {
        businessId,
        enabled: input.enabled,
        name,
        rate: input.rate,
        pricingMode: input.pricingMode,
      },
      update: {
        enabled: input.enabled,
        name,
        rate: input.rate,
        pricingMode: input.pricingMode,
      },
    });

    return mapTaxConfiguration(configuration);
  },
};