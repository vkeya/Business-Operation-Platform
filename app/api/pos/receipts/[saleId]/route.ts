import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { posReceiptService } from "@/lib/pos/posReceiptService";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";

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

	  await requireBusinessPermission(
  businessContext.user.id,
  businessContext.business.id,
  "sales.read",
);

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

	  if (error instanceof BusinessPermissionError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode },
  );
}
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