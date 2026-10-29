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
  HospitalDiagnosisError,
  createHospitalDiagnosis,
  listHospitalDiagnoses,
} from "@/lib/hospital/hospitalDiagnosisService";
import type { BusinessType } from "@/types";

function errorResponse(error: unknown, operation: string) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalDiagnosisError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`${operation} failed:`, error);

  return NextResponse.json(
    { error: "Unable to complete the hospital diagnosis operation." },
    { status: 500 },
  );
}

async function authorizeDiagnosisOperation(permission: string) {
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
    await authorizeDiagnosisOperation("hospital.diagnoses.read");

    const url = new URL(request.url);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const take = Number(url.searchParams.get("take") ?? 25);
    const patientId = url.searchParams.get("patientId")?.trim();
    const encounterId = url.searchParams.get("encounterId")?.trim();

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

    const diagnoses = await listHospitalDiagnoses({
      skip,
      take,
      ...(patientId ? { patientId } : {}),
      ...(encounterId ? { encounterId } : {}),
    });

    return NextResponse.json({ diagnoses });
  } catch (error) {
    return errorResponse(error, "Hospital diagnosis lookup");
  }
}

export async function POST(request: Request) {
  try {
    await authorizeDiagnosisOperation("hospital.diagnoses.manage");

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON diagnosis object is required." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid diagnosis object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "patientId",
      "encounterId",
      "code",
      "description",
      "classification",
    ]);

    for (const field of Object.keys(input)) {
      if (!allowedFields.has(field)) {
        return NextResponse.json(
          { error: `Unsupported diagnosis field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof input.patientId !== "string" ||
      !input.patientId.trim() ||
      typeof input.encounterId !== "string" ||
      !input.encounterId.trim() ||
      typeof input.description !== "string" ||
      !input.description.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Valid patientId, encounterId, and description are required.",
        },
        { status: 400 },
      );
    }

    for (const field of ["code", "classification"] as const) {
      const value = input[field];

      if (
        value !== undefined &&
        value !== null &&
        (typeof value !== "string" || !value.trim())
      ) {
        return NextResponse.json(
          { error: `Invalid value for ${field}.` },
          { status: 400 },
        );
      }
    }

    const diagnosis = await createHospitalDiagnosis({
      patientId: input.patientId.trim(),
      encounterId: input.encounterId.trim(),
      description: input.description.trim(),
      ...(typeof input.code === "string"
        ? { code: input.code.trim() }
        : {}),
      ...(input.code === null ? { code: null } : {}),
      ...(typeof input.classification === "string"
        ? { classification: input.classification.trim() }
        : {}),
      ...(input.classification === null
        ? { classification: null }
        : {}),
    });

    return NextResponse.json({ diagnosis }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Hospital diagnosis creation");
  }
}
