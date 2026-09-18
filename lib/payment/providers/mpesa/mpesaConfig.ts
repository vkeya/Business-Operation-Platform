import type { MpesaEnvironment } from "./mpesaTypes";

export function getMpesaBaseUrl(
  environment: MpesaEnvironment,
) {
  return environment === "PRODUCTION"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

export function getMpesaOAuthUrl(
  environment: MpesaEnvironment,
) {
  return `${getMpesaBaseUrl(
    environment,
  )}/oauth/v1/generate?grant_type=client_credentials`;
}

export function getMpesaStkPushUrl(
  environment: MpesaEnvironment,
) {
  return `${getMpesaBaseUrl(
    environment,
  )}/mpesa/stkpush/v1/processrequest`;
}

export function createMpesaTimestamp(
  date = new Date(),
) {
  const parts = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Africa/Nairobi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    },
  ).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [
        part.type,
        part.value,
      ]),
  );

  return [
    values.year,
    values.month,
    values.day,
    values.hour,
    values.minute,
    values.second,
  ].join("");
}

export function createMpesaPassword(
  shortcode: string,
  passkey: string,
  timestamp: string,
) {
  return Buffer.from(
    `${shortcode}${passkey}${timestamp}`,
  ).toString("base64");
}

export function normalizeMpesaPhone(
  phone: string,
) {
  let value = phone.trim().replace(/\s+/g, "");

  if (value.startsWith("+")) {
    value = value.substring(1);
  }

  if (value.startsWith("0")) {
    value = `254${value.substring(1)}`;
  }

  if (!/^254(?:7|1)\d{8}$/.test(value)) {
    throw new Error(
      "Enter a valid Kenyan M-Pesa number, e.g. 254712345678.",
    );
  }

  return value;
}