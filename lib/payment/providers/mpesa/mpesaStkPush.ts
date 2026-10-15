import "server-only";

import {
  createMpesaPassword,
  createMpesaTimestamp,
  getMpesaStkPushUrl,
  normalizeMpesaPhone,
} from "./mpesaConfig";

import {
  getMpesaAccessToken,
} from "./mpesaAuth";

import type {
  MpesaServerCredentials,
  MpesaStkPushResponse,
} from "./mpesaTypes";

export type MpesaStkPushFailureOutcome =
  | "DEFINITIVE_FAILURE"
  | "AMBIGUOUS";

export class MpesaStkPushInitiationError extends Error {
  constructor(
    message: string,
    public readonly outcome: MpesaStkPushFailureOutcome,
  ) {
    super(message);
    this.name = "MpesaStkPushInitiationError";
  }
}

export interface InitiateMpesaStkPushInput {
  flow: "POS" | "SUBSCRIPTION";
  credentials: MpesaServerCredentials;
  consumerSecret: string;
  passkey: string;

  amount: number;
  phoneNumber: string;

  callbackUrl: string;
  accountReference: string;
  transactionDescription: string;
}

export async function initiateMpesaStkPush(
  input: InitiateMpesaStkPushInput,
) {
  if (
    !Number.isFinite(input.amount) ||
    input.amount <= 0
  ) {
    throw new Error(
      "M-Pesa amount must be greater than zero.",
    );
  }

  /*
   * M-Pesa STK amounts should be whole KES.
   * Do not silently round a customer's invoice.
   */
  if (!Number.isInteger(input.amount)) {
    throw new Error(
      "M-Pesa STK amount must be a whole number of KES.",
    );
  }

  const phoneNumber =
    normalizeMpesaPhone(input.phoneNumber);

  const timestamp =
    createMpesaTimestamp();

  const password =
    createMpesaPassword(
      input.credentials.shortcode,
      input.passkey,
      timestamp,
    );

  const accessToken =
    await getMpesaAccessToken({
      environment:
        input.credentials.environment,
      consumerKey:
        input.credentials.consumerKey,
      consumerSecret:
        input.consumerSecret,
    });

  const transactionType =
    input.credentials.merchantType ===
    "TILL"
      ? "CustomerBuyGoodsOnline"
      : "CustomerPayBillOnline";

  const payload = {
    BusinessShortCode:
      Number(input.credentials.shortcode),

    Password: password,

    Timestamp: timestamp,

    TransactionType:
      transactionType,

    Amount: input.amount,

    PartyA: phoneNumber,

    PartyB:
      Number(input.credentials.shortcode),

    PhoneNumber: phoneNumber,

    CallBackURL:
      input.callbackUrl,

    AccountReference:
      input.accountReference,

    TransactionDesc:
      input.transactionDescription,
  };
  
  
  console.info("M-Pesa STK request diagnostics", {
    environment: input.credentials.environment,
    merchantType: input.credentials.merchantType,
    businessShortCode: input.credentials.shortcode,
    transactionType,
	flow: input.flow,
    amount: input.amount,
    normalizedPhoneLength: phoneNumber.length,
    normalizedPhonePrefix: phoneNumber.slice(0, 3),
    callbackUrlIsHttps: input.callbackUrl.startsWith("https://"),
    callbackUrlHost: (() => {
      try {
        return new URL(input.callbackUrl).host;
      } catch {
        return "INVALID_URL";
      }
    })(),
    accountReferenceLength: input.accountReference.length,
    transactionDescriptionLength:
      input.transactionDescription.length,
  });


  const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 15000);

let response: Response;

try {
  response = await fetch(
    getMpesaStkPushUrl(
      input.credentials.environment,
    ),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    },
  );
} catch (error) {
  throw new MpesaStkPushInitiationError(
    error instanceof Error && error.name === "AbortError"
      ? "M-Pesa STK Push request timed out; provider acceptance is unknown."
      : "M-Pesa STK Push request failed before a response was received; provider acceptance is unknown.",
    "AMBIGUOUS",
  );
} finally {
  clearTimeout(timeout);
}
	  

  let body: MpesaStkPushResponse;

try {
  body = (await response.json()) as MpesaStkPushResponse;
  
  
  console.info("M-Pesa STK initiation response diagnostics", {
    httpStatus: response.status,
    responseCode: body.ResponseCode ?? null,
    responseDescription: body.ResponseDescription ?? null,
    customerMessage: body.CustomerMessage ?? null,
    checkoutRequestIdPresent: Boolean(body.CheckoutRequestID),
    merchantRequestIdPresent: Boolean(body.MerchantRequestID),
  });

  
} catch {
  throw new MpesaStkPushInitiationError(
    "M-Pesa returned an unreadable response; provider acceptance is unknown.",
    "AMBIGUOUS",
  );
}

if (!response.ok) {
  const definitiveHttpRejection =
    response.status >= 400 &&
    response.status < 500 &&
    response.status !== 408 &&
    response.status !== 429;

  throw new MpesaStkPushInitiationError(
    body.errorMessage ||
      body.ResponseDescription ||
      `M-Pesa STK Push returned HTTP ${response.status}.`,
    definitiveHttpRejection
      ? "DEFINITIVE_FAILURE"
      : "AMBIGUOUS",
  );
}

if (
  body.ResponseCode !== undefined &&
  body.ResponseCode !== "0"
) {
  throw new MpesaStkPushInitiationError(
    body.ResponseDescription ||
      body.CustomerMessage ||
      "M-Pesa STK Push was rejected.",
    "DEFINITIVE_FAILURE",
  );
}

if (!body.CheckoutRequestID) {
  throw new MpesaStkPushInitiationError(
    "M-Pesa returned no CheckoutRequestID; provider acceptance is unknown.",
    "AMBIGUOUS",
  );
}
  return {
    merchantRequestId:
      body.MerchantRequestID,

    checkoutRequestId:
      body.CheckoutRequestID,

    responseCode:
      body.ResponseCode,

    responseDescription:
      body.ResponseDescription,

    customerMessage:
      body.CustomerMessage,
  };
}