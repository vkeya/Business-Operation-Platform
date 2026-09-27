import { NextRequest, NextResponse } from "next/server";
import { getCurrentBusiness } from "@/lib/business/currentBusiness";
import { getAuthenticatedUserId } from "@/lib/auth/auth";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: NextRequest) {
  try {
    const business = await getCurrentBusiness();
    const userId = await getAuthenticatedUserId();

    await requireBusinessPermission(
      userId,
      business.id,
      "inventory.read",
    );

    const productId = request.nextUrl.searchParams.get("productId")?.trim();
    const warehouseId = request.nextUrl.searchParams.get("warehouseId")?.trim();

    if (!productId || !warehouseId) {
      return NextResponse.json(
        { error: "Product and warehouse are required." },
        { status: 400 },
      );
    }

    const batches = await prisma.pharmacyBatch.findMany({
      where: {
        warehouseId,
        pharmacyProduct: {
          productId,
          product: {
            businessId: business.id,
          },
        },
        isRecalled: false,
        expiryDate: {
          gt: new Date(),
        },
        quantityRemaining: {
          gt: 0,
        },
      },
      orderBy: [
        { expiryDate: "asc" },
        { createdAt: "asc" },
      ],
      take: 3,
      select: {
        batchNumber: true,
        expiryDate: true,
        quantityRemaining: true,
      },
    });

    return NextResponse.json({
      batches: batches.map((batch) => ({
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate.toISOString(),
        quantityRemaining: batch.quantityRemaining.toNumber(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load pharmacy batch information.",
      },
      { status: 500 },
    );
  }
}
