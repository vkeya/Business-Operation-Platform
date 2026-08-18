import { createExchangeRateService } from "./exchangeRateService";
import { frankfurterProvider } from "./frankfurterProvider";
import { exchangeRateRepository } from "./exchangeRateRepository";

const liveExchangeRateService =
  createExchangeRateService(
    frankfurterProvider,
  );

const RATE_CACHE_MINUTES = 60;

export const exchangeRatePersistenceService = {
  async getRate(
    businessId: string,
    fromCurrency: string,
    toCurrency: string,
  ) {
    const from = fromCurrency.trim().toUpperCase();
    const to = toCurrency.trim().toUpperCase();

    if (!businessId) {
      throw new Error("Business context is required.");
    }

    if (!from || !to) {
      throw new Error(
        "Both currencies are required.",
      );
    }

    if (from === to) {
      return {
        fromCurrency: from,
        toCurrency: to,
        rate: 1,
        source: "same-currency",
        effectiveAt: new Date(),
      };
    }

    const latest =
      await exchangeRateRepository.findLatest(
        businessId,
        from,
        to,
      );

    if (latest) {
      const ageMs =
        Date.now() -
        latest.effectiveAt.getTime();

      const ageMinutes =
        ageMs / (1000 * 60);

      if (ageMinutes < RATE_CACHE_MINUTES) {
        return {
          fromCurrency: latest.fromCurrency,
          toCurrency: latest.toCurrency,
          rate: latest.rate.toNumber(),
          source: latest.source,
          effectiveAt: latest.effectiveAt,
        };
      }
    }

    const quote =
      await liveExchangeRateService.getRate(
        from,
        to,
      );

    const saved =
      await exchangeRateRepository.create({
        businessId,
        fromCurrency: quote.fromCurrency,
        toCurrency: quote.toCurrency,
        rate: quote.rate,
        source: quote.source,
        effectiveAt: new Date(
          quote.effectiveAt,
        ),
      });

    return {
      fromCurrency: saved.fromCurrency,
      toCurrency: saved.toCurrency,
      rate: saved.rate.toNumber(),
      source: saved.source,
      effectiveAt: saved.effectiveAt,
    };
  },
};