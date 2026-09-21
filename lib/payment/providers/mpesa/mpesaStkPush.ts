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

export interface InitiateMpesaStkPushInput {
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
        Authorization:
          `Bearer ${accessToken}`,

        "Content-Type":
          "application/json",

        Accept:
          "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    },
  );
} finally {
  clearTimeout(timeout);
}
    

  const body =
    (await response.json()) as
      MpesaStkPushResponse;
	  
console.log("M-Pesa STK Push response:", {
  httpStatus: response.status,
  responseCode: body.ResponseCode,
  responseDescription: body.ResponseDescription,
  merchantRequestId: body.MerchantRequestID,
  checkoutRequestId: body.CheckoutRequestID,
  customerMessage: body.CustomerMessage,
});

  if (!response.ok) {
  console.error("M-Pesa STK Push rejected:", {
    status: response.status,
    statusText: response.statusText,
    errorCode: body.errorCode,
    errorMessage: body.errorMessage,
    responseCode: body.ResponseCode,
    responseDescription: body.ResponseDescription,
  });

  throw new Error(
    body.errorMessage ||
      body.ResponseDescription ||
      `M-Pesa STK Push failed with HTTP ${response.status}.`,
  );
}

  if (
    body.ResponseCode &&
    body.ResponseCode !== "0"
  ) {
    throw new Error(
      body.ResponseDescription ||
        body.CustomerMessage ||
        "M-Pesa STK Push was rejected.",
    );
  }

  if (!body.CheckoutRequestID) {
    throw new Error(
      "M-Pesa did not return a CheckoutRequestID.",
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