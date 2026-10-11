import "server-only";

import {
  parseMpesaCallback,
} from "@/lib/payment/providers/mpesa/mpesaCallback";
import { prisma } from "@/lib/database/prisma";
import type { Prisma } from "@/generated/prisma/client";
import {
  failBillingPayment,
  succeedBillingPayment,
} from "@/lib/subscription/billingPaymentService";

const STALE_PROCESSING_MS = 10 * 60 * 1000;

class PermanentMpesaCallbackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentMpesaCallbackError";
  }
}


type CallbackProcessingResult = {
  callbackId: string;
  status: "RECEIVED" | "PROCESSING" | "PROCESSED" | "RETRY" | "REJECTED";
  matchedPayment: boolean;
  paymentId?: string;
  message?: string;
};

/**
 * Durably records a valid M-Pesa callback before trying to match it to a
 * BillingPayment. checkoutRequestId is used as the provider event key because
 * the callback payload does not expose a separate stable event ID.
 */
export async function receiveMpesaBillingCallback(payload: unknown) {
  const callback = parseMpesaCallback(payload);

  const stored = await prisma.billingProviderCallback.upsert({
    where: {
      provider_eventKey: {
        provider: "MPESA",
        eventKey: callback.checkoutRequestId,
      },
    },
    create: {
      provider: "MPESA",
      eventKey: callback.checkoutRequestId,
      reference: callback.checkoutRequestId,
      payload: payload as Prisma.InputJsonValue,
    },
    // Do not overwrite the first stored payload on duplicate delivery.
    update: {},
    select: { id: true },
  });

  const processing = await processMpesaBillingCallbackRecord(stored.id);

  return {
    received: true as const,
    ...processing,
  };
}

/**
 * Replays callbacks after initiation has persisted the provider reference and
 * provider response. This is called centrally from billingPaymentService.
 */
export async function processPendingMpesaBillingCallbacks(reference: string) {
  if (!reference.trim()) return [];

  const staleBefore = new Date(Date.now() - STALE_PROCESSING_MS);
  const pending = await prisma.billingProviderCallback.findMany({
    where: {
      provider: "MPESA",
      reference,
      OR: [
        { status: "RECEIVED" },
        { status: "RETRY" },
        { status: "PROCESSING", updatedAt: { lt: staleBefore } },
      ],
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const results: CallbackProcessingResult[] = [];
  for (const item of pending) {
    results.push(await processMpesaBillingCallbackRecord(item.id));
  }
  return results;
}

/**
 * Batch entry point for an existing authenticated scheduler/cron route.
 * This function deliberately does not create an HTTP endpoint or assume a
 * cron authentication convention that may differ in this project.
 */
export async function retryPendingMpesaBillingCallbacks(limit = 50) {
  const boundedLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 200)
    : 50;
  const staleBefore = new Date(Date.now() - STALE_PROCESSING_MS);
  const pending = await prisma.billingProviderCallback.findMany({
    where: {
      provider: "MPESA",
      OR: [
        { status: "RECEIVED" },
        { status: "RETRY" },
        { status: "PROCESSING", updatedAt: { lt: staleBefore } },
      ],
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: boundedLimit,
  });

  const results: CallbackProcessingResult[] = [];
  for (const item of pending) {
    results.push(await processMpesaBillingCallbackRecord(item.id));
  }
  return results;
}

export async function processMpesaBillingCallbackRecord(
  callbackRecordId: string,
): Promise<CallbackProcessingResult> {
  const staleBefore = new Date(Date.now() - STALE_PROCESSING_MS);
  const claim = await prisma.billingProviderCallback.updateMany({
    where: {
      id: callbackRecordId,
      OR: [
        { status: "RECEIVED" },
        { status: "RETRY" },
        { status: "PROCESSING", updatedAt: { lt: staleBefore } },
      ],
    },
    data: {
      status: "PROCESSING",
      attempts: { increment: 1 },
      lastError: null,
    },
  });

  if (claim.count === 0) {
    const current = await prisma.billingProviderCallback.findUnique({
      where: { id: callbackRecordId },
      select: { id: true, status: true },
    });
    if (!current) throw new Error("Stored M-Pesa callback was not found.");
    return {
      callbackId: current.id,
      status: current.status,
      matchedPayment: false,
      message: "Callback is already being processed or has been processed.",
    };
  }

  try {
    const record = await prisma.billingProviderCallback.findUnique({
      where: { id: callbackRecordId },
      select: { id: true, payload: true },
    });
    if (!record) throw new Error("Stored M-Pesa callback was not found.");

    const callback = parseMpesaCallback(record.payload);
    const payment = await prisma.billingPayment.findFirst({
      where: {
        provider: "MPESA",
        providerReference: callback.checkoutRequestId,
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
      throw new Error(
        "Billing payment reference is not persisted yet; callback is retained for retry.",
      );
    }

    const providerResponse = payment.providerResponse;
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
      throw new PermanentMpesaCallbackError(
        "Billing payment is missing the original MerchantRequestID.",
      );
    }
    if (originalMerchantRequestId !== callback.merchantRequestId) {
      throw new PermanentMpesaCallbackError(
        "M-Pesa billing callback MerchantRequestID does not match the original payment request.",
      );
    }

    // A duplicate successful callback is safe to acknowledge after validation.
    if (payment.status === "SUCCEEDED") {
      await markCallbackProcessed(record.id);
      return {
        callbackId: record.id,
        status: "PROCESSED",
        matchedPayment: true,
        paymentId: payment.id,
        message: "Payment was already reconciled.",
      };
    }

    if (
      payment.status === "FAILED" ||
      payment.status === "CANCELLED" ||
      payment.status === "REFUNDED"
    ) {
      if (callback.resultCode === 0) {
        throw new PermanentMpesaCallbackError(
          `Successful M-Pesa callback conflicts with terminal payment status ${payment.status}; manual reconciliation is required.`,
        );
      }
      await markCallbackProcessed(record.id);
      return {
        callbackId: record.id,
        status: "PROCESSED",
        matchedPayment: true,
        paymentId: payment.id,
        message: "Terminal payment state already recorded.",
      };
    }

    if (callback.resultCode !== 0) {
      await failBillingPayment(
        payment.businessId,
        payment.id,
        callback.resultDescription || "M-Pesa subscription payment failed.",
      );
      await markCallbackProcessed(record.id);
      return {
        callbackId: record.id,
        status: "PROCESSED",
        matchedPayment: true,
        paymentId: payment.id,
        message: callback.resultDescription || "M-Pesa payment failed.",
      };
    }

    if (
      callback.amount === undefined ||
      !Number.isFinite(callback.amount) ||
      callback.amount <= 0
    ) {
      throw new PermanentMpesaCallbackError(
        "Successful M-Pesa billing callback did not contain a valid payment amount.",
      );
    }
    if (!callback.mpesaReceiptNumber) {
      throw new PermanentMpesaCallbackError(
        "Successful M-Pesa billing callback did not contain an M-Pesa receipt number.",
      );
    }
    if (callback.amount !== payment.amount.toNumber()) {
      throw new PermanentMpesaCallbackError(
        "M-Pesa billing callback amount does not match the billing payment.",
      );
    }

    const result = await succeedBillingPayment(payment.businessId, payment.id);
    if (!result) {
      throw new Error("Billing payment could not be reconciled.");
    }

    await markCallbackProcessed(record.id);
    return {
      callbackId: record.id,
      status: "PROCESSED",
      matchedPayment: true,
      paymentId: payment.id,
      message: "M-Pesa subscription payment confirmed.",
    };
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Unable to process stored M-Pesa billing callback.";

    const rejected = error instanceof PermanentMpesaCallbackError;
    await prisma.billingProviderCallback.updateMany({
      where: { id: callbackRecordId, status: "PROCESSING" },
      data: { status: rejected ? "REJECTED" : "RETRY", lastError: message },
    });

    const current = await prisma.billingProviderCallback.findUnique({
      where: { id: callbackRecordId },
      select: { id: true, status: true },
    });
    return {
      callbackId: callbackRecordId,
      status: current?.status ?? (rejected ? "REJECTED" : "RETRY"),
      matchedPayment: false,
      message,
    };
  }
}

async function markCallbackProcessed(callbackRecordId: string) {
  await prisma.billingProviderCallback.updateMany({
    where: { id: callbackRecordId, status: "PROCESSING" },
    data: {
      status: "PROCESSED",
      processedAt: new Date(),
      lastError: null,
    },
  });
}
