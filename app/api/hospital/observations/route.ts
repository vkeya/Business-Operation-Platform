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
  HospitalObservationError,
  createHospitalObservation,
  listHospitalObservations,
} from "@/lib/hospital/hospitalObservationService";
import type { BusinessType } from "@/types";

function errorResponse(error: unknown, operation: string) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalObservationError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`${operation} failed:`, error);

  return NextResponse.json(
    { error: "Unable to complete the hospital observation operation." },
    { status: 500 },
  );
}

async function authorizeObservationOperation(permission: string) {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    permission,
  );

  requireHospitalBusiness(context.business.type as BusinessType);

  return context;
}

export async function GET(request: Request) {
  try {
    await authorizeObservationOperation("hospital.observations.read");

    const url = new URL(request.url);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const take = Number(url.searchParams.get("take") ?? 25);
    const patientId = url.searchParams.get("patientId")?.trim();
    const encounterId = url.searchParams.get("encounterId")?.trim();
    const observationType = url.searchParams.get("observationType")?.trim();

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

    if (!patientId && !encounterId) {
      return NextResponse.json(
        { error: "A patientId or encounterId filter is required." },
        { status: 400 },
      );
    }

    const observations = await listHospitalObservations({
      skip,
      take,
      ...(patientId ? { patientId } : {}),
      ...(encounterId ? { encounterId } : {}),
      ...(observationType ? { observationType } : {}),
    });

    return NextResponse.json({ observations });
  } catch (error) {
    return errorResponse(error, "Hospital observation lookup");
  }
}

export async function POST(request: Request) {
  try {
    await authorizeObservationOperation("hospital.observations.manage");

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON observation object is required." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid observation object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "patientId",
      "encounterId",
      "observationType",
      "value",
      "numericValue",
      "unit",
      "observedAt",
    ]);

    for (const field of Object.keys(input)) {
      if (!allowedFields.has(field)) {
        return NextResponse.json(
          { error: `Unsupported observation field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof input.patientId !== "string" ||
      !input.patientId.trim() ||
      typeof input.encounterId !== "string" ||
      !input.encounterId.trim() ||
      typeof input.observationType !== "string" ||
      !input.observationType.trim() ||
      typeof input.value !== "string" ||
      !input.value.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Valid patientId, encounterId, observationType, and value are required.",
        },
        { status: 400 },
      );
    }

    if (
      input.numericValue !== undefined &&
      input.numericValue !== null &&
      typeof input.numericValue !== "number" &&
      typeof input.numericValue !== "string"
    ) {
      return NextResponse.json(
        { error: "numericValue must be a number or numeric string." },
        { status: 400 },
      );
    }

    if (
      typeof input.numericValue === "string" &&
      !input.numericValue.trim()
    ) {
      return NextResponse.json(
        { error: "numericValue cannot be empty." },
        { status: 400 },
      );
    }

    if (
      input.unit !== undefined &&
      input.unit !== null &&
      (typeof input.unit !== "string" || !input.unit.trim())
    ) {
      return NextResponse.json(
        { error: "Invalid value for unit." },
        { status: 400 },
      );
    }

    if (
      input.observedAt !== undefined &&
      typeof input.observedAt !== "string"
    ) {
      return NextResponse.json(
        { error: "observedAt must be an ISO date-time string." },
        { status: 400 },
      );
    }

    const observation = await createHospitalObservation({
      patientId: input.patientId.trim(),
      encounterId: input.encounterId.trim(),
      observationType: input.observationType.trim(),
      value: input.value.trim(),
      ...(typeof input.numericValue === "number" ||
      typeof input.numericValue === "string"
        ? { numericValue: input.numericValue }
        : {}),
      ...(typeof input.unit === "string"
        ? { unit: input.unit.trim() }
        : {}),
      ...(input.unit === null ? { unit: null } : {}),
      ...(typeof input.observedAt === "string"
        ? { observedAt: input.observedAt }
        : {}),
    });

    return NextResponse.json({ observation }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Hospital observation creation");
  }
}
