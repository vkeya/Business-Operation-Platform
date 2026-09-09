import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { executePosCheckout } from "@/lib/pos/posCheckoutAdapter";
import type { PosCheckoutRequest } from "@/lib/pos/posTypes";

export async function POST(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

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