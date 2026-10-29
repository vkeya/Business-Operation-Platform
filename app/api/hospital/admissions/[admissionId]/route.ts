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
  getHospitalAdmission,
  HospitalAdmissionError,
  updateHospitalAdmissionStatus,
} from "@/lib/hospital/hospitalAdmissionService";
import type { HospitalAdmissionStatus } from "@/generated/prisma/client";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ admissionId: string }>;
};

function errorResponse(error: unknown, operation: string) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalAdmissionError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`${operation} failed:`, error);

  return NextResponse.json(
    { error: "Unable to complete the hospital admission operation." },
    { status: 500 },
  );
}

async function authorizeAdmissionOperation(permission: string) {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    permission,
  );

  requireHospitalBusiness(context.business.type as BusinessType);

  return context;
}

const validStatuses = new Set<HospitalAdmissionStatus>([
  "DISCHARGED",
  "CANCELLED",
]);

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    await authorizeAdmissionOperation("hospital.admissions.read");

    const { admissionId } = await params;

    if (!admissionId?.trim()) {
      return NextResponse.json(
        { error: "Admission ID is required." },
        { status: 400 },
      );
    }

    const admission = await getHospitalAdmission(admissionId);

    return NextResponse.json({ admission });
  } catch (error) {
    return errorResponse(error, "Hospital admission lookup");
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    await authorizeAdmissionOperation("hospital.admissions.manage");

    const { admissionId } = await params;

    if (!admissionId?.trim()) {
      return NextResponse.json(
        { error: "Admission ID is required." },
        { status: 400 },
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid admission update object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    for (const field of Object.keys(input)) {
      if (field !== "status" && field !== "dischargeNotes") {
        return NextResponse.json(
          { error: `Unsupported admission field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof input.status !== "string" ||
      !validStatuses.has(input.status as HospitalAdmissionStatus)
    ) {
      return NextResponse.json(
        { error: "A valid terminal admission status is required." },
        { status: 400 },
      );
    }

    if (
      input.dischargeNotes !== undefined &&
      input.dischargeNotes !== null &&
      typeof input.dischargeNotes !== "string"
    ) {
      return NextResponse.json(
        { error: "Discharge notes must be a string or null." },
        { status: 400 },
      );
    }

    if (
      input.status === "CANCELLED" &&
      input.dischargeNotes !== undefined &&
      input.dischargeNotes !== null
    ) {
      return NextResponse.json(
        { error: "Discharge notes are only supported when discharging an admission." },
        { status: 400 },
      );
    }

    const admission = await updateHospitalAdmissionStatus(
      admissionId,
      input.status as HospitalAdmissionStatus,
      typeof input.dischargeNotes === "string"
        ? input.dischargeNotes.trim()
        : undefined,
    );

    return NextResponse.json({ admission });
  } catch (error) {
    return errorResponse(error, "Hospital admission status update");
  }
}
