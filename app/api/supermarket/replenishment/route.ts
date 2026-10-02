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
  supermarketReplenishmentService,
} from "@/lib/supermarket/supermarketReplenishmentService";

import type { BusinessType } from "@/types";

export async function GET(request: Request) {
  try {
    const context =
      await getCurrentBusinessContext();

    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "inventory.read",
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

    const includeHealthy =
      searchParams.get("includeHealthy") ===
      "true";

    const intelligence =
      await supermarketReplenishmentService
        .getReplenishmentIntelligence(
          context.business.id,
          {
            warehouseId,
            productId,
            lookbackDays,
            includeHealthy,
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
      "Supermarket replenishment intelligence failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load replenishment intelligence.",
      },
      { status: 500 },
    );
  }
}
