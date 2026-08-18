import type { ExchangeRateProvider } from "./exchangeRateService";
import type { ExchangeRateQuote } from "./exchangeRateTypes";

interface FrankfurterRateResponse {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

const FRANKFURTER_API =
  "https://api.frankfurter.dev/v2";

export const frankfurterProvider: ExchangeRateProvider = {
  async getRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<ExchangeRateQuote> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    const response = await fetch(
      `${FRANKFURTER_API}/rate/${from}/${to}`,
      {
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Unable to retrieve exchange rate for ${from}/${to}.`,
      );
    }

    const data =
      (await response.json()) as FrankfurterRateResponse;

    if (
      data.base !== from ||
      data.quote !== to ||
      !Number.isFinite(data.rate) ||
      data.rate <= 0
    ) {
      throw new Error(
        "Exchange rate provider returned an invalid response.",
      );
    }

    return {
      fromCurrency: data.base,
      toCurrency: data.quote,
      rate: data.rate,
      source: "frankfurter",
      effectiveAt: `${data.date}T00:00:00.000Z`,
    };
  },
};