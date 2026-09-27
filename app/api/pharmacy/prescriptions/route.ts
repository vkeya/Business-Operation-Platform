import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import {
  requireBusinessPermission,
  BusinessPermissionError,
} from "@/lib/business/businessPermissionService";
import {
  pharmacyPrescriptionLookupService,
} from "@/lib/pharmacy/prescription/pharmacyPrescriptionLookupService";

export async function GET(request: Request) {
  try {
    const context =
      await getCurrentBusinessContext();

    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "sales.read",
    );

    const { searchParams } =
      new URL(request.url);

    const prescriptionNumber =
      searchParams
        .get("prescriptionNumber")
        ?.trim() || undefined;

    const customerId =
      searchParams
        .get("customerId")
        ?.trim() || undefined;

    if (!prescriptionNumber && !customerId) {
      return NextResponse.json(
        {
          error:
            "Prescription number or customer is required.",
        },
        { status: 400 },
      );
    }

    const prescriptions =
      await pharmacyPrescriptionLookupService.search(
        {
          businessId:
            context.business.id,
          prescriptionNumber,
          customerId,
        },
      );

    return NextResponse.json({
      prescriptions,
    });
  } catch (error) {
    if (
      error instanceof BusinessPermissionError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error(
      "Pharmacy prescription lookup failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load prescriptions.",
      },
      { status: 500 },
    );
  }
}