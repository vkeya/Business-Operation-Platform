import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { taxConfigurationService } from "@/lib/tax/taxConfigurationService";

export async function GET() {
  try {
    const context = await getCurrentBusinessContext();

    const taxConfiguration =
      await taxConfigurationService.get(
        context.business.id,
      );

    return NextResponse.json({
      taxConfiguration,
    });
  } catch (error) {
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