import { NextRequest, NextResponse } from "next/server";
import { mpesaCallbackService } from "@/lib/payment/providers/mpesa/mpesaCallbackService";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      provider: string;
    }>;
  },
) {
  const { provider } = await context.params;

  if (provider.toLowerCase() !== "mpesa") {
    return NextResponse.json(
      {
        success: false,
        message: "Unsupported payment provider.",
      },
      { status: 404 },
    );
  }

  try {
    const payload = await request.json();

const stkCallback = payload?.Body?.stkCallback;

console.log("M-Pesa callback received:", {
  merchantRequestId: stkCallback?.MerchantRequestID,
  checkoutRequestId: stkCallback?.CheckoutRequestID,
  resultCode: stkCallback?.ResultCode,
  resultDesc: stkCallback?.ResultDesc,
});

const result =
  await mpesaCallbackService.process(payload);

    /*
     * Daraja expects an HTTP response after delivering
     * the callback. The actual payment state is determined
     * by our callback service.
     */
    return NextResponse.json(
      {
        ResultCode: 0,
        ResultDesc: "Accepted",
        ...result,
      },
      { status: 200 },
    );
    } catch (error) {
    console.error(
      "M-Pesa callback processing failed:",
      error,
    );

    /*
     * Keep the callback endpoint available to Daraja,
     * but indicate that our application rejected the
     * callback rather than reporting it as successfully
     * accepted.
     *
     * Internal error details are never returned to Daraja.
     */
    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc: "Callback processing failed.",
      },
      { status: 200 },
    );
  }
}