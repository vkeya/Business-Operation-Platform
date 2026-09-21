import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { productCategoryService } from "@/lib/inventory/productCategoryService";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";

export async function GET() {
  try {
    const context =
      await getCurrentBusinessContext();

	  await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "inventory.read",
);

    const categories =
      await productCategoryService.listCategories(
        context.business.id,
      );

    return NextResponse.json({
      categories,
    });
  } catch (error) {

	  if (error instanceof BusinessPermissionError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode },
  );
}
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