import "server-only";

import type {
  ExternalPaymentProvider,
  ExternalPaymentRequest,
  ExternalPaymentResult,
} from "../../paymentProvider";

import {
  decryptSecret,
} from "@/lib/security/encryption";

import {
  mpesaConfigurationService,
} from "./mpesaConfigurationService";

import {
  initiateMpesaStkPush,
} from "./mpesaStkPush";

export const mpesaProvider:
  ExternalPaymentProvider = {
  method: "MPESA",

  async initiate(
    request: ExternalPaymentRequest,
  ): Promise<ExternalPaymentResult> {
    if (!request.customerPhone) {
      throw new Error(
        "Customer M-Pesa phone number is required.",
      );
    }

    if (!request.callbackUrl) {
      throw new Error(
        "M-Pesa callback URL is required.",
      );
    }

    const credentials =
      await mpesaConfigurationService
        .getCredentialsForServerUse(
          request.businessId,
        );

    if (!credentials) {
      throw new Error(
        "M-Pesa is not configured for this business.",
      );
    }

    if (!credentials.isActive) {
      throw new Error(
        "M-Pesa configuration is inactive.",
      );
    }

    const consumerSecret =
      decryptSecret(
        credentials.encryptedConsumerSecret,
      );

    const passkey =
      decryptSecret(
        credentials.encryptedPasskey,
      );

    if (
      request.currency
        .trim()
        .toUpperCase() !== "KES"
    ) {
      throw new Error(
        "M-Pesa STK Push currently supports KES sales only.",
      );
    }

    const result =
      await initiateMpesaStkPush({
        credentials,
        consumerSecret,
        passkey,

        amount: request.amount,

        phoneNumber:
          request.customerPhone,

        callbackUrl:
          request.callbackUrl,

        accountReference:
          request.reference ||
          "SMATPICPAY",

        transactionDescription:
          request.description ||
          "SmatPic customer payment",
      });

    return {
  status: "PENDING",

  providerReference:
    result.checkoutRequestId,

  providerResponse: {
    merchantRequestId:
      result.merchantRequestId,

    checkoutRequestId:
      result.checkoutRequestId,

    responseCode:
      result.responseCode,

    responseDescription:
      result.responseDescription,

    customerMessage:
      result.customerMessage,
  },

  message:
    result.customerMessage ||
    result.responseDescription ||
    "STK Push sent successfully.",
};
  },
};