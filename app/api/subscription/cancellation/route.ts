import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import {
  scheduleSubscriptionCancellation,
  undoSubscriptionCancellation,
} from "@/lib/subscription/subscriptionCancellationService";

export async function POST(request: Request) {
  try {
    const context = await getCurrentBusinessContext();
    const body = await request.json().catch(() => ({}));

    const action =
      typeof body?.action === "string"
        ? body.action.trim().toUpperCase()
        : "CANCEL";

    if (action !== "CANCEL" && action !== "UNDO") {
      return NextResponse.json(
        {
          error:
            'Invalid cancellation action. Use "CANCEL" or "UNDO".',
        },
        { status: 400 },
      );
    }

    const result =
      action === "CANCEL"
        ? await scheduleSubscriptionCancellation(
            context.business.id,
          )
        : await undoSubscriptionCancellation(
            context.business.id,
          );

    return NextResponse.json({
      success: true,
      subscription: result,
    });
  } catch (error) {
    console.error(
      "Subscription cancellation request failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update subscription cancellation.",
      },
      { status: 500 },
    );
  }
}