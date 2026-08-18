"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { exchangeRatePersistenceService } from "@/lib/currency/exchangeRatePersistenceService";

export async function getExchangeRateAction(
  fromCurrency: string,
  toCurrency: string,
) {
  const business = await getCurrentBusiness();

  return exchangeRatePersistenceService.getRate(
    business.id,
    fromCurrency,
    toCurrency,
  );
}

export async function getCurrencyDefaultsAction() {
  const business = await getCurrentBusiness();

  return {
    baseCurrency: business.baseCurrency,
  };
}