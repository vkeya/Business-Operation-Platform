import "server-only";

import { prisma } from "@/lib/database/prisma";
import {
  generateBusinessReference,
} from "@/lib/business/reference/referenceGenerator";
import {
  postPaymentToAccounting,
} from "@/lib/accounting/posting/paymentPosting";
import {
  parseMpesaCallback,
} from "./mpesaCallback";
import {
  paymentRepository,
} from "@/lib/payment/paymentRepository";
import {
  saleCompletionService,
} from "@/lib/sales/saleCompletionService";

export interface MpesaCallbackPayload {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: {
        Item?: Array<{
          Name?: string;
          Value?: string | number;
        }>;
      };
    };
  };
}

export const mpesaCallbackService = {
  async process(
    payload: MpesaCallbackPayload,
  ) {
    const callback =
      parseMpesaCallback(payload);

    const attempt =
      await prisma.paymentAttempt.findFirst({
        where: {
          provider: "MPESA",
          providerReference:
            callback.checkoutRequestId,
        },
      });

    if (!attempt) {
      throw new Error(
        `No payment attempt found for CheckoutRequestID ${callback.checkoutRequestId}.`,
      );
    }

	/*
 * Safaricom may retry callbacks.
 *
 * Terminal attempts must be handled idempotently
 * before validating the original provider response.
 *
 * Once an attempt is PAID or FAILED, there is
 * nothing more to process.
 */
if (attempt.status === "PAID") {
  return {
    success: true,
    alreadyProcessed: true,
    status: "PAID" as const,
    attemptId: attempt.id,
  };
}

if (attempt.status === "FAILED") {
  return {
    success: true,
    alreadyProcessed: true,
    status: "FAILED" as const,
    attemptId: attempt.id,
  };
}

	    /*
     * Bind the callback to the original Daraja request.
     *
     * The CheckoutRequestID identifies the payment attempt.
     * The MerchantRequestID must also match the value returned
     * by Daraja when the STK request was initiated.
     *
     * This prevents a callback carrying a valid-looking
     * CheckoutRequestID from being accepted with a different
     * MerchantRequestID.
     */
    const providerResponse =
  attempt.providerResponse;

if (
  !providerResponse ||
  typeof providerResponse !== "object" ||
  Array.isArray(providerResponse)
) {
  throw new Error(
    "M-Pesa payment attempt is missing the original provider response.",
  );
}

const originalMerchantRequestId =
  "providerResponse" in providerResponse &&
  providerResponse.providerResponse &&
  typeof providerResponse.providerResponse === "object" &&
  !Array.isArray(providerResponse.providerResponse) &&
  "merchantRequestId" in providerResponse.providerResponse &&
  typeof providerResponse.providerResponse.merchantRequestId === "string"
    ? providerResponse.providerResponse.merchantRequestId
    : "merchantRequestId" in providerResponse &&
        typeof providerResponse.merchantRequestId === "string"
      ? providerResponse.merchantRequestId
      : null;

if (!originalMerchantRequestId) {
  throw new Error(
    "M-Pesa payment attempt is missing the original MerchantRequestID.",
  );
}

if (
  originalMerchantRequestId !==
  callback.merchantRequestId
) {
  throw new Error(
    "M-Pesa callback MerchantRequestID does not match the original payment request.",
  );
}


    /*
     * ResultCode !== 0 means the M-Pesa
     * transaction was not completed.
     *
     * Atomically transition PENDING → FAILED.
     */
    if (callback.resultCode !== 0) {
      const result =
        await prisma.$transaction(
          async (tx) => {
            const updated =
              await tx.paymentAttempt.updateMany({
                where: {
                  id: attempt.id,
                  businessId:
                    attempt.businessId,
                  status: "PENDING",
                },
                data: {
                  status: "FAILED",
                  providerResponse:
                    payload as object,
                },
              });

            if (updated.count === 0) {
              const current =
                await tx.paymentAttempt.findUnique({
                  where: {
                    id: attempt.id,
                  },
                });

              return {
                alreadyProcessed:
                  current?.status ===
                  "FAILED" ||
                  current?.status ===
                  "PAID",
                status:
                  current?.status ??
                  "FAILED",
              };
            }

            return {
              alreadyProcessed: false,
              status: "FAILED",
            };
          },
        );

      return {
        success: true,
        ...result,
        attemptId: attempt.id,
        message:
          callback.resultDescription,
      };
    }

    /*
     * Successful callbacks must contain
     * a receipt and a valid amount.
     */
    if (
      callback.amount === undefined ||
      !Number.isFinite(callback.amount) ||
      callback.amount <= 0
    ) {
      throw new Error(
        "Successful M-Pesa callback did not contain a valid payment amount.",
      );
    }


    if (!callback.mpesaReceiptNumber) {
      throw new Error(
        "Successful M-Pesa callback did not contain an M-Pesa receipt number.",
      );
    }

	const confirmedAmount = callback.amount;

    /*
     * The amount must exactly match what
     * SmatPic originally requested.
     */
    if (
      callback.amount !==
      attempt.amount.toNumber()
    ) {
      await prisma.$transaction(
        async (tx) => {
          await tx.paymentAttempt.updateMany({
            where: {
              id: attempt.id,
              businessId:
                attempt.businessId,
              status: "PENDING",
            },
            data: {
              status: "FAILED",
              providerResponse:
                payload as object,
            },
          });
        },
      );

      throw new Error(
        "M-Pesa callback amount does not match the payment attempt.",
      );
    }

    /*
     * Everything below happens in ONE transaction.
     *
     * If payment creation, sale update, reference
     * generation, or accounting fails, the entire
     * transaction rolls back and the attempt remains
     * PENDING so it can be safely retried.
     */
    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Atomically claim the attempt.
           *
           * This is the concurrency protection.
           *
           * If two identical callbacks arrive at
           * the same time, only one can change
           * PENDING → PAID.
           */
          const claimed =
            await tx.paymentAttempt.updateMany({
              where: {
                id: attempt.id,
                businessId:
                  attempt.businessId,
                status: "PENDING",
              },
              data: {
                status: "PAID",
                terminalReference:
                  callback.mpesaReceiptNumber,
                providerResponse:
                  payload as object,
              },
            });

          if (claimed.count === 0) {
            const current =
              await tx.paymentAttempt.findUnique({
                where: {
                  id: attempt.id,
                },
              });

            if (
              current?.status ===
              "PAID"
            ) {
              return {
                success: true,
                alreadyProcessed: true,
                status: "PAID" as const,
                attemptId:
                  attempt.id,
              };
            }

            throw new Error(
              "M-Pesa payment attempt could not be claimed.",
            );
          }

          /*
           * Load the sale and existing payments
           * using the SAME transaction client.
           */
          const sale =
            await paymentRepository.findSaleWithPayments(
              attempt.businessId,
              attempt.saleId,
              tx,
            );

          if (!sale) {
            throw new Error(
              "Sale associated with M-Pesa payment was not found.",
            );
          }

          if (
            sale.status === "CANCELLED"
          ) {
            throw new Error(
              "Cancelled sales cannot receive payments.",
            );
          }

          if (
            sale.status === "REVERSED"
          ) {
            throw new Error(
              "Reversed sales cannot receive payments.",
            );
          }

          const paidAmount =
            sale.payments.reduce(
              (total, payment) =>
                total +
                payment.amount.toNumber(),
              0,
            );

          const outstandingAmount =
            sale.totalAmount.toNumber() -
            paidAmount;

          if (
            outstandingAmount <= 0
          ) {
            throw new Error(
              "Sale has already been fully paid.",
            );
          }

          if (
            confirmedAmount >
            outstandingAmount
          ) {
            throw new Error(
              "M-Pesa callback amount exceeds the outstanding sale balance.",
            );
          }

          const newPaidAmount =
            paidAmount +
            confirmedAmount;

          const paymentStatus =
            newPaidAmount >=
            sale.totalAmount.toNumber()
              ? "PAID"
              : "PARTIAL";

          /*
           * Generate the SmatPic payment reference
           * INSIDE the transaction.
           */
          const paymentReference =
            await generateBusinessReference({
              businessId:
                attempt.businessId,
              referenceType:
                "PAYMENT",
              prefix: "MPESA",
              client: tx,
            });

          /*
           * Create the actual Payment and link
           * it permanently to the PaymentAttempt.
           */
          const payment =
            await paymentRepository.createSalePayment(
              {
                businessId:
                  attempt.businessId,

                saleId:
                  attempt.saleId,

				  operationId:
    `MPESA_PAYMENT:${attempt.id}`,

                paymentAttemptId:
                  attempt.id,

                reference:
                  paymentReference,

                method:
                  "MPESA",

                amount:
                  confirmedAmount,

                currency:
                  attempt.currency,

                notes:
                  `M-Pesa receipt ${callback.mpesaReceiptNumber}`,

                createdBy:
                  attempt.createdBy,
              },
              tx,
            );

          /*
           * Update the sale's payment status.
           */
          await paymentRepository.updateSalePaymentStatus(
            attempt.businessId,
            attempt.saleId,
            paymentStatus,
            tx,
          );

		  console.log("M-Pesa callback: sale payment status updated", {
  saleId: attempt.saleId,
  paymentStatus,
});

          /*
           * Finally post the payment to accounting
           * using the SAME transaction.
           */
          await postPaymentToAccounting({
            businessId:
              payment.businessId,

            paymentId:
              payment.id,

            reference:
              payment.reference,

            amount:
              payment.amount,

            currency:
              payment.currency,

            createdBy:
              payment.createdBy,

            type:
              "SALE",

			  paymentMethod:
  "MPESA",

            client:
              tx,
          });

		  console.log("M-Pesa callback: payment accounting posted", {
  paymentId: payment.id,
  paymentReference: payment.reference,
});

		  /*
 * POS M-Pesa payments create the sale as DRAFT.
 *
 * Once Safaricom confirms the payment, complete
 * the sale using the SAME transaction so that
 * inventory consumption, sale accounting and the
 * final sale status are atomic with the payment.
 */
if (sale.status === "DRAFT") {
  console.log("M-Pesa callback: completing draft sale", {
    saleId: attempt.saleId,
    saleReference: sale.referenceNumber,
  });

  await saleCompletionService.completeDraftSaleWithTx(
  tx,
  attempt.businessId,
  attempt.saleId,
  `SALE_COMPLETE:${attempt.saleId}`,
);

  console.log("M-Pesa callback: draft sale completed", {
    saleId: attempt.saleId,
    saleReference: sale.referenceNumber,
  });
}

          return {
            success: true,
            alreadyProcessed: false,
            status: "PAID" as const,
            attemptId:
              attempt.id,
            paymentId:
              payment.id,
            mpesaReceiptNumber:
              callback.mpesaReceiptNumber,
            message:
              "M-Pesa payment confirmed.",
          };
        },
      );

    return result;
  },
};