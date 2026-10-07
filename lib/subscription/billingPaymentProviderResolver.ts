import {
  billingMpesaProvider,
} from "@/lib/subscription/providers/mpesa/billingMpesaProvider";
import {
  billingPaystackProvider,
} from "@/lib/subscription/providers/paystack/billingPaystackProvider";

import type {
  BillingPaymentProvider,
} from "@/lib/subscription/billingPaymentProvider";

export function getBillingPaymentProvider(
  providerName: string,
): BillingPaymentProvider {
  const normalizedProvider =
    providerName.trim().toUpperCase();

  switch (normalizedProvider) {
    case "MPESA":
      return billingMpesaProvider;

    case "PAYSTACK":
      return billingPaystackProvider;

    default:
      throw new Error(
        `Unsupported billing payment provider: ${normalizedProvider}.`,
      );
  }
}