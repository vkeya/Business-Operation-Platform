 
import "server-only";

import {
  createMpesaPassword,
  createMpesaTimestamp,
  normalizeMpesaPhone,
} from "./mpesaConfig";

import {
  getMpesaAccessToken,
} from "./mpesaAuth";

import type {
  MpesaServerCredentials,
} from "./mpesaTypes";

export interface QueryMpesaStkPushInput {
  credentials: MpesaServerCredentials;
  consumerSecret: string;
  passkey: string;
  checkoutRequestId: string;
}

export interface MpesaStkQueryResponse {
  ResponseCode?: string;
  ResponseDescription?: string;
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResultCode?: string;
  ResultDesc?: string;
  errorCode?: string;
  errorMessage?: string;

  /*
   * Daraja may return HTTP 500 with
   * errorCode 500.001.1001 while the
   * STK transaction is still processing.
   */
  queryStatus?:
    | "PENDING"
    | "UNKNOWN";
}

function getMpesaStkQueryUrl(
  environment: MpesaServerCredentials["environment"],
) {
  if (environment === "PRODUCTION") {
    return "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query";
  }

  return "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";
}

export async function queryMpesaStkPush(
  input: QueryMpesaStkPushInput,
): Promise<MpesaStkQueryResponse> {
  if (!input.checkoutRequestId.trim()) {
    throw new Error(
      "M-Pesa CheckoutRequestID is required.",
    );
  }

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

  const payload = {
    BusinessShortCode:
      Number(input.credentials.shortcode),

    Password:
      password,

    Timestamp:
      timestamp,

    CheckoutRequestID:
      input.checkoutRequestId,
  };

  console.log(
    "M-Pesa STK Query request:",
    {
      environment:
        input.credentials.environment,
      businessShortCode:
        input.credentials.shortcode,
      checkoutRequestId:
        input.checkoutRequestId,
      timestamp,
      passwordLength:
        password.length,
    },
  );

  const response =
    await fetch(
      getMpesaStkQueryUrl(
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
        body:
          JSON.stringify(payload),

        cache: "no-store",
      },
    );

  const responseText =
  await response.text();

let body:
  MpesaStkQueryResponse = {};

try {
  body =
    JSON.parse(responseText) as
      MpesaStkQueryResponse;
} catch {
  console.error(
    "M-Pesa STK Query returned non-JSON response:",
    responseText,
  );
}

  console.log(
    "M-Pesa STK Query response:",
    {
      httpStatus:
        response.status,

      responseCode:
        body.ResponseCode,

      responseDescription:
        body.ResponseDescription,

      resultCode:
        body.ResultCode,

      resultDesc:
        body.ResultDesc,

      errorCode:
        body.errorCode,

      errorMessage:
        body.errorMessage,
    },
  );

  if (!response.ok) {
  /*
   * Daraja uses HTTP 500 / 500.001.1001
   * for an STK transaction that is still
   * being processed.
   *
   * This is NOT a payment failure.
   */
  if (
    response.status === 500 &&
    body.errorCode === "500.001.1001"
  ) {
    console.log(
      "M-Pesa STK transaction is still processing:",
      {
        checkoutRequestId:
          input.checkoutRequestId,

        errorCode:
          body.errorCode,
      },
    );

    return {
      ...body,
      queryStatus: "PENDING" as const,
    };
  }

  console.error(
    "M-Pesa STK Query rejected:",
    {
      status:
        response.status,

      statusText:
        response.statusText,

      responseHeaders:
        Object.fromEntries(
          response.headers.entries(),
        ),

      responseBody:
        responseText,
    },
  );

  throw new Error(
    body.errorMessage ||
      body.ResponseDescription ||
      `M-Pesa STK Query failed with HTTP ${response.status}.`,
  );
}

  return body;
}