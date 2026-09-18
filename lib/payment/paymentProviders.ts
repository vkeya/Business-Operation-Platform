export const paymentProviders = {
  PESAPAL: "PESAPAL",
  MPESA: "MPESA",
} as const;

export type PaymentProvider =
  (typeof paymentProviders)[keyof typeof paymentProviders];