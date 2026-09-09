import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { posReceiptService } from "@/lib/pos/posReceiptService";

interface RouteContext {
  params: Promise<{
    saleId: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const businessContext =
      await getCurrentBusinessContext();

    const { saleId } = await context.params;

    if (!saleId?.trim()) {
      return NextResponse.json(
        {
          error: "Sale is required.",
        },
        { status: 400 },
      );
    }

    const receipt =
      await posReceiptService.getReceipt(
        businessContext.business.id,
        saleId.trim(),
      );

    return NextResponse.json({
      receipt,
    });
  } catch (error) {
    console.error(
      "POS receipt retrieval failed:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to load receipt.";

    const status =
      message === "Sale not found."
        ? 404
        : message ===
            "Only completed sales can have a receipt."
          ? 409
          : 500;

    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}