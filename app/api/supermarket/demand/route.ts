import { NextResponse } from "next/server";

import {
  getCurrentBusinessContext,
} from "@/lib/business/currentBusiness";

import {
  requireBusinessPermission,
  BusinessPermissionError,
} from "@/lib/business/businessPermissionService";

import {
  requireSupermarketBusiness,
  SupermarketAccessError,
} from "@/lib/supermarket/supermarketAccessService";

import {
  supermarketDemandService,
} from "@/lib/supermarket/supermarketDemandService";

import type { BusinessType } from "@/types";

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
      searchParams.get("warehouseId")?.trim() ||
      undefined;

    const productId =
      searchParams.get("productId")?.trim() ||
      undefined;

    const requestedLookback =
      Number(
        searchParams.get("lookbackDays"),
      );

    const lookbackDays =
      Number.isFinite(requestedLookback)
        ? requestedLookback
        : undefined;

    const intelligence =
      await supermarketDemandService
        .getDemandIntelligence(
          context.business.id,
          {
            warehouseId,
            productId,
            lookbackDays,
          },
        );

    return NextResponse.json(
      intelligence,
    );
  } catch (error) {
    if (
      error instanceof BusinessPermissionError ||
      error instanceof SupermarketAccessError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error(
      "Supermarket demand intelligence failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load demand intelligence.",
      },
      { status: 500 },
    );
  }
}
