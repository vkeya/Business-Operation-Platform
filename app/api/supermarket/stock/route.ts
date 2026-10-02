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
import { supermarketStockService } from "@/lib/supermarket/supermarketStockService";
import type { BusinessType } from "@/types";

function parsePositiveInteger(
  value: string | null,
  fallback: number,
) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return parsed;
}

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

    const lookbackDays =
      parsePositiveInteger(
        searchParams.get("lookbackDays"),
        30,
      );

    const result =
      await supermarketStockService.getStockIntelligence(
        context.business.id,
        {
          warehouseId,
          productId,
          lookbackDays,
        },
      );

    return NextResponse.json({
      ...result,
    });
  } catch (error) {
    if (
      error instanceof BusinessPermissionError ||
      error instanceof SupermarketAccessError
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
      "Supermarket stock intelligence failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load supermarket stock intelligence.",
      },
      {
        status: 500,
      },
    );
  }
}