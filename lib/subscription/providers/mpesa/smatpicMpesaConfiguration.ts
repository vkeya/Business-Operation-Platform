import "server-only";

import type { MpesaServerCredentials } from "@/lib/payment/providers/mpesa/mpesaTypes";

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} must be configured for SmatPic subscription M-Pesa billing.`,
    );
  }

  return value;
}

export function getSmatpicMpesaCredentials(): MpesaServerCredentials {
  const environment =
    requireEnvironmentVariable("SMATPIC_MPESA_ENVIRONMENT").toUpperCase();

  if (environment !== "SANDBOX" && environment !== "PRODUCTION") {
    throw new Error(
      "SMATPIC_MPESA_ENVIRONMENT must be SANDBOX or PRODUCTION.",
    );
  }

  const merchantType =
    process.env.SMATPIC_MPESA_MERCHANT_TYPE?.trim().toUpperCase() ||
    "PAYBILL";

  if (merchantType !== "TILL" && merchantType !== "PAYBILL") {
    throw new Error(
      "SMATPIC_MPESA_MERCHANT_TYPE must be TILL or PAYBILL.",
    );
  }

  return {
    businessId: "SMATPIC",
    merchantType,
    shortcode: requireEnvironmentVariable(
      "SMATPIC_MPESA_SHORTCODE",
    ),
    environment,
    consumerKey: requireEnvironmentVariable(
      "SMATPIC_MPESA_CONSUMER_KEY",
    ),
    encryptedConsumerSecret: requireEnvironmentVariable(
      "SMATPIC_MPESA_CONSUMER_SECRET",
    ),
    encryptedPasskey: requireEnvironmentVariable(
      "SMATPIC_MPESA_PASSKEY",
    ),
  };
}