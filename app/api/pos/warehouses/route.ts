import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context =
  await getCurrentBusinessContext();

await requireBusinessPermission(
  context.user.id,
  context.business.id,
  "inventory.read",
);

    const warehouses =
      await prisma.warehouse.findMany({
        where: {
  businessId: context.business.id,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
          branchId: true,
        },
        orderBy: {
          name: "asc",
        },
      });

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
      "POS warehouses lookup failed:",
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