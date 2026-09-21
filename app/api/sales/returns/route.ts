import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import { authOptions } from "@/lib/auth/auth";
import { requireBusinessContext } from "@/lib/business/businessContext";
import { saleReturnService } from "@/lib/sales/saleReturnService";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";

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

const context =
  await requireBusinessContext({
    businessId:
      typeof body.businessId === "string"
        ? body.businessId.trim()
        : "",
    userId,
    branchId:
      typeof body.branchId === "string"
        ? body.branchId
        : undefined,
  });

  await requireBusinessPermission(
  context.userId,
  context.businessId,
  "sales.manage",
);

    const result =
      await saleReturnService.create({

		  operationId:
  typeof body.operationId === "string"
    ? body.operationId.trim()
    : "",
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

	  if (error instanceof BusinessPermissionError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode },
  );
}
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