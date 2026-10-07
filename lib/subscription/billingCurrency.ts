export const SUPPORTED_BILLING_CURRENCIES = ["KES", "USD"] as const;

export type BillingCurrency =
  (typeof SUPPORTED_BILLING_CURRENCIES)[number];

export function isSupportedBillingCurrency(
  currency: string,
): currency is BillingCurrency {
  return SUPPORTED_BILLING_CURRENCIES.includes(
    currency.trim().toUpperCase() as BillingCurrency,
  );
}