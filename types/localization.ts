export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
}

export interface ExchangeRate {
  id: string;

  businessId: string;

  fromCurrency: string;
  toCurrency: string;

  rate: number;

  source: string;
  effectiveAt: string;

  createdAt: string;
}

export interface LocaleSettings {
  language: string;
  locale: string;

  dateFormat: string;
  timeFormat: string;

  firstDayOfWeek: 0 | 1 | 6;

  numberDecimalPlaces: number;
}

export interface BusinessLocalization {
  businessId: string;

  defaultLanguage: string;
  defaultCurrency: string;

  locale: LocaleSettings;

  supportedLanguages: string[];
  supportedCurrencies: string[];

  updatedAt: string;
}