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
  allocateHospitalBed,
  HospitalBedAllocationError,
} from "@/lib/hospital/hospitalBedAllocationService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ admissionId: string }>;
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

  console.error("Hospital bed allocation failed:", error);

  return NextResponse.json(
    { error: "Unable to allocate the hospital bed." },
    { status: 500 },
  );
}

export async function POST(request: Request, routeContext: RouteContext) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.admissions.manage",
    );

    requireHospitalBusiness(context.business.type as BusinessType);

    const { admissionId } = await routeContext.params;

    if (!admissionId?.trim()) {
      return NextResponse.json(
        { error: "Admission ID is required." },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON allocation object is required." },
        { status: 400 },
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "A valid allocation object is required." },
        { status: 400 },
      );
    }

    const keys = Object.keys(body);

    if (keys.length !== 1 || keys[0] !== "bedId") {
      return NextResponse.json(
        { error: "Only bedId is accepted by this endpoint." },
        { status: 400 },
      );
    }

    if (typeof body.bedId !== "string" || !body.bedId.trim()) {
      return NextResponse.json(
        { error: "A valid bedId is required." },
        { status: 400 },
      );
    }

    const allocation = await allocateHospitalBed(
      admissionId,
      body.bedId,
    );

    return NextResponse.json({ allocation }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
