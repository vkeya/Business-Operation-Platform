import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { business } =
      await getCurrentBusinessContext();

    const warehouses =
      await prisma.warehouse.findMany({
        where: {
          businessId: business.id,
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