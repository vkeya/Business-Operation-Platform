import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireSupermarketBusiness } from "@/lib/supermarket/supermarketAccessService";
import { supermarketAutopilotService } from "@/lib/supermarket/supermarketAutopilotService";
import type { BusinessType } from "@/types";

export async function GET() {
  try {
    const context = await getCurrentBusinessContext();

    requireSupermarketBusiness(
      context.business.type as BusinessType,
    );

    const result =
      await supermarketAutopilotService.getAutopilotIntelligence(
        context.business.id,
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Failed to load supermarket autopilot actions:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load supermarket autopilot actions.",
      },
      {
        status: 500,
      },
    );
  }
}