
import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import {
  BusinessPermissionError,
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import { prisma } from "@/lib/database/prisma";
import { decryptSecret } from "@/lib/security/encryption";
import { getSmatpicMpesaCredentials } from "@/lib/subscription/providers/mpesa/smatpicMpesaConfiguration";
import { queryMpesaStkPush } from "@/lib/payment/providers/mpesa/mpesaStkQuery";

export async function POST(request: Request) {
  let stage = "authentication";

  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "payments.read",
    );

    stage = "request_validation";

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 },
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      !("paymentId" in body) ||
      typeof body.paymentId !== "string" ||
      !body.paymentId.trim()
    ) {
      return NextResponse.json(
        { error: "A subscription payment ID is required." },
        { status: 400 },
      );
    }

    stage = "payment_lookup";

    const payment = await prisma.billingPayment.findFirst({
      where: {
        id: body.paymentId.trim(),
        businessId: context.business.id,
        provider: "MPESA",
      },
      select: {
        id: true,
        status: true,
        currency: true,
        providerReference: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "M-Pesa subscription payment not found." },
        { status: 404 },
      );
    }

    if (!payment.providerReference) {
      return NextResponse.json(
        { error: "The payment has no Daraja checkout reference to query." },
        { status: 409 },
      );
    }

    if (payment.currency.trim().toUpperCase() !== "KES") {
      return NextResponse.json(
        { error: "M-Pesa subscription billing supports KES only." },
        { status: 409 },
      );
    }

    stage = "credential_loading";

    const credentials = getSmatpicMpesaCredentials();

    stage = "consumer_secret_decryption";

    const consumerSecret = decryptSecret(
      credentials.encryptedConsumerSecret,
    );

    stage = "passkey_decryption";

    const passkey = decryptSecret(credentials.encryptedPasskey);

    stage = "daraja_query";

    const result = await queryMpesaStkPush({
      credentials,
      consumerSecret,
      passkey,
      checkoutRequestId: payment.providerReference,
    });

    return NextResponse.json({
      success: true,
      diagnosticOnly: true,
      payment: {
        id: payment.id,
        status: payment.status,
        providerReference: payment.providerReference,
      },
      daraja: {
        responseCode: result.ResponseCode ?? null,
        responseDescription: result.ResponseDescription ?? null,
        checkoutRequestId: result.CheckoutRequestID ?? null,
        resultCode: result.ResultCode ?? null,
        resultDescription: result.ResultDesc ?? null,
        errorCode: result.errorCode ?? null,
        errorMessage: result.errorMessage ?? null,
        queryStatus: result.queryStatus ?? null,
      },
    });
  } catch (error) {
    if (error instanceof BusinessPermissionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("M-Pesa subscription diagnostic failed:", {
      stage,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage:
        error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Unable to query the M-Pesa subscription payment." },
      { status: 500 },
    );
  }
}
