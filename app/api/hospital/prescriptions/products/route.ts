import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import {
  HospitalAccessError,
  requireHospitalBusiness,
} from "@/lib/hospital/hospitalAccessService";
import { HospitalPrescriptionError } from "@/lib/hospital/hospitalPrescriptionService";
import { prisma } from "@/lib/database/prisma";
import type { BusinessType } from "@/types";

export async function GET(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.prescriptions.manage",
    );

    requireHospitalBusiness(context.business.type as BusinessType);

    const query = new URL(request.url).searchParams
      .get("q")
      ?.trim();

    const products = await prisma.product.findMany({
      where: {
        businessId: context.business.id,
        status: "ACTIVE",
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { sku: { contains: query, mode: "insensitive" } },
                { barcode: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
        pharmacyProduct: {
          is: {
            status: "ACTIVE",
            prescriptionType: "PRESCRIPTION",
          },
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        unit: true,
        pharmacyProduct: {
          select: {
            strength: true,
            dosageForm: true,
            routeOfAdministration: true,
            activeIngredient: true,
          },
        },
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    return NextResponse.json({ products });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Authentication is required."
    ) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    if (
      error instanceof BusinessPermissionError ||
      error instanceof SubscriptionEntitlementError ||
      error instanceof HospitalAccessError ||
      error instanceof HospitalPrescriptionError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Hospital prescription product lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to load eligible prescription medicines." },
      { status: 500 },
    );
  }
}
