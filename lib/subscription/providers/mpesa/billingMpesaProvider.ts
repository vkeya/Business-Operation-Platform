import "server-only";

import {
  decryptSecret,
} from "@/lib/security/encryption";

import {
  getSmatpicMpesaCredentials,
} from "@/lib/subscription/providers/mpesa/smatpicMpesaConfiguration";

import {
  initiateMpesaStkPush,
} from "@/lib/payment/providers/mpesa/mpesaStkPush";

import type {
  BillingPaymentProvider,
  BillingPaymentProviderRequest,
  BillingPaymentProviderResult,
} from "@/lib/subscription/billingPaymentProvider";

function getBillingMpesaCallbackUrl(): string {
  const appUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "APP_URL or NEXT_PUBLIC_APP_URL must be configured for M-Pesa billing callbacks.",
    );
  }

  const normalizedUrl = appUrl.replace(/\/$/, "");

  if (
    process.env.NODE_ENV === "production" &&
    !normalizedUrl.startsWith("https://")
  ) {
    throw new Error(
      "M-Pesa production billing callbacks require an HTTPS APP_URL.",
    );
  }

  return `${normalizedUrl}/api/billing/providers/mpesa/callback`;
}

function getCustomerPhone(
  request: BillingPaymentProviderRequest,
): string {
  const customerPhone =
    request.metadata?.customerPhone?.trim();

  if (!customerPhone) {
    throw new Error(
      "Customer M-Pesa phone number is required for subscription billing.",
    );
  }

  return customerPhone;
}

export const billingMpesaProvider:
  BillingPaymentProvider = {
  provider: "MPESA",

  async initiate(
    request: BillingPaymentProviderRequest,
  ): Promise<BillingPaymentProviderResult> {
    const customerPhone =
      getCustomerPhone(request);

    const currency =
      request.currency.trim().toUpperCase();

    if (currency !== "KES") {
      throw new Error(
        "M-Pesa subscription billing currently supports KES only.",
      );
    }

    const credentials =
      getSmatpicMpesaCredentials();

    const consumerSecret =
      decryptSecret(
        credentials.encryptedConsumerSecret,
      );

    const passkey =
      decryptSecret(
        credentials.encryptedPasskey,
      );

    const result =
      await initiateMpesaStkPush({
        credentials,
        consumerSecret,
        passkey,

        amount: request.amount,

        phoneNumber:
          customerPhone,

        callbackUrl:
          getBillingMpesaCallbackUrl(),

        accountReference:
          request.reference,

        transactionDescription:
          request.description ||
          `SmatPic subscription ${request.reference}`,
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
        "Subscription payment request sent. Waiting for customer confirmation.",
    };
  },
};