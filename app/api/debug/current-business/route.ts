import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { business } = await getCurrentBusinessContext();

    return NextResponse.json({
      businessId: business.id,
      businessName: business.name,
      businessType: business.type,
      baseCurrency: business.baseCurrency,
      status: business.status,
    });
  } catch (error) {
    console.error("Current business debug failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to determine current business.",
      },
      { status: 500 },
    );
  }
}