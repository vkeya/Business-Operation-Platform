import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { requireBusinessContext } from "@/lib/business/businessContext";
import { saleReturnService } from "@/lib/sales/saleReturnService";

export async function POST(
  request: Request,
) {
  try {
    const session =
      await getServerSession(authOptions);

    const userId =
      session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "Authentication is required.",
        },
        { status: 401 },
      );
    }

    const body =
      await request.json();

    const businessId =
      typeof body.businessId === "string"
        ? body.businessId.trim()
        : "";

    const context =
      await requireBusinessContext({
        businessId,
        userId,
        branchId:
          typeof body.branchId === "string"
            ? body.branchId
            : undefined,
      });

    const result =
      await saleReturnService.create({
        businessId:
          context.businessId,

        saleId:
          body.saleId,

        warehouseId:
          body.warehouseId ?? null,

        currency:
          body.currency,

        exchangeRate:
          body.exchangeRate ?? null,

        items:
          body.items,

        reason:
          body.reason,

        notes:
          body.notes,

        createdBy:
          context.userId,
      });

    return NextResponse.json(
      result,
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Failed to create sale return:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create sale return.",
      },
      { status: 400 },
    );
  }
}