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
  HospitalAdmissionError,
  createHospitalAdmission,
  listHospitalAdmissions,
} from "@/lib/hospital/hospitalAdmissionService";
import type { HospitalAdmissionStatus } from "@/generated/prisma/client";
import type { BusinessType } from "@/types";

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
  "ADMITTED",
  "DISCHARGED",
  "CANCELLED",
]);

export async function GET(request: Request) {
  try {
    await authorizeAdmissionOperation("hospital.admissions.read");

    const url = new URL(request.url);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const take = Number(url.searchParams.get("take") ?? 25);
    const patientId = url.searchParams.get("patientId")?.trim();
    const encounterId = url.searchParams.get("encounterId")?.trim();
    const clinicianId = url.searchParams.get("clinicianId")?.trim();
    const status = url.searchParams.get("status");

    if (
      !Number.isInteger(skip) ||
      skip < 0 ||
      !Number.isInteger(take) ||
      take < 1 ||
      take > 100
    ) {
      return NextResponse.json(
        { error: "Invalid pagination parameters." },
        { status: 400 },
      );
    }

    if (status && !validStatuses.has(status as HospitalAdmissionStatus)) {
      return NextResponse.json(
        { error: "Invalid admission status." },
        { status: 400 },
      );
    }

    const admissions = await listHospitalAdmissions({
      skip,
      take,
      ...(patientId ? { patientId } : {}),
      ...(encounterId ? { encounterId } : {}),
      ...(clinicianId ? { clinicianId } : {}),
      ...(status ? { status: status as HospitalAdmissionStatus } : {}),
    });

    return NextResponse.json({ admissions });
  } catch (error) {
    return errorResponse(error, "Hospital admission lookup");
  }
}

export async function POST(request: Request) {
  try {
    await authorizeAdmissionOperation("hospital.admissions.manage");

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid admission object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "patientId",
      "encounterId",
      "admissionReason",
      "clinicianId",
    ]);

    for (const field of Object.keys(input)) {
      if (!allowedFields.has(field)) {
        return NextResponse.json(
          { error: `Unsupported admission field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof input.patientId !== "string" ||
      !input.patientId.trim()
    ) {
      return NextResponse.json(
        { error: "A valid patient ID is required." },
        { status: 400 },
      );
    }

    for (const field of ["encounterId", "clinicianId", "admissionReason"] as const) {
      if (
        input[field] !== undefined &&
        input[field] !== null &&
        (typeof input[field] !== "string" || !input[field].trim())
      ) {
        return NextResponse.json(
          { error: `Invalid value for ${field}.` },
          { status: 400 },
        );
      }
    }

    const admission = await createHospitalAdmission({
      patientId: input.patientId.trim(),
      ...(typeof input.encounterId === "string"
        ? { encounterId: input.encounterId.trim() }
        : {}),
      ...(input.encounterId === null ? { encounterId: null } : {}),
      ...(typeof input.admissionReason === "string"
        ? { admissionReason: input.admissionReason.trim() }
        : {}),
      ...(typeof input.clinicianId === "string"
        ? { clinicianId: input.clinicianId.trim() }
        : {}),
      ...(input.clinicianId === null ? { clinicianId: null } : {}),
    });

    return NextResponse.json({ admission }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Hospital admission creation");
  }
}
