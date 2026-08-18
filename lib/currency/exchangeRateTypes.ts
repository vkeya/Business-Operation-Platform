export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  effectiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRateQuote {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  effectiveAt: string;
}