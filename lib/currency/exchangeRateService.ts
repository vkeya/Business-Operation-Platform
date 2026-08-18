import type {
  ExchangeRateQuote,
} from "./exchangeRateTypes";

export interface ExchangeRateProvider {
  getRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<ExchangeRateQuote>;
}

export function createExchangeRateService(
  provider: ExchangeRateProvider,
) {
  return {
    async getRate(
      fromCurrency: string,
      toCurrency: string,
    ) {
      const from = fromCurrency.trim().toUpperCase();
      const to = toCurrency.trim().toUpperCase();

      if (!from) {
        throw new Error("Source currency is required.");
      }

      if (!to) {
        throw new Error("Target currency is required.");
      }

      if (from === to) {
        return {
          fromCurrency: from,
          toCurrency: to,
          rate: 1,
          source: "same-currency",
          effectiveAt: new Date().toISOString(),
        };
      }

      const quote = await provider.getRate(from, to);

      if (!Number.isFinite(quote.rate) || quote.rate <= 0) {
        throw new Error(
          "Exchange rate provider returned an invalid rate.",
        );
      }

      return quote;
    },
  };
}