import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import {
  BusinessPermissionError,
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import {
  SupermarketAccessError,
  requireSupermarketBusiness,
} from "@/lib/supermarket/supermarketAccessService";
import { supermarketBasketIntelligenceService } from "@/lib/supermarket/supermarketBasketIntelligenceService";
import type { BusinessType } from "@/types";

const DEFAULT_LOOKBACK_DAYS = 30;
const DEFAULT_MIN_BASKETS = 3;

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
      context.business.type as BusinessType,
    );

    const { searchParams } =
      new URL(request.url);

    const warehouseId =
      searchParams
        .get("warehouseId")
        ?.trim() || undefined;

    const productId =
      searchParams
        .get("productId")
        ?.trim() || undefined;

    const requestedLookback =
      Number(
        searchParams.get(
          "lookbackDays",
        ) ??
          DEFAULT_LOOKBACK_DAYS,
      );

    const requestedMinBaskets =
      Number(
        searchParams.get(
          "minBaskets",
        ) ??
          DEFAULT_MIN_BASKETS,
      );

    const lookbackDays =
      Number.isFinite(
        requestedLookback,
      )
        ? requestedLookback
        : DEFAULT_LOOKBACK_DAYS;

    const minBaskets =
      Number.isFinite(
        requestedMinBaskets,
      )
        ? requestedMinBaskets
        : DEFAULT_MIN_BASKETS;

    const intelligence =
      await supermarketBasketIntelligenceService.getBasketIntelligence(
        context.business.id,
        {
          warehouseId,
          productId,
          lookbackDays,
          minBaskets,
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
        SupermarketAccessError
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
      "Supermarket basket intelligence failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load basket intelligence.",
      },
      {
        status: 500,
      },
    );
  }
}