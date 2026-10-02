import { NextResponse } from "next/server";

import {
  getCurrentBusinessContext,
} from "@/lib/business/currentBusiness";

import {
  requireBusinessPermission,
  BusinessPermissionError,
} from "@/lib/business/businessPermissionService";

import {
  SupermarketAccessError,
  requireSupermarketBusiness,
} from "@/lib/supermarket/supermarketAccessService";

import {
  supermarketPricingPromotionIntelligenceService,
} from "@/lib/supermarket/supermarketPricingPromotionIntelligenceService";

export async function GET(
  request: Request,
) {
  try {
    const context =
      await getCurrentBusinessContext();

    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "inventory.read",
    );

    requireSupermarketBusiness(
      context.business.type as import("@/types").BusinessType,
    );

    const url = new URL(
      request.url,
    );

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
      await supermarketPricingPromotionIntelligenceService.getPricingPromotionIntelligence(
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
          status:
            error.statusCode,
        },
      );
    }

    console.error(
      "Supermarket pricing and promotion intelligence failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load pricing and promotion intelligence.",
      },
      {
        status: 500,
      },
    );
  }
}