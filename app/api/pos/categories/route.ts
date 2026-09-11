import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { productCategoryService } from "@/lib/inventory/productCategoryService";

export async function GET() {
  try {
    const context =
      await getCurrentBusinessContext();

    const categories =
      await productCategoryService.listCategories(
        context.business.id,
      );

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error(
      "POS category loading failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load POS categories.",
      },
      { status: 500 },
    );
  }
}