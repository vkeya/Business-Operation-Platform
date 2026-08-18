export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

export const currencies: CurrencyOption[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    decimals: 2,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    decimals: 2,
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    decimals: 2,
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    decimals: 2,
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
    symbol: "USh",
    decimals: 0,
  },
  {
    code: "TZS",
    name: "Tanzanian Shilling",
    symbol: "TSh",
    decimals: 2,
  },
  {
    code: "SSP",
    name: "South Sudanese Pound",
    symbol: "SSP",
    decimals: 2,
  },
  {
    code: "RWF",
    name: "Rwandan Franc",
    symbol: "FRw",
    decimals: 0,
  },
  {
    code: "ETB",
    name: "Ethiopian Birr",
    symbol: "Br",
    decimals: 2,
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    decimals: 2,
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    decimals: 2,
  },
];

export function getCurrency(code: string) {
  return currencies.find(
    (currency) => currency.code === code.toUpperCase(),
  );
}

export function getCurrencyLabel(code: string) {
  const currency = getCurrency(code);

  if (!currency) {
    return code.toUpperCase();
  }

  return `${currency.code} — ${currency.name}`;
}