import "server-only";

import {
  getMpesaBaseUrl,
} from "./mpesaConfig";

import {
  getMpesaAccessToken,
} from "./mpesaAuth";

import type {
  MpesaEnvironment,
} from "./mpesaTypes";

export async function mpesaRequest<T>(
  input: {
    environment: MpesaEnvironment;
    consumerKey: string;
    consumerSecret: string;
    path: string;
    method?: "GET" | "POST";
    body?: unknown;
  },
): Promise<T> {
  const accessToken = await getMpesaAccessToken({
    environment: input.environment,
    consumerKey: input.consumerKey,
    consumerSecret: input.consumerSecret,
  });

  const response = await fetch(
    `${getMpesaBaseUrl(input.environment)}${input.path}`,
    {
      method: input.method ?? "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body:
        input.body !== undefined
          ? JSON.stringify(input.body)
          : undefined,
      cache: "no-store",
    },
  );

  const rawBody = await response.text();

  let body: unknown;

  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    body = rawBody;
  }

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "errorMessage" in body &&
      typeof body.errorMessage === "string"
        ? body.errorMessage
        : response.statusText;

    throw new Error(
      `M-Pesa API request failed (${response.status}): ${message}`,
    );
  }

  return body as T;
}