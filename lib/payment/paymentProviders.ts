export const paymentProviders = {
  PESAPAL: "PESAPAL",
} as const;

export type PaymentProvider =
  (typeof paymentProviders)[keyof typeof paymentProviders];