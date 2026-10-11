import { NextResponse } from "next/server";

import { processDueSubscriptions } from "@/lib/subscription/subscriptionLifecycleService";
import { retryPendingMpesaBillingCallbacks } from "@/lib/subscription/providers/mpesa/mpesaBillingCallbackProcessor";

async function processDue() {
  try {
    const processed = await processDueSubscriptions();

    let callbackRetryCount = 0;
    let callbackRetryError: string | null = null;
    try {
      const callbackResults = await retryPendingMpesaBillingCallbacks(50);
      callbackRetryCount = callbackResults.length;
    } catch (error) {
      // Do not hide a successful subscription lifecycle run because callback
      // replay failed; expose the replay failure for scheduler monitoring.
      callbackRetryError = error instanceof Error
        ? error.message
        : "Unable to retry pending M-Pesa billing callbacks.";
      console.error("M-Pesa billing callback replay failed:", error);
    }

    return NextResponse.json({
      success: true,
      processedCount: processed.processed,
      expiredCount: processed.expired,
      cancelledCount: processed.cancelled,
      expiredAddOns: processed.expiredAddOns,
      callbackRetryCount,
      callbackRetryError,
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

function isAuthorized(request: Request): boolean {
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${expectedSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized.",
      },
      { status: 401 },
    );
  }

  return processDue();
}