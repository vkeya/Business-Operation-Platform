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
  HospitalImagingError,
  updateHospitalImagingStudy,
} from "@/lib/hospital/hospitalImagingService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ studyId: string }>;
};

function errorResponse(error: unknown) {
  if (error instanceof Error && error.message === "Authentication is required.") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalImagingError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error("Hospital imaging study update failed:", error);
  return NextResponse.json(
    { error: "Unable to update the hospital imaging study." },
    { status: 500 },
  );
}

async function authorize() {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    "hospital.imaging.manage",
  );

  requireHospitalBusiness(context.business.type as BusinessType);
}

const validStatuses = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    await authorize();

    const { studyId } = await params;

    if (!studyId?.trim()) {
      return NextResponse.json(
        { error: "Imaging study ID is required." },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON imaging study update is required." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "A valid imaging study update object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "status",
      "scheduledAt",
      "performedBy",
      "location",
      "notes",
    ]);

    for (const field of Object.keys(input)) {
      if (!allowedFields.has(field)) {
        return NextResponse.json(
          { error: `Unsupported imaging study field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof input.status !== "string" ||
      !validStatuses.includes(input.status as (typeof validStatuses)[number])
    ) {
      return NextResponse.json(
        { error: "A valid imaging study status is required." },
        { status: 400 },
      );
    }

    if (
      input.scheduledAt !== undefined &&
      input.scheduledAt !== null &&
      (typeof input.scheduledAt !== "string" ||
        Number.isNaN(Date.parse(input.scheduledAt)))
    ) {
      return NextResponse.json(
        { error: "scheduledAt must be a valid date." },
        { status: 400 },
      );
    }

    for (const field of ["performedBy", "location", "notes"] as const) {
      const value = input[field];
      if (value !== undefined && value !== null && typeof value !== "string") {
        return NextResponse.json(
          { error: `Invalid value for ${field}.` },
          { status: 400 },
        );
      }
    }

    const study = await updateHospitalImagingStudy(studyId, {
      status: input.status as (typeof validStatuses)[number],
      ...(typeof input.scheduledAt === "string"
        ? { scheduledAt: new Date(input.scheduledAt) }
        : input.scheduledAt === null
          ? { scheduledAt: null }
          : {}),
      ...(typeof input.performedBy === "string" || input.performedBy === null
        ? { performedBy: input.performedBy }
        : {}),
      ...(typeof input.location === "string" || input.location === null
        ? { location: input.location }
        : {}),
      ...(typeof input.notes === "string" || input.notes === null
        ? { notes: input.notes }
        : {}),
    });

    return NextResponse.json({ study });
  } catch (error) {
    return errorResponse(error);
  }
}
