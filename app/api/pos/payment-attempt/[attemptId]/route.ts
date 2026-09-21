import { NextRequest, NextResponse } from "next/server";
import { mpesaPaymentService } from "@/lib/payment/providers/mpesa/mpesaPaymentService";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { paymentAttemptService } from "@/lib/payment/paymentAttemptService";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{
      attemptId: string;
    }>;
  },
) {
  try {
    const { attemptId } = await context.params;

    if (!attemptId) {
      return NextResponse.json(
        {
          error: "Payment attempt ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const businessContext =
      await getCurrentBusinessContext();

	  await requireBusinessPermission(
  businessContext.user.id,
  businessContext.business.id,
  "payments.read",
);

    const attempt =
      await paymentAttemptService.findById(
        businessContext.business.id,
        attemptId,
      );

    if (!attempt) {
      return NextResponse.json(
        {
          error: "Payment attempt not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        status: attempt.status,
        provider: attempt.provider,
        method: attempt.method,
        amount: Number(attempt.amount),
        currency: attempt.currency,
        providerReference:
          attempt.providerReference,
        terminalReference:
          attempt.terminalReference,
        saleId: attempt.saleId,
      },
    });
  } catch (error) {

	  if (error instanceof BusinessPermissionError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode },
  );
}
    console.error(
      "Failed to retrieve payment attempt:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve payment attempt.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  _request: NextRequest,
  context: {
    params: Promise<{
      attemptId: string;
    }>;
  },
) {
  try {
    const { attemptId } =
      await context.params;

    if (!attemptId) {
      return NextResponse.json(
        {
          error:
            "Payment attempt ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const businessContext =
      await getCurrentBusinessContext();

	  await requireBusinessPermission(
  businessContext.user.id,
  businessContext.business.id,
  "payments.read",
);

    const result =
      await mpesaPaymentService.queryPaymentAttempt(
        {
          businessId:
            businessContext.business.id,

          paymentAttemptId:
            attemptId,
        },
      );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {

	  if (error instanceof BusinessPermissionError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode },
  );
}
    console.error(
      "Failed to query M-Pesa payment:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to query M-Pesa payment.",
      },
      {
        status: 500,
      },
    );
  }
}
