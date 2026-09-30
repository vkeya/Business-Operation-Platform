import type { Prisma } from "../../generated/prisma/client";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "apiSecret",
  "consumerKey",
  "consumerSecret",
  "passkey",
  "authorization",
  "cookie",
  "sessionToken",
  "cardNumber",
  "cvv",
]);

export function sanitizeAuditData(
  value: Prisma.InputJsonValue,
): Prisma.InputJsonValue {
  if (value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      sanitizeAuditData(item as Prisma.InputJsonValue),
    );
  }

  if (typeof value !== "object") {
    return value;
  }

  const result: Record<string, Prisma.InputJsonValue> = {};

  for (const [key, item] of Object.entries(
    value as Record<string, Prisma.InputJsonValue>,
  )) {
    if (SENSITIVE_KEYS.has(key)) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = sanitizeAuditData(item);
    }
  }

  return result;
}