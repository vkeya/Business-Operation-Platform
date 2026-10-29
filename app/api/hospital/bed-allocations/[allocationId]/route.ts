import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import {
  HospitalAccessError,
  requireHospitalBusiness,
} from "@/lib/hospital/hospitalAccessService";
import {
  HospitalBedAllocationError,
  releaseHospitalBedAllocation,
} from "@/lib/hospital/hospitalBedAllocationService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ allocationId: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorResponse(error: unknown) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalBedAllocationError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error("Hospital bed allocation release failed:", error);

  return NextResponse.json(
    { error: "Unable to release the hospital bed allocation." },
    { status: 500 },
  );
}

export async function PATCH(request: Request, routeContext: RouteContext) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.beds.manage",
    );

    requireHospitalBusiness(context.business.type as BusinessType);

    const { allocationId } = await routeContext.params;

    if (!allocationId?.trim()) {
      return NextResponse.json(
        { error: "Allocation ID is required." },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON release object is required." },
        { status: 400 },
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "A valid release object is required." },
        { status: 400 },
      );
    }

    const keys = Object.keys(body);

    if (keys.some((key) => key !== "releaseReason")) {
      return NextResponse.json(
        { error: "Only releaseReason is accepted by this endpoint." },
        { status: 400 },
      );
    }

    if (
      body.releaseReason !== undefined &&
      body.releaseReason !== null &&
      typeof body.releaseReason !== "string"
    ) {
      return NextResponse.json(
        { error: "Release reason must be a string or null." },
        { status: 400 },
      );
    }

    if (
      typeof body.releaseReason === "string" &&
      body.releaseReason.trim().length > 500
    ) {
      return NextResponse.json(
        { error: "Release reason cannot exceed 500 characters." },
        { status: 400 },
      );
    }

    const allocation = await releaseHospitalBedAllocation(
      allocationId,
      typeof body.releaseReason === "string"
        ? body.releaseReason
        : body.releaseReason === null
          ? null
          : undefined,
    );

    return NextResponse.json({ allocation });
  } catch (error) {
    return errorResponse(error);
  }
}
