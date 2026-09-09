import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { posCustomerService } from "@/lib/pos/posCustomerService";

export async function GET(request: Request) {
  try {
    const context =
      await getCurrentBusinessContext();

    const { searchParams } =
      new URL(request.url);

    const query =
      searchParams.get("q")?.trim() || "";

    const customers =
      await posCustomerService.search(
        context.business.id,
        query,
      );

    return NextResponse.json({
      customers,
    });
  } catch (error) {
    console.error(
      "POS customer search failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load customers.",
      },
      { status: 500 },
    );
  }
}