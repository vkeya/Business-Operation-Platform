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
  HospitalEncounterError,
  createHospitalEncounter,
  listHospitalEncounters,
} from "@/lib/hospital/hospitalEncounterService";
import type { HospitalEncounterStatus, HospitalEncounterType } from "@/generated/prisma/client";
import type { BusinessType } from "@/types";

function errorResponse(error: unknown, operation: string) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalEncounterError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`${operation} failed:`, error);

  return NextResponse.json(
    { error: "Unable to complete the hospital encounter operation." },
    { status: 500 },
  );
}

async function authorizeEncounterOperation(permission: string) {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    permission,
  );

  requireHospitalBusiness(context.business.type as BusinessType);

  return context;
}

const validTypes = new Set<HospitalEncounterType>([
  "OUTPATIENT",
  "EMERGENCY",
  "FOLLOW_UP",
  "INPATIENT",
]);

const validStatuses = new Set<HospitalEncounterStatus>([
  "OPEN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export async function GET(request: Request) {
  try {
    await authorizeEncounterOperation("hospital.encounters.read");

    const url = new URL(request.url);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const take = Number(url.searchParams.get("take") ?? 25);
    const patientId = url.searchParams.get("patientId")?.trim();
    const appointmentId = url.searchParams.get("appointmentId")?.trim();
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

    if (status && !validStatuses.has(status as HospitalEncounterStatus)) {
      return NextResponse.json(
        { error: "Invalid encounter status." },
        { status: 400 },
      );
    }

    const encounters = await listHospitalEncounters({
      skip,
      take,
      ...(patientId ? { patientId } : {}),
      ...(appointmentId ? { appointmentId } : {}),
      ...(clinicianId ? { clinicianId } : {}),
      ...(status ? { status: status as HospitalEncounterStatus } : {}),
    });

    return NextResponse.json({ encounters });
  } catch (error) {
    return errorResponse(error, "Hospital encounter lookup");
  }
}

export async function POST(request: Request) {
  try {
    await authorizeEncounterOperation("hospital.encounters.manage");

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid encounter object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "patientId",
      "appointmentId",
      "type",
      "clinicianId",
    ]);

    for (const field of Object.keys(input)) {
      if (!allowedFields.has(field)) {
        return NextResponse.json(
          { error: `Unsupported encounter field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof input.patientId !== "string" ||
      !input.patientId.trim() ||
      typeof input.type !== "string" ||
      !validTypes.has(input.type as HospitalEncounterType)
    ) {
      return NextResponse.json(
        { error: "A valid patient ID and encounter type are required." },
        { status: 400 },
      );
    }

    for (const field of ["appointmentId", "clinicianId"] as const) {
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

    const encounter = await createHospitalEncounter({
      patientId: input.patientId.trim(),
      type: input.type as HospitalEncounterType,
      ...(typeof input.appointmentId === "string"
        ? { appointmentId: input.appointmentId }
        : {}),
      ...(input.appointmentId === null ? { appointmentId: null } : {}),
      ...(typeof input.clinicianId === "string"
        ? { clinicianId: input.clinicianId }
        : {}),
      ...(input.clinicianId === null ? { clinicianId: null } : {}),
    });

    return NextResponse.json({ encounter }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Hospital encounter creation");
  }
}
