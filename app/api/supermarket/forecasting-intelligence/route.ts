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

    const parsedLookback =
      lookbackParam
        ? Number(lookbackParam)
        : undefined;

    const lookbackDays =
      parsedLookback !== undefined &&
      Number.isFinite(parsedLookback)
        ? parsedLookback
        : undefined;

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
