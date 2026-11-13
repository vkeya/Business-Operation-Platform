import { NextResponse } from "next/server";

import {
  SubscriptionEntitlementError,
  requireEntitlement,
} from "@/lib/subscription/subscriptionEntitlementService";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import {
  BusinessPermissionError,
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";

import {
  SupermarketAccessError,
  requireSupermarketBusiness,
} from "@/lib/supermarket/supermarketAccessService";

import {
  supermarketForecastingIntelligenceService,
} from "@/lib/supermarket/supermarketForecastingIntelligenceService";

export async function GET(request: Request) {
  try {
    const context =
      await getCurrentBusinessContext();

    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "sales.read",
    );

    requireSupermarketBusiness(
      context.business.type as import("@/types").BusinessType,
    );

    await requireEntitlement(
      context.business.id,
      "SUPERMARKET_FORECASTING",
    );

    const url = new URL(request.url);

    const warehouseId =
      url.searchParams.get(
        "warehouseId",
      ) || undefined;

    const productId =
      url.searchParams.get(
        "productId",
      ) || undefined;

    const lookbackParam =
      url.searchParams.get(
        "lookbackDays",
      );

    let lookbackDays: number | undefined;

    if (lookbackParam !== null) {
      const parsedLookback =
        Number(lookbackParam);

      if (
        !/^\d+$/.test(lookbackParam) ||
        !Number.isInteger(parsedLookback) ||
        parsedLookback < 1 ||
        parsedLookback > 365
      ) {
        return NextResponse.json(
          {
            error:
              "lookbackDays must be a whole number between 1 and 365.",
          },
          {
            status: 400,
          },
        );
      }

      lookbackDays = parsedLookback;
    }

    const intelligence =
      await supermarketForecastingIntelligenceService.getForecastingIntelligence(
        context.business.id,
        {
          warehouseId,
          productId,
          lookbackDays,
        },
      );

    return NextResponse.json({
      intelligence,
    });
  } catch (error) {
    if (
      error instanceof
        BusinessPermissionError ||
      error instanceof
        SupermarketAccessError ||
      error instanceof
        SubscriptionEntitlementError
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.statusCode,
        },
      );
    }

    console.error(
      "Supermarket forecasting intelligence failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load supermarket forecasting intelligence.",
      },
      {
        status: 500,
      },
    );
  }
}
