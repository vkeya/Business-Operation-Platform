import type {
  ExternalPaymentProvider,
  ExternalPaymentRequest,
  ExternalPaymentResult,
} from "../paymentProvider";
import {
  paymentProviders,
} from "../paymentProviders";

export const pesapalProvider:
  ExternalPaymentProvider = {
  method: "CARD",

  async initiate(
    _request: ExternalPaymentRequest,
  ): Promise<ExternalPaymentResult> {
    throw new Error(
      `${paymentProviders.PESAPAL} card payments are not configured yet.`,
    );
  },
};