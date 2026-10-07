import { NextResponse } from "next/server";

import { processDueSubscriptions } from "@/lib/subscription/subscriptionLifecycleService";

export async function POST(request: Request) {
  const expectedSecret =
    process.env.SUBSCRIPTION_SCHEDULER_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Subscription scheduler is not configured.",
      },
      { status: 503 },
    );
  }

  const providedSecret =
    request.headers.get("x-subscription-scheduler-secret");

  if (
    !providedSecret ||
    providedSecret !== expectedSecret
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized.",
      },
      { status: 401 },
    );
  }

  try {
    const processed =
      await processDueSubscriptions();

    return NextResponse.json({
      success: true,
      processedCount: processed.length,
    });
  } catch (error) {
    console.error(
      "Subscription due-processing failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process due subscriptions.",
      },
      { status: 500 },
    );
  }
}