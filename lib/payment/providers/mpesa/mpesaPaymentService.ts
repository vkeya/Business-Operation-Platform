import "server-only";
import {
  decryptSecret,
} from "@/lib/security/encryption";

import {
  mpesaConfigurationService,
} from "./mpesaConfigurationService";
import {
  paymentAttemptService,
} from "@/lib/payment/paymentAttemptService";
import {
  queryMpesaStkPush,
} from "./mpesaStkQuery";
import {
  paymentAttemptRepository,
} from "@/lib/payment/paymentAttemptRepository";

import {
  createPaymentProviderService,
} from "@/lib/payment/paymentProviderService";

import {
  mpesaProvider,
} from "./mpesaProvider";

import {
  prisma,
} from "@/lib/database/prisma";

const mpesaPaymentProvider =
  createPaymentProviderService(
    mpesaProvider,
  );

function getMpesaCallbackUrl() {
  const appUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "APP_URL or NEXT_PUBLIC_APP_URL must be configured for M-Pesa callbacks.",
    );
  }

  const normalizedUrl = appUrl.replace(/\/$/, "");

  if (
    process.env.NODE_ENV === "production" &&
    !normalizedUrl.startsWith("https://")
  ) {
    throw new Error(
      "M-Pesa production callbacks require an HTTPS APP_URL.",
    );
  }

  return `${normalizedUrl}/api/payments/providers/mpesa/callback`;
}

export const mpesaPaymentService = {
  async initiateSalePayment(input: {
    businessId: string;
    saleId: string;
    amount: number;
    customerPhone: string;
    createdBy: string;
  }) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    if (!input.customerPhone.trim()) {
      throw new Error(
        "Customer M-Pesa phone number is required.",
      );
    }

    if (
      !Number.isFinite(input.amount) ||
      input.amount <= 0
    ) {
      throw new Error(
        "Payment amount must be greater than zero.",
      );
    }
	
	    

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    /*
     * Never trust currency or outstanding amount
     * from the browser. Read the sale from the
     * authenticated business context.
     */
    const sale =
      await prisma.sale.findFirst({
        where: {
          id: input.saleId,
          businessId: input.businessId,
        },
        include: {
          payments: true,
        },
      });
	  
	  

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    if (sale.status === "CANCELLED") {
      throw new Error(
        "Cancelled sales cannot receive payments.",
      );
    }

    if (sale.status === "REVERSED") {
      throw new Error(
        "Reversed sales cannot receive payments.",
      );
    }

    if (sale.status !== "COMPLETED") {
      throw new Error(
        "Sale must be completed before receiving an M-Pesa payment.",
      );
    }

    const paidAmount =
      sale.payments.reduce(
        (total, payment) =>
          total + payment.amount.toNumber(),
        0,
      );

    const outstandingAmount =
      sale.totalAmount.toNumber() -
      paidAmount;

    if (outstandingAmount <= 0) {
      throw new Error(
        "This sale has already been fully paid.",
      );
    }

    if (input.amount > outstandingAmount) {
      throw new Error(
        "Payment amount exceeds the outstanding sale balance.",
      );
    }

    if (
      sale.currency
        .trim()
        .toUpperCase() !== "KES"
    ) {
      throw new Error(
        "M-Pesa payments currently support KES sales only.",
      );
    }
	
	const credentials =
  await mpesaConfigurationService.getCredentialsForServerUse(
    input.businessId,
  );

if (!credentials) {
  throw new Error(
    "M-Pesa is not configured for this business.",
  );
}

if (!credentials.isActive) {
  throw new Error(
    "M-Pesa configuration is inactive.",
  );
}

if (
  credentials.environment === "PRODUCTION" &&
  !credentials.verifiedAt
) {
  throw new Error(
    "M-Pesa production configuration must be verified before accepting live payments.",
  );
}

    /*
     * Create the attempt BEFORE contacting Daraja.
     * This gives us a durable transaction record
     * even if the provider call fails.
     */
    const attempt =
      await paymentAttemptService.create({
        businessId:
          input.businessId,

        saleId:
          input.saleId,

        provider:
          "MPESA",

        method:
          "MPESA",

        amount:
          input.amount,

        currency:
          sale.currency
            .trim()
            .toUpperCase(),

        createdBy:
          input.createdBy,
      });

    try {
      const result =
        await mpesaPaymentProvider.initiate({
          businessId:
            input.businessId,

          amount:
            input.amount,

          currency:
            sale.currency
              .trim()
              .toUpperCase(),

          reference:
            sale.referenceNumber,

          description:
            `Payment for sale ${sale.referenceNumber}`,

          createdBy:
            input.createdBy,

          customerPhone:
            input.customerPhone,

          callbackUrl:
            getMpesaCallbackUrl(),
        });

      await paymentAttemptRepository
        .updateProviderDetails(
          input.businessId,
          attempt.id,
          {
            providerReference:
              result.providerReference,

            providerResponse:
              result,
          },
        );

      return {
        attemptId:
          attempt.id,

        status:
          result.status,

        providerReference:
          result.providerReference,

        message:
          result.message ||
          "M-Pesa payment request sent. Waiting for customer confirmation.",
      };
    } catch (error) {
      await paymentAttemptService.fail(
        input.businessId,
        attempt.id,
      );

      throw error;
    }
  },
  
    async queryPaymentAttempt(input: {
    businessId: string;
    paymentAttemptId: string;
  }) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.paymentAttemptId) {
      throw new Error(
        "Payment attempt is required.",
      );
    }

    const attempt =
      await paymentAttemptRepository.findById(
        input.businessId,
        input.paymentAttemptId,
      );

    if (!attempt) {
      throw new Error(
        "Payment attempt not found.",
      );
    }

    if (attempt.provider !== "MPESA") {
      throw new Error(
        "Payment attempt is not an M-Pesa transaction.",
      );
    }

    /*
     * Terminal states do not need to query Daraja.
     * This also preserves idempotency.
     */
    if (
      attempt.status === "PAID" ||
      attempt.status === "FAILED"
    ) {
      return {
        status: attempt.status,
        providerReference:
          attempt.providerReference,
        terminalReference:
          attempt.terminalReference,
        providerResponse:
          attempt.providerResponse,
        message:
          "Payment attempt is already in a terminal state.",
      };
    }

    if (!attempt.providerReference) {
      throw new Error(
        "M-Pesa CheckoutRequestID is not available.",
      );
    }

    const credentials =
      await mpesaConfigurationService
        .getCredentialsForServerUse(
          input.businessId,
        );

    if (!credentials) {
      throw new Error(
        "M-Pesa is not configured for this business.",
      );
    }

    if (!credentials.isActive) {
      throw new Error(
        "M-Pesa configuration is inactive.",
      );
    }

    const consumerSecret =
      decryptSecret(
        credentials.encryptedConsumerSecret,
      );

    const passkey =
      decryptSecret(
        credentials.encryptedPasskey,
      );

    const queryResult =
      await queryMpesaStkPush({
        credentials: {
          businessId:
            credentials.businessId,

          merchantType:
            credentials.merchantType,

          shortcode:
            credentials.shortcode,

          environment:
            credentials.environment,

          consumerKey:
            credentials.consumerKey,

          encryptedConsumerSecret:
            credentials.encryptedConsumerSecret,

          encryptedPasskey:
            credentials.encryptedPasskey,
        },

        consumerSecret,

        passkey,

        checkoutRequestId:
          attempt.providerReference,
      });

        /*
     * STK Query is used for reconciliation when the
     * callback has not arrived.
     *
     * 4999 means the transaction is still processing,
     * so the PaymentAttempt must remain PENDING.
     *
     * A non-zero terminal ResultCode means the provider
     * has reported a failed transaction, so we can safely
     * transition the attempt to FAILED.
     *
     * ResultCode 0 is not enough to mark the attempt PAID:
     * settlement still requires the callback metadata,
     * including the M-Pesa receipt and amount.
     */
    const resultCode =
  queryResult.ResultCode?.toString();

const isStillProcessing =
  queryResult.queryStatus === "PENDING" ||
  resultCode === "4999";

if (
  !isStillProcessing &&
  resultCode &&
  resultCode !== "0"
) {
      await paymentAttemptService.fail(
        input.businessId,
        attempt.id,
      );

      return {
        status: "FAILED" as const,
        providerReference:
          attempt.providerReference,
        terminalReference:
          attempt.terminalReference,
        providerResponse:
          queryResult,
        message:
          queryResult.ResultDesc ||
          queryResult.errorMessage ||
          "M-Pesa payment failed.",
      };
    }

    return {
      status: attempt.status,
      providerReference:
        attempt.providerReference,
      terminalReference:
        attempt.terminalReference,
      providerResponse:
        queryResult,
      message:
        isStillProcessing
          ? "M-Pesa payment is still being processed."
          : queryResult.ResultDesc ||
            "M-Pesa payment status received. Waiting for callback settlement.",
    };
  },
  
    async initiatePosPayment(input: {
    businessId: string;
    saleId: string;
    amount: number;
    customerPhone: string;
    createdBy: string;
  }) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    if (!input.customerPhone.trim()) {
      throw new Error(
        "Customer M-Pesa phone number is required.",
      );
    }

    if (
      !Number.isFinite(input.amount) ||
      input.amount <= 0
    ) {
      throw new Error(
        "Payment amount must be greater than zero.",
      );
    }
	
	if (!Number.isInteger(input.amount)) {
      throw new Error(
        "M-Pesa POS payment amount must be a whole number of KES.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    const sale =
      await prisma.sale.findFirst({
        where: {
          id: input.saleId,
          businessId: input.businessId,
        },
        include: {
          payments: true,
        },
      });

    if (!sale) {
      throw new Error(
        "Sale not found.",
      );
    }

    if (sale.status === "CANCELLED") {
      throw new Error(
        "Cancelled sales cannot receive payments.",
      );
    }

    if (sale.status === "REVERSED") {
      throw new Error(
        "Reversed sales cannot receive payments.",
      );
    }

    if (sale.status !== "DRAFT") {
      throw new Error(
        "POS M-Pesa payment requires a draft sale.",
      );
    }

    if (
      sale.currency
        .trim()
        .toUpperCase() !== "KES"
    ) {
      throw new Error(
        "M-Pesa payments currently support KES sales only.",
      );
    }

    const paidAmount =
      sale.payments.reduce(
        (total, payment) =>
          total + payment.amount.toNumber(),
        0,
      );

    const outstandingAmount =
      sale.totalAmount.toNumber() -
      paidAmount;

    if (outstandingAmount <= 0) {
      throw new Error(
        "This sale has already been fully paid.",
      );
    }

    /*
     * POS M-Pesa payments are currently
     * full-sale payments.
     */
    if (input.amount !== outstandingAmount) {
      throw new Error(
        "POS M-Pesa payment amount must equal the outstanding sale balance.",
      );
    }
	
	const credentials =
  await mpesaConfigurationService.getCredentialsForServerUse(
    input.businessId,
  );

if (!credentials) {
  throw new Error(
    "M-Pesa is not configured for this business.",
  );
}

if (!credentials.isActive) {
  throw new Error(
    "M-Pesa configuration is inactive.",
  );
}

if (
  credentials.environment === "PRODUCTION" &&
  !credentials.verifiedAt
) {
  throw new Error(
    "M-Pesa production configuration must be verified before accepting live payments.",
  );
}

    /*
     * Prevent multiple active STK requests
     * for the same draft sale.
     */
    const existingAttempt =
      await prisma.paymentAttempt.findFirst({
        where: {
          businessId:
            input.businessId,

          saleId:
            input.saleId,

          provider:
            "MPESA",

          status:
            "PENDING",
        },
      });

    if (existingAttempt) {
      return {
        attemptId:
          existingAttempt.id,

        status:
          "PENDING" as const,

        providerReference:
          existingAttempt.providerReference,

        message:
          "An M-Pesa payment request is already pending for this sale.",
      };
    }

    /*
     * Create the attempt BEFORE contacting Daraja.
     */
    const attempt =
      await paymentAttemptService.create({
        businessId:
          input.businessId,

        saleId:
          input.saleId,

        provider:
          "MPESA",

        method:
          "MPESA",

        amount:
          input.amount,

        currency:
          sale.currency
            .trim()
            .toUpperCase(),

        createdBy:
          input.createdBy,
      });

    try {
      const result =
        await mpesaPaymentProvider.initiate({
          businessId:
            input.businessId,

          amount:
            input.amount,

          currency:
            sale.currency
              .trim()
              .toUpperCase(),

          reference:
            sale.referenceNumber,

          description:
            `POS ${sale.referenceNumber}`,

          createdBy:
            input.createdBy,

          customerPhone:
            input.customerPhone,

          callbackUrl:
            getMpesaCallbackUrl(),
        });

      await paymentAttemptRepository
        .updateProviderDetails(
          input.businessId,
          attempt.id,
          {
            providerReference:
              result.providerReference,

            providerResponse:
              result,
          },
        );

      return {
        attemptId:
          attempt.id,

        status:
          "PENDING" as const,

        providerReference:
          result.providerReference,

        message:
          result.message ||
          "M-Pesa payment request sent. Waiting for customer confirmation.",
      };
    } catch (error) {
      await paymentAttemptService.fail(
        input.businessId,
        attempt.id,
      );

      throw error;
    }
  },
};