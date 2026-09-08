import { NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";

export async function GET() {
  try {
    const context = await getCurrentBusinessContext();

    if (context.user.email.toLowerCase() !== "godexistsfashion@gmail.com") {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 },
      );
    }

    const warehouses = await prisma.warehouse.findMany({
      where: {
        businessId: context.business.id,
      },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        branchId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      user: {
        email: context.user.email,
      },
      business: {
        id: context.business.id,
        name: context.business.name,
        type: context.business.type,
        baseCurrency: context.business.baseCurrency,
        status: context.business.status,
      },
      warehouses,
    });
  } catch (error) {
    console.error("[Debug Current Business]", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load current business.",
      },
      { status: 500 },
    );
  }
}