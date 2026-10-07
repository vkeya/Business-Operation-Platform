export const billingPaymentProviders = {
  MPESA: "MPESA",
} as const;

export type BillingPaymentProviderName =
  (typeof billingPaymentProviders)[keyof typeof billingPaymentProviders];