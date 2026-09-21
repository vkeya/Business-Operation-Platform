import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { posProductService } from "@/lib/pos/posProductService";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";

export async function GET(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "inventory.read",
);

    const { searchParams } = new URL(request.url);

    const warehouseId =
      searchParams.get("warehouseId")?.trim() || "";

    const barcode =
      searchParams.get("barcode")?.trim() || "";

    if (!warehouseId) {
      return NextResponse.json(
        {
          error: "Warehouse is required.",
        },
        { status: 400 },
      );
    }

    if (!barcode) {
      return NextResponse.json(
        {
          error: "Barcode is required.",
        },
        { status: 400 },
      );
    }

    const product =
      await posProductService.findByBarcode(
        context.business.id,
        warehouseId,
        barcode,
      );

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      product,
    });
  } catch (error) {

	  if (error instanceof BusinessPermissionError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode },
  );
}
    console.error(
      "POS barcode lookup failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to find product.",
      },
      { status: 500 },
    );
  }
}