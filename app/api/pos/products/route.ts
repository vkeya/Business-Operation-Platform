import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { posProductService } from "@/lib/pos/posProductService";

export async function GET(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    const { searchParams } = new URL(request.url);

    const warehouseId =
      searchParams.get("warehouseId")?.trim() || "";

    const query =
      searchParams.get("q")?.trim() || "";

    if (!warehouseId) {
      return NextResponse.json(
        {
          error: "Warehouse is required.",
        },
        { status: 400 },
      );
    }

    const products =
      await posProductService.search(
        context.business.id,
        warehouseId,
        query,
      );

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error(
      "POS product search failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load POS products.",
      },
      { status: 500 },
    );
  }
}