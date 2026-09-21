import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { taxConfigurationService } from "@/lib/tax/taxConfigurationService";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";

export async function GET() {
  try {
    const context = await getCurrentBusinessContext();

await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "business.read",
);

    const taxConfiguration =
      await taxConfigurationService.get(
        context.business.id,
      );

    return NextResponse.json({
      taxConfiguration,
    });
  } catch (error) {
	  if (error instanceof BusinessPermissionError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode },
  );
}
    console.error(
      "Unable to load POS tax configuration:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load tax configuration.",
      },
      { status: 500 },
    );
  }
}