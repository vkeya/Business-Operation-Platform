
import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import {
  BusinessPermissionError,
  requireBusinessPermission,
} from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import {
  HospitalAccessError,
  requireHospitalBusiness,
} from "@/lib/hospital/hospitalAccessService";
import {
  getHospitalProfile,
  updateHospitalProfile,
} from "@/lib/hospital/hospitalProfileService";
import type { BusinessType } from "@/types";

export async function GET() {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "settings.read",
    );

    requireHospitalBusiness(
      context.business.type as BusinessType,
    );

    const profile = await getHospitalProfile();

    return NextResponse.json({ profile });
  } catch (error) {
    if (
      error instanceof BusinessPermissionError ||
      error instanceof HospitalAccessError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Hospital profile lookup failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load hospital profile.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "settings.manage",
    );

    requireHospitalBusiness(
      context.business.type as BusinessType,
    );

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid profile object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    const profile = await updateHospitalProfile({
      ...(typeof input.facilityName === "string" ||
      input.facilityName === null
        ? { facilityName: input.facilityName as string | null }
        : {}),

      ...(typeof input.facilityType === "string" ||
      input.facilityType === null
        ? { facilityType: input.facilityType as string | null }
        : {}),

      ...(typeof input.registrationNumber === "string" ||
      input.registrationNumber === null
        ? { registrationNumber: input.registrationNumber as string | null }
        : {}),

      ...(typeof input.licenseNumber === "string" ||
      input.licenseNumber === null
        ? { licenseNumber: input.licenseNumber as string | null }
        : {}),

      ...(typeof input.country === "string" &&
      input.country.trim()
        ? { country: input.country.trim() }
        : {}),

      ...(typeof input.county === "string" ||
      input.county === null
        ? { county: input.county as string | null }
        : {}),

      ...(typeof input.address === "string" ||
      input.address === null
        ? { address: input.address as string | null }
        : {}),

      ...(typeof input.phone === "string" ||
      input.phone === null
        ? { phone: input.phone as string | null }
        : {}),

      ...(typeof input.email === "string" ||
      input.email === null
        ? { email: input.email as string | null }
        : {}),

      ...(typeof input.isActive === "boolean"
        ? { isActive: input.isActive }
        : {}),
    });

    return NextResponse.json({ profile });
  } catch (error) {
    if (
      error instanceof BusinessPermissionError ||
      error instanceof SubscriptionEntitlementError ||
      error instanceof HospitalAccessError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Hospital profile update failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update hospital profile.",
      },
      { status: 500 },
    );
  }
}
