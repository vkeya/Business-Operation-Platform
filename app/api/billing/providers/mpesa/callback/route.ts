import { NextResponse } from "next/server";

import {
  parseMpesaCallback,
} from "@/lib/payment/providers/mpesa/mpesaCallback";

import {
  prisma,
} from "@/lib/database/prisma";

import {
  failBillingPayment,
  succeedBillingPayment,
} from "@/lib/subscription/billingPaymentService";

export async function POST(
  request: Request,
) {
  try {
    const payload =
      await request.json();

    const callback =
      parseMpesaCallback(payload);

    const payment =
      await prisma.billingPayment.findFirst({
        where: {
          provider: "MPESA",
          providerReference:
            callback.checkoutRequestId,
        },
        select: {
          id: true,
          businessId: true,
          amount: true,
          status: true,
          providerResponse: true,
        },
      });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Billing payment not found.",
        },
        { status: 404 },
      );
    }

    /*
     * Safaricom may retry callbacks.
     * Terminal billing payments are already settled.
     */
    if (
      payment.status === "SUCCEEDED" ||
      payment.status === "FAILED" ||
      payment.status === "CANCELLED" ||
      payment.status === "REFUNDED"
    ) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        status: payment.status,
        paymentId: payment.id,
      });
    }

    /*
     * Validate the original MerchantRequestID
     * stored when the billing STK Push was initiated.
     */
    const providerResponse =
      payment.providerResponse;

    if (
      !providerResponse ||
      typeof providerResponse !== "object" ||
      Array.isArray(providerResponse)
    ) {
      throw new Error(
        "Billing payment is missing the original M-Pesa provider response.",
      );
    }

    const originalMerchantRequestId =
      "merchantRequestId" in providerResponse &&
      typeof providerResponse.merchantRequestId === "string"
        ? providerResponse.merchantRequestId
        : null;

    if (!originalMerchantRequestId) {
      throw new Error(
        "Billing payment is missing the original MerchantRequestID.",
      );
    }

    if (
      originalMerchantRequestId !==
      callback.merchantRequestId
    ) {
      throw new Error(
        "M-Pesa billing callback MerchantRequestID does not match the original payment request.",
      );
    }

    /*
     * Non-zero ResultCode means the billing
     * transaction was not completed.
     */
    if (callback.resultCode !== 0) {
      const failedPayment =
        await failBillingPayment(
          payment.businessId,
          payment.id,
          callback.resultDescription ||
            "M-Pesa subscription payment failed.",
        );

      return NextResponse.json({
        success: true,
        alreadyProcessed: false,
        status: failedPayment.status,
        paymentId: payment.id,
        message:
          callback.resultDescription,
      });
    }

    /*
     * Successful callbacks must contain a
     * valid amount and M-Pesa receipt.
     */
    if (
      callback.amount === undefined ||
      !Number.isFinite(callback.amount) ||
      callback.amount <= 0
    ) {
      throw new Error(
        "Successful M-Pesa billing callback did not contain a valid payment amount.",
      );
    }

    if (!callback.mpesaReceiptNumber) {
      throw new Error(
        "Successful M-Pesa billing callback did not contain an M-Pesa receipt number.",
      );
    }

    const expectedAmount =
      payment.amount.toNumber();

    if (
      callback.amount !== expectedAmount
    ) {
      throw new Error(
        "M-Pesa billing callback amount does not match the billing payment.",
      );
    }

    /*
     * Billing reconciliation is handled by the
     * billing payment service. It atomically updates
     * BillingPayment and BillingInvoice.
     */
    const result =
  await succeedBillingPayment(
    payment.businessId,
    payment.id,
  );

if (!result) {
  throw new Error(
    "Billing payment could not be reconciled.",
  );
}

return NextResponse.json({
  success: true,
  alreadyProcessed: false,
  status: result.payment.status,
  paymentId: result.payment.id,
  invoiceId: result.invoice.id,
  mpesaReceiptNumber:
    callback.mpesaReceiptNumber,
  message:
    "M-Pesa subscription payment confirmed.",
});
  } catch (error) {
    console.error(
      "M-Pesa billing callback failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process M-Pesa billing callback.",
      },
      { status: 400 },
    );
  }
}