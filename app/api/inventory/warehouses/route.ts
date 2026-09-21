import { NextResponse } from "next/server";

import {
  getCurrentBusinessContext,
  getCurrentBusinessWarehouses,
} from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";

export async function GET() {
  try {
    const context = await getCurrentBusinessContext();

    const warehouses =
      await getCurrentBusinessWarehouses(
        context.business.id,
      );

    return NextResponse.json({
      warehouses,
    });
  } catch (error) {
	  if (error instanceof BusinessPermissionError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode },
  );
}
    console.error(
      "Inventory warehouse lookup failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load warehouses.",
      },
      { status: 500 },
    );
  }
}