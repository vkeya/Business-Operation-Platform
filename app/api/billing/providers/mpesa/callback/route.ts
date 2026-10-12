import { NextResponse } from "next/server";

import { receiveMpesaBillingCallback } from
  "@/lib/subscription/providers/mpesa/mpesaBillingCallbackProcessor";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const result = await receiveMpesaBillingCallback(payload);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("M-Pesa billing callback failed:", error);

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
