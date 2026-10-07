import "server-only";

import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";
import {
  getPaystackSecretKey,
} from "@/lib/subscription/providers/paystack/paystackConfiguration";
import {
  failBillingPayment,
  succeedBillingPayment,
} from "@/lib/subscription/billingPaymentService";

interface PaystackWebhookData {
  reference?: string;
  status?: string;
  amount?: number;
  currency?: string;
  metadata?: {
    businessId?: string;
    invoiceId?: string;
    paymentId?: string;
  };
  gateway_response?: string;
}

interface PaystackWebhookPayload {
  event?: string;
  data?: PaystackWebhookData;
}

function isValidPaystackSignature(
  rawBody: string,
  signature: string,
): boolean {
  const expectedSignature =
    crypto
      .createHmac(
        "sha512",
        getPaystackSecretKey(),
      )
      .update(rawBody)
      .digest("hex");

  const expected =
    Buffer.from(expectedSignature, "utf8");

  const received =
    Buffer.from(signature, "utf8");

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expected,
    received,
  );
}

export async function POST(
  request: Request,
) {
  try {
    const rawBody =
      await request.text();

    const signature =
      request.headers.get(
        "x-paystack-signature",
      );

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing Paystack webhook signature.",
        },
        { status: 401 },
      );
    }

    if (
      !isValidPaystackSignature(
        rawBody,
        signature,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Paystack webhook signature.",
        },
        { status: 401 },
      );
    }

    const payload =
      JSON.parse(
        rawBody,
      ) as PaystackWebhookPayload;

    if (
      payload.event !==
      "charge.success"
    ) {
      return NextResponse.json({
        success: true,
        ignored: true,
        event: payload.event ?? null,
      });
    }

    const data = payload.data;

    if (
      !data ||
      !data.reference
    ) {
      throw new Error(
        "Paystack webhook is missing the transaction reference.",
      );
    }

    const payment =
      await prisma.billingPayment.findFirst({
        where: {
          provider: "PAYSTACK",
          providerReference:
            data.reference,
        },
        select: {
          id: true,
          businessId: true,
          amount: true,
          currency: true,
          status: true,
          invoiceId: true,
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
     * Paystack may retry webhook delivery.
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

    if (
      data.status &&
      data.status.toLowerCase() !==
        "success"
    ) {
      const failedPayment =
        await failBillingPayment(
          payment.businessId,
          payment.id,
          data.gateway_response ||
            "Paystack subscription payment failed.",
        );

      return NextResponse.json({
        success: true,
        alreadyProcessed: false,
        status: failedPayment.status,
        paymentId: payment.id,
      });
    }

    const expectedAmount =
      Math.round(
        payment.amount.toNumber() * 100,
      );

    if (
      data.amount === undefined ||
      !Number.isSafeInteger(
        data.amount,
      ) ||
      data.amount !== expectedAmount
    ) {
      throw new Error(
        "Paystack webhook amount does not match the billing payment.",
      );
    }

    const expectedCurrency =
      payment.currency
        .trim()
        .toUpperCase();

    const callbackCurrency =
      data.currency
        ?.trim()
        .toUpperCase();

    if (
      !callbackCurrency ||
      callbackCurrency !==
        expectedCurrency
    ) {
      throw new Error(
        "Paystack webhook currency does not match the billing payment.",
      );
    }

    /*
     * The provider reference was stored when
     * the Paystack charge/transaction was initiated.
     * The webhook reference must match it.
     */
    if (
      data.reference !==
      data.reference.trim()
    ) {
      throw new Error(
        "Invalid Paystack transaction reference.",
      );
    }

    /*
     * If Paystack returned our paymentId metadata,
     * make sure it points to this billing payment.
     */
    if (
      data.metadata?.paymentId &&
      data.metadata.paymentId !==
        payment.id
    ) {
      throw new Error(
        "Paystack webhook payment metadata does not match the billing payment.",
      );
    }

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
      paystackReference:
        data.reference,
      message:
        "Paystack subscription payment confirmed.",
    });
  } catch (error) {
    console.error(
      "Paystack billing webhook failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process Paystack billing webhook.",
      },
      { status: 400 },
    );
  }
}