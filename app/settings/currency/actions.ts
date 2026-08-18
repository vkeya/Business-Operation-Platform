"use server";

import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { createExchangeRateService } from "@/lib/currency/exchangeRateService";
import { frankfurterProvider } from "@/lib/currency/frankfurterProvider";

const exchangeRateService = createExchangeRateService(
  frankfurterProvider,
);

export async function getExchangeRateAction(
  fromCurrency: string,
  toCurrency: string,
) {
  return exchangeRateService.getRate(
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