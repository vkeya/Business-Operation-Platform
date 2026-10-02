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
} from "@/lib/supermarket/supermarketAccessService";
import {
  listSupermarketProducts,
  updateSupermarketProduct,
} from "@/lib/supermarket/supermarketProductService";

export async function GET() {
  try {
    const context =
      await getCurrentBusinessContext();

    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "inventory.read",
    );

    const products =
      await listSupermarketProducts();

    return NextResponse.json({
      products,
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
      "Supermarket product lookup failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load supermarket products.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
) {
  try {
    const context =
      await getCurrentBusinessContext();

    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "settings.manage",
    );

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      typeof body.productId !== "string" ||
      !body.productId.trim()
    ) {
      return NextResponse.json(
        {
          error: "Product ID is required.",
        },
        { status: 400 },
      );
    }

    const profile =
      await updateSupermarketProduct({
        productId: body.productId.trim(),

        ...(typeof body.sellingMode === "string"
          ? {
              sellingMode:
                body.sellingMode,
            }
          : {}),

        ...(typeof body.weighted === "boolean"
          ? {
              weighted: body.weighted,
            }
          : {}),

        ...(typeof body.shelfLocation === "string"
          ? {
              shelfLocation:
                body.shelfLocation.trim(),
            }
          : {}),

        ...(typeof body.aisle === "string"
          ? {
              aisle: body.aisle.trim(),
            }
          : {}),

        ...(typeof body.section === "string"
          ? {
              section: body.section.trim(),
            }
          : {}),

        ...(typeof body.reorderEnabled === "boolean"
          ? {
              reorderEnabled:
                body.reorderEnabled,
            }
          : {}),

        ...(typeof body.reorderPoint === "number"
          ? {
              reorderPoint:
                body.reorderPoint,
            }
          : {}),

        ...(typeof body.reorderQuantity === "number"
          ? {
              reorderQuantity:
                body.reorderQuantity,
            }
          : {}),

        ...(typeof body.promotionEligible === "boolean"
          ? {
              promotionEligible:
                body.promotionEligible,
            }
          : {}),
      });

    return NextResponse.json({
      product: profile,
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
      "Supermarket product update failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update supermarket product.",
      },
      { status: 500 },
    );
  }
}
