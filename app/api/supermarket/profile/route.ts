import { NextResponse } from "next/server";

import {
  getCurrentBusinessContext,
} from "@/lib/business/currentBusiness";
import {
  requireBusinessPermission,
  BusinessPermissionError,
} from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import {
  SupermarketAccessError,
  requireSupermarketBusiness,
} from "@/lib/supermarket/supermarketAccessService";
import {
  getSupermarketProfile,
  updateSupermarketProfile,
} from "@/lib/supermarket/supermarketProfileService";

export async function GET() {
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

    const profile =
      await getSupermarketProfile();

    return NextResponse.json({
      profile,
    });
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
      "Supermarket profile lookup failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load supermarket profile.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const context =
      await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
  context.user.id,
  context.business.id,
  "settings.manage",
);

    requireSupermarketBusiness(
      context.business.type as import("@/types").BusinessType,
    );

    const body = await request.json();

    const profile =
      await updateSupermarketProfile({
        ...(typeof body.storeType === "string" &&
        body.storeType.trim()
          ? {
              storeType:
                body.storeType.trim(),
            }
          : {}),

        ...(typeof body.weightedProductsEnabled ===
        "boolean"
          ? {
              weightedProductsEnabled:
                body.weightedProductsEnabled,
            }
          : {}),

        ...(typeof body.batchTrackingEnabled ===
        "boolean"
          ? {
              batchTrackingEnabled:
                body.batchTrackingEnabled,
            }
          : {}),

        ...(typeof body.expiryTrackingEnabled ===
        "boolean"
          ? {
              expiryTrackingEnabled:
                body.expiryTrackingEnabled,
            }
          : {}),

        ...(typeof body.loyaltyEnabled ===
        "boolean"
          ? {
              loyaltyEnabled:
                body.loyaltyEnabled,
            }
          : {}),

        ...(typeof body.promotionsEnabled ===
        "boolean"
          ? {
              promotionsEnabled:
                body.promotionsEnabled,
            }
          : {}),

        ...(typeof body.autoReplenishmentEnabled ===
        "boolean"
          ? {
              autoReplenishmentEnabled:
                body.autoReplenishmentEnabled,
            }
          : {}),

        ...(typeof body.isActive === "boolean"
          ? {
              isActive: body.isActive,
            }
          : {}),
      });

    return NextResponse.json({
      profile,
    });
  } catch (error) {
    if (
  error instanceof BusinessPermissionError ||
  error instanceof SubscriptionEntitlementError ||
  error instanceof SupermarketAccessError
) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error(
      "Supermarket profile update failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update supermarket profile.",
      },
      { status: 500 },
    );
  }
}