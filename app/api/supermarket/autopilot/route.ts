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
  supermarketAutopilotService,
} from "@/lib/supermarket/supermarketAutopilotService";

export async function GET(
  request: Request,
) {
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

    const minBasketsParam =
      url.searchParams.get(
        "minBaskets",
      );

    const maxActionsParam =
      url.searchParams.get(
        "maxActions",
      );

    const parsedLookback =
      lookbackParam
        ? Number(lookbackParam)
        : undefined;

    const parsedMinBaskets =
      minBasketsParam
        ? Number(minBasketsParam)
        : undefined;

    const parsedMaxActions =
      maxActionsParam
        ? Number(maxActionsParam)
        : undefined;

    const intelligence =
      await supermarketAutopilotService.getAutopilotIntelligence(
        context.business.id,
        {
          warehouseId,
          productId,

          lookbackDays:
            parsedLookback !==
              undefined &&
            Number.isFinite(
              parsedLookback,
            )
              ? parsedLookback
              : undefined,

          minBaskets:
            parsedMinBaskets !==
              undefined &&
            Number.isFinite(
              parsedMinBaskets,
            )
              ? parsedMinBaskets
              : undefined,

          maxActions:
            parsedMaxActions !==
              undefined &&
            Number.isFinite(
              parsedMaxActions,
            )
              ? parsedMaxActions
              : undefined,
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
          error:
            error.message,
        },
        {
          status:
            error.statusCode,
        },
      );
    }

    console.error(
      "Supermarket autopilot intelligence failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load supermarket autopilot intelligence.",
      },
      {
        status: 500,
      },
    );
  }
}
