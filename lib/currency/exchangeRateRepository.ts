import { prisma } from "@/lib/database/prisma";

export interface CreateExchangeRateInput {
  businessId: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  effectiveAt: Date;
}

export const exchangeRateRepository = {
  async create(input: CreateExchangeRateInput) {
    return prisma.exchangeRate.create({
      data: {
        businessId: input.businessId,
        fromCurrency: input.fromCurrency,
        toCurrency: input.toCurrency,
        rate: input.rate,
        source: input.source,
        effectiveAt: input.effectiveAt,
      },
    });
  },

  async findLatest(
    businessId: string,
    fromCurrency: string,
    toCurrency: string,
  ) {
    return prisma.exchangeRate.findFirst({
      where: {
        businessId,
        fromCurrency,
        toCurrency,
      },
      orderBy: {
        effectiveAt: "desc",
      },
    });
  },

  async list(
    businessId: string,
    fromCurrency?: string,
    toCurrency?: string,
  ) {
    return prisma.exchangeRate.findMany({
      where: {
        businessId,
        ...(fromCurrency
          ? { fromCurrency }
          : {}),
        ...(toCurrency
          ? { toCurrency }
          : {}),
      },
      orderBy: {
        effectiveAt: "desc",
      },
    });
  },
};