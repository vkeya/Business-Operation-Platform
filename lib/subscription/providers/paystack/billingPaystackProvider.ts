import "server-only";

import type {
  BillingPaymentProvider,
  BillingPaymentProviderRequest,
  BillingPaymentProviderResult,
} from "@/lib/subscription/billingPaymentProvider";

import {
  getPaystackSecretKey,
} from "@/lib/subscription/providers/paystack/paystackConfiguration";

type PaystackPaymentMethod = "MPESA" | "CARD";

interface PaystackApiResponse {
  status: boolean;
  message: string;
  data?: {
    reference?: string;
    status?: string;
    display_text?: string;
    authorization_url?: string;
    access_code?: string;
  };
}

function getPaymentMethod(
  request: BillingPaymentProviderRequest,
): PaystackPaymentMethod {
  const paymentMethod =
    request.metadata?.paymentMethod
      ?.trim()
      .toUpperCase();

  if (
    paymentMethod !== "MPESA" &&
    paymentMethod !== "CARD"
  ) {
    throw new Error(
      "Paystack payment method must be MPESA or CARD.",
    );
  }

  return paymentMethod;
}

function getCustomerEmail(
  request: BillingPaymentProviderRequest,
): string {
  const email =
    request.metadata?.customerEmail?.trim();

  if (!email) {
    throw new Error(
      "Customer email is required for Paystack subscription billing.",
    );
  }

  return email;
}

function getCustomerPhone(
  request: BillingPaymentProviderRequest,
): string {
  const phone =
    request.metadata?.customerPhone?.trim();

  if (!phone) {
    throw new Error(
      "Customer M-Pesa phone number is required for Paystack M-Pesa billing.",
    );
  }

  return phone;
}

function getPaystackCallbackUrl() {
  const appUrl = process.env.APP_URL?.trim();

  if (!appUrl) {
    throw new Error(
      "APP_URL must be configured for Paystack subscription billing.",
    );
  }

  const callbackUrl = `${appUrl}/settings/subscription/payment`;

  if (
    process.env.NODE_ENV === "production" &&
    !callbackUrl.startsWith("https://")
  ) {
    throw new Error(
      "Paystack subscription callback URL must use HTTPS in production.",
    );
  }

  return callbackUrl;
}

function toSubunit(amount: number): number {
  const subunitAmount =
    Math.round(amount * 100);

  if (
    !Number.isSafeInteger(subunitAmount) ||
    subunitAmount <= 0
  ) {
    throw new Error(
      "Paystack billing amount is invalid.",
    );
  }

  return subunitAmount;
}

async function callPaystack(
  path: string,
  body: Record<string, unknown>,
): Promise<PaystackApiResponse> {
  const response = await fetch(
    `https://api.paystack.co${path}`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${getPaystackSecretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

    const responseText = await response.text();

  let payload: PaystackApiResponse;

  try {
    payload = JSON.parse(responseText) as PaystackApiResponse;
  } catch {
    throw new Error(
      `Paystack returned a non-JSON response (HTTP ${response.status}): ${
        responseText.slice(0, 500) || "empty response"
      }`,
    );
  }

  if (!response.ok || !payload.status) {
    throw new Error(
      payload.message ||
        `Paystack request failed with status ${response.status}.`,
    );
  }

  return payload;
}

export const billingPaystackProvider:
  BillingPaymentProvider = {
  provider: "PAYSTACK",

  async initiate(
    request: BillingPaymentProviderRequest,
  ): Promise<BillingPaymentProviderResult> {
    const currency =
      request.currency.trim().toUpperCase();

    if (currency !== "KES") {
      throw new Error(
        "Paystack subscription billing currently supports KES only.",
      );
    }

    const paymentMethod =
      getPaymentMethod(request);

    const customerEmail =
      getCustomerEmail(request);

    const amount =
      toSubunit(request.amount);

    if (paymentMethod === "MPESA") {
      const customerPhone =
        getCustomerPhone(request);

      const result =
        await callPaystack(
          "/charge",
          {
            email: customerEmail,
            amount,
            currency,
            mobile_money: {
              phone: customerPhone,
              provider: "mpesa",
            },
            reference: request.reference,
            metadata: {
              businessId: request.businessId,
              invoiceId: request.invoiceId,
              paymentId: request.paymentId,
            },
          },
        );

      return {
        status: "PENDING",
        providerReference:
          result.data?.reference,
        providerResponse: {
          status: result.data?.status,
          displayText:
            result.data?.display_text,
          message: result.message,
        },
        message:
          result.data?.display_text ||
          result.message ||
          "Paystack M-Pesa payment request sent.",
      };
    }

    const result =
      await callPaystack(
        "/transaction/initialize",
        {
          email: customerEmail,
          amount,
          currency,
          reference: request.reference,
          callback_url:
            getPaystackCallbackUrl(),
          channels: ["card"],
          metadata: {
            businessId: request.businessId,
            invoiceId: request.invoiceId,
            paymentId: request.paymentId,
          },
        },
      );

    return {
      status: "PENDING",
      providerReference:
        result.data?.reference,
      providerResponse: {
        authorizationUrl:
          result.data?.authorization_url,
        accessCode:
          result.data?.access_code,
        message: result.message,
      },
      message:
        result.message ||
        "Paystack checkout is ready.",
    };
  },
};