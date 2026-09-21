import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { executeInventoryImportTransaction } from "@/lib/import/services/inventoryTransactionService";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";

interface InventoryImportRequest {
  rows?: Array<{
    rowNumber: number;
    values: Record<string, unknown>;
  }>;
}

export async function POST(request: Request) {
  try {
    const businessContext =
  await getCurrentBusinessContext();

  await requireBusinessPermission(
  businessContext.user.id,
  businessContext.business.id,
  "inventory.manage",
);

    if (!businessContext?.business?.id) {
      return NextResponse.json(
        { error: "No active business found." },
        { status: 400 },
      );
    }

    if (!businessContext.user?.id) {
      return NextResponse.json(
        { error: "Authenticated user not found." },
        { status: 401 },
      );
    }

    const body =
      (await request.json()) as InventoryImportRequest;

    if (!Array.isArray(body.rows) || body.rows.length === 0) {
      return NextResponse.json(
        { error: "No inventory rows were provided." },
        { status: 400 },
      );
    }

    const result =
      await executeInventoryImportTransaction({
        businessId:
          businessContext.business.id,
        createdBy:
          businessContext.user.id,
        rows: body.rows,
      });

    return NextResponse.json(result);
  } catch (error) {
	  if (error instanceof BusinessPermissionError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode },
  );
}
    console.error(
      "Inventory import failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Inventory import failed.",
      },
      { status: 500 },
    );
  }
}