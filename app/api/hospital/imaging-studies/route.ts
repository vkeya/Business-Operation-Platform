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
  createHospitalImagingStudy,
} from "@/lib/hospital/hospitalImagingService";
import type { BusinessType } from "@/types";

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

  console.error("Hospital imaging study creation failed:", error);
  return NextResponse.json(
    { error: "Unable to create the hospital imaging study." },
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

export async function POST(request: Request) {
  try {
    await authorize();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON imaging study object is required." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "A valid imaging study object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "orderItemId",
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

    if (typeof input.orderItemId !== "string" || !input.orderItemId.trim()) {
      return NextResponse.json(
        { error: "A valid orderItemId is required." },
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

    const study = await createHospitalImagingStudy({
      orderItemId: input.orderItemId.trim(),
      ...(typeof input.scheduledAt === "string"
        ? { scheduledAt: new Date(input.scheduledAt) }
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

    return NextResponse.json({ study }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}