import "server-only";

import {
  getMpesaOAuthUrl,
} from "./mpesaConfig";

import type {
  MpesaEnvironment,
  MpesaOAuthResponse,
} from "./mpesaTypes";

export async function getMpesaAccessToken(
  input: {
    environment: MpesaEnvironment;
    consumerKey: string;
    consumerSecret: string;
  },
) {
  const credentials = Buffer.from(
    `${input.consumerKey}:${input.consumerSecret}`,
  ).toString("base64");

  const response = await fetch(
    getMpesaOAuthUrl(input.environment),
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const body =
    (await response.json()) as
      | MpesaOAuthResponse
      | {
          errorCode?: string;
          errorMessage?: string;
        };

  if (!response.ok) {
    throw new Error(
      `M-Pesa OAuth failed: ${
        "errorMessage" in body
          ? body.errorMessage
          : response.statusText
      }`,
    );
  }

  if (
    !("access_token" in body) ||
    !body.access_token
  ) {
    throw new Error(
      "M-Pesa OAuth response did not contain an access token.",
    );
  }

  return body.access_token;
}