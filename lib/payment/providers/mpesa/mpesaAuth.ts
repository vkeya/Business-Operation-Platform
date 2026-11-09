
import "server-only";

import { getMpesaOAuthUrl } from "./mpesaConfig";
import type { MpesaEnvironment} from "./mpesaTypes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function getMpesaAccessToken(input: {
  environment: MpesaEnvironment;
  consumerKey: string;
  consumerSecret: string;
}) {
  const credentials = Buffer.from(
    `${input.consumerKey}:${input.consumerSecret}`,
  ).toString("base64");

  const response = await fetch(getMpesaOAuthUrl(input.environment), {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const rawBody = await response.text();

  let body: unknown = null;
  let parseFailed = false;

  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      parseFailed = true;
    }
  }

  if (!response.ok) {
    const providerMessage = isRecord(body)
      ? [
          body.errorMessage,
          body.error_description,
          body.message,
        ].find(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        )
      : undefined;

    const providerCode = isRecord(body)
      ? [
          body.errorCode,
          body.error,
        ].find(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        )
      : undefined;

    const detail = providerMessage?.trim().slice(0, 200);
    const code = providerCode?.trim().slice(0, 100);

    throw new Error(
      `M-Pesa OAuth failed (HTTP ${response.status})${
        code ? ` [${code}]` : ""
      }${detail ? `: ${detail}` : "."}`,
    );
  }

  if (!rawBody.trim()) {
    throw new Error(
      `M-Pesa OAuth returned an empty response (HTTP ${response.status}).`,
    );
  }

  if (parseFailed) {
    throw new Error(
      `M-Pesa OAuth returned an unreadable response (HTTP ${response.status}).`,
    );
  }

  if (!isRecord(body)) {
    throw new Error(
      "M-Pesa OAuth returned an invalid response format.",
    );
  }

  const accessToken = body.access_token;

  if (typeof accessToken !== "string" || !accessToken.trim()) {
    throw new Error(
      "M-Pesa OAuth response did not contain a valid access token.",
    );
  }

  return accessToken;
}
