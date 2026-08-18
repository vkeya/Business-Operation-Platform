export interface CountryOption {
  code: string;
  name: string;
  currency: string;
  language: string;
  timezone: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

export const countryOptions: CountryOption[] = [
  {
    code: "SS",
    name: "South Sudan",
    currency: "SSP",
    language: "en",
    timezone: "Africa/Juba",
  },
  {
    code: "KE",
    name: "Kenya",
    currency: "KES",
    language: "en",
    timezone: "Africa/Nairobi",
  },
  {
    code: "UG",
    name: "Uganda",
    currency: "UGX",
    language: "en",
    timezone: "Africa/Kampala",
  },
  {
    code: "TZ",
    name: "Tanzania",
    currency: "TZS",
    language: "sw",
    timezone: "Africa/Dar_es_Salaam",
  },
  {
    code: "RW",
    name: "Rwanda",
    currency: "RWF",
    language: "en",
    timezone: "Africa/Kigali",
  },
  {
    code: "GH",
    name: "Ghana",
    currency: "GHS",
    language: "en",
    timezone: "Africa/Accra",
  },
  {
    code: "NG",
    name: "Nigeria",
    currency: "NGN",
    language: "en",
    timezone: "Africa/Lagos",
  },
  {
    code: "ZA",
    name: "South Africa",
    currency: "ZAR",
    language: "en",
    timezone: "Africa/Johannesburg",
  },
];

export const languageOptions: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "sw",
    name: "Swahili",
    nativeName: "Kiswahili",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
  },
];

export const currencyOptions: CurrencyOption[] = [
  {
    code: "SSP",
    name: "South Sudanese Pound",
    symbol: "SSP",
    decimalPlaces: 2,
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    decimalPlaces: 2,
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
    symbol: "UGX",
    decimalPlaces: 0,
  },
  {
    code: "TZS",
    name: "Tanzanian Shilling",
    symbol: "TSh",
    decimalPlaces: 2,
  },
  {
    code: "RWF",
    name: "Rwandan Franc",
    symbol: "RWF",
    decimalPlaces: 0,
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "GH₵",
    decimalPlaces: 2,
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    decimalPlaces: 2,
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    decimalPlaces: 2,
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    decimalPlaces: 2,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    decimalPlaces: 2,
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    decimalPlaces: 2,
  },
];