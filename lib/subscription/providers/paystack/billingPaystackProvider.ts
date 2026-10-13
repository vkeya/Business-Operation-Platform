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

export type PaystackInitiationOutcome = "DEFINITIVE_FAILURE" | "AMBIGUOUS";

export class PaystackInitiationError extends Error {
  readonly outcome: PaystackInitiationOutcome;

  constructor(message: string, outcome: PaystackInitiationOutcome) {
    super(message);
    this.name = "PaystackInitiationError";
    this.outcome = outcome;
  }
}

function definitiveInitiationError(message: string): PaystackInitiationError {
  return new PaystackInitiationError(message, "DEFINITIVE_FAILURE");
}


interface PaystackApiResponse {
  status: boolean;
  message: string;
  data?: {
    reference?: string;
    status?: string;
	message?: string;
    amount?: number;
    currency?: string;
    display_text?: string;
    authorization_url?: string;
    access_code?: string;
  };
}

export interface PaystackPaymentVerification {
  reference: string;
  status: string;
  amount?: number;
  currency?: string;
  message?: string;
}

/**
 * Verify an existing Paystack attempt without initiating another charge.
 * M-Pesa charges and card transactions use different Paystack verification endpoints.
 */
export async function verifyPaystackPayment(
  reference: string,
  paymentMethod: PaystackPaymentMethod,
): Promise<PaystackPaymentVerification> {
  const normalizedReference = reference.trim();

  if (!normalizedReference) {
    throw new Error("Paystack payment reference is required for verification.");
  }

  const path = paymentMethod === "MPESA"
    ? `/charge/${encodeURIComponent(normalizedReference)}`
    : `/transaction/verify/${encodeURIComponent(normalizedReference)}`;

  const response = await fetch(`https://api.paystack.co${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
      "User-Agent": "SmatPic-Billing/1.0",
    },
    cache: "no-store",
  });

  const responseText = await response.text();
  let payload: PaystackApiResponse;

  try {
    payload = JSON.parse(responseText) as PaystackApiResponse;
  } catch {
    throw new Error(
      `Paystack verification returned a non-JSON response (HTTP ${response.status}).`,
    );
  }

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(
      payload.message || `Paystack verification failed with status ${response.status}.`,
    );
  }

  return {
    reference: payload.data.reference?.trim() ?? "",
    status: payload.data.status?.trim().toLowerCase() ?? "",
    amount: payload.data.amount,
    currency: payload.data.currency?.trim().toUpperCase(),
    message:
      payload.data.message?.trim() ||
      payload.message,
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
      throw definitiveInitiationError(
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
    throw definitiveInitiationError(
      "Customer email is required for Paystack subscription billing.",
    );
  }

  return email;
}

function getCustomerPhone(
  request: BillingPaymentProviderRequest,
): string {
  const input =
    request.metadata?.customerPhone?.trim().replace(/\s+/g, "");

  if (!input) {
    throw definitiveInitiationError(
      "Customer M-Pesa phone number is required for Paystack M-Pesa billing.",
    );
  }

  let phone = input;

  if (phone.startsWith("+")) {
    phone = phone.substring(1);
  }

  if (phone.startsWith("0")) {
    phone = `254${phone.substring(1)}`;
  }

  if (!/^254(?:7|1)\d{8}$/.test(phone)) {
    throw definitiveInitiationError(
      "Enter a valid Kenyan M-Pesa number, e.g. 254712345678.",
    );
  }

  return `+${phone}`;
}

function getPaystackCallbackUrl() {
  const appUrl = process.env.APP_URL?.trim();

  if (!appUrl) {
    throw definitiveInitiationError(
      "APP_URL must be configured for Paystack subscription billing.",
    );
  }

  const callbackUrl = `${appUrl}/settings/subscription/payment`;

  if (
    process.env.NODE_ENV === "production" &&
    !callbackUrl.startsWith("https://")
  ) {
    throw definitiveInitiationError(
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
    throw definitiveInitiationError(
      "Paystack billing amount is invalid.",
    );
  }

  return subunitAmount;
}

function getProviderReference(
  response: PaystackApiResponse,
  expectedReference: string,
): string {
  // The request was sent with expectedReference. If the accepted response
  // omits its reference, retain the request reference for traceability.
  return response.data?.reference?.trim() || expectedReference;
}

async function callPaystack(
  path: string,
  body: Record<string, unknown>,
): Promise<PaystackApiResponse> {
  let secretKey: string;
  try {
    secretKey = getPaystackSecretKey();
  } catch (error) {
    throw definitiveInitiationError(
      error instanceof Error
        ? error.message
        : "Paystack secret key is not configured.",
    );
  }

  let response: Response;
  try {
    response = await fetch(
      `https://api.paystack.co${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          "User-Agent": "SmatPic-Billing/1.0",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
  } catch (error) {
    throw new PaystackInitiationError(
      error instanceof Error
        ? `Paystack initiation outcome is unknown: ${error.message}`
        : "Paystack initiation outcome is unknown after a network failure.",
      "AMBIGUOUS",
    );
  }


  const responseText = await response.text();

  let payload: PaystackApiResponse;

  try {
    payload = JSON.parse(responseText) as PaystackApiResponse;
  } catch {
    const ambiguousHttpOutcome =
      response.status === 408 ||
      response.status === 429 ||
      response.status >= 500;

    throw new PaystackInitiationError(
      `Paystack returned a non-JSON response (HTTP ${response.status}).`,
      ambiguousHttpOutcome ? "AMBIGUOUS" : "DEFINITIVE_FAILURE",
    );
  }
  
    console.info("[Paystack billing initiation diagnostic]", {
    endpoint: path,
    httpStatus: response.status,
    accepted: response.ok && payload.status === true,
    message: payload.message,
    chargeStatus: payload.data?.status ?? null,
    displayText: payload.data?.display_text ?? null,
    hasReference: Boolean(payload.data?.reference),
    referenceMatchesRequest:
      typeof body.reference === "string" &&
      payload.data?.reference === body.reference,
  });

  if (!response.ok || !payload.status) {
    const message =
      payload.message ||
      `Paystack request failed with status ${response.status}.`;

    const ambiguousHttpOutcome =
      response.status === 408 ||
      response.status === 429 ||
      response.status >= 500;

    throw new PaystackInitiationError(
      message,
      ambiguousHttpOutcome ? "AMBIGUOUS" : "DEFINITIVE_FAILURE",
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
      throw definitiveInitiationError(
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

      const responseReference = result.data?.reference?.trim();
      const providerReference = getProviderReference(
        result,
        request.reference,
      );
      const referenceWarning = !responseReference
        ? "Paystack accepted the M-Pesa request but omitted its transaction reference."
        : responseReference !== request.reference
          ? "Paystack returned an M-Pesa transaction reference different from the requested reference."
          : undefined;

      return {
        status: referenceWarning ? "PROCESSING" : "PENDING",
        providerReference,
        providerResponse: {
          paymentMethod,
          status: result.data?.status,
          displayText:
            result.data?.display_text,
          message: result.message,
          ...(referenceWarning
            ? { initializationWarning: referenceWarning }
            : {}),
        },
        message:
          referenceWarning
            ? `${referenceWarning} Do not retry this payment until its status is verified.`
            : result.data?.display_text ||
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

    const responseReference = result.data?.reference?.trim();
    const providerReference = getProviderReference(
      result,
      request.reference,
    );
    const authorizationUrl =
      result.data?.authorization_url?.trim();

    let safeAuthorizationUrl: string | undefined;
    const warnings: string[] = [];

    if (!responseReference) {
      warnings.push(
        "Paystack accepted card initialization but omitted its transaction reference.",
      );
    } else if (responseReference !== request.reference) {
      warnings.push(
        "Paystack returned a card transaction reference different from the requested reference.",
      );
    }

    if (!authorizationUrl) {
      warnings.push(
        "Paystack responded to card initialization without a checkout URL.",
      );
    } else {
      try {
        const parsedAuthorizationUrl = new URL(authorizationUrl);
        if (parsedAuthorizationUrl.protocol !== "https:") {
          warnings.push(
            "Paystack returned a card checkout URL that does not use HTTPS.",
          );
        } else {
          safeAuthorizationUrl = parsedAuthorizationUrl.toString();
        }
      } catch {
        warnings.push(
          "Paystack returned an invalid card checkout URL.",
        );
      }
    }

    if (warnings.length > 0) {
      const initializationWarning = warnings.join(" ");
      return {
        status: "PROCESSING",
        providerReference,
        providerResponse: {
          paymentMethod,
          status: result.data?.status,
          ...(safeAuthorizationUrl
            ? { authorizationUrl: safeAuthorizationUrl }
            : {}),
          accessCode: result.data?.access_code,
          message: result.message,
          initializationWarning,
        },
        message:
          `${initializationWarning} Do not retry this payment until its status is verified.`,
      };
    }

    return {
      status: "PENDING",
      providerReference,
      providerResponse: {
        paymentMethod,
        authorizationUrl: safeAuthorizationUrl!,
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
