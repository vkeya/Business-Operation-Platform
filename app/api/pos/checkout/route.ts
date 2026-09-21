import { NextResponse } from "next/server";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { executePosCheckout } from "@/lib/pos/posCheckoutAdapter";
import type { PosCheckoutRequest } from "@/lib/pos/posTypes";

export async function POST(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "sales.manage",
);

    const body =
      (await request.json()) as PosCheckoutRequest;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          error: "Invalid checkout request.",
        },
        { status: 400 },
      );
    }

    if (!body.warehouseId?.trim()) {
      return NextResponse.json(
        {
          error: "Warehouse is required.",
        },
        { status: 400 },
      );
    }

    if (!body.currency?.trim()) {
      return NextResponse.json(
        {
          error: "Currency is required.",
        },
        { status: 400 },
      );
    }

    if (!body.cart || !Array.isArray(body.cart.items)) {
      return NextResponse.json(
        {
          error: "Cart items are required.",
        },
        { status: 400 },
      );
    }

    if (!body.payment) {
      return NextResponse.json(
        {
          error: "Payment details are required.",
        },
        { status: 400 },
      );
    }

    const result = await executePosCheckout(
      body,
      context.business.id,
      context.user.id,
    );

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {

	  if (error instanceof BusinessPermissionError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode },
  );
}
    console.error(
      "POS checkout failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete POS checkout.",
      },
      { status: 500 },
    );
  }
}