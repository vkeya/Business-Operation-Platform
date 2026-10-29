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
  HospitalLabError,
  createHospitalLabResult,
  listHospitalLabResults,
} from "@/lib/hospital/hospitalLabService";
import type { BusinessType } from "@/types";

function errorResponse(error: unknown, operation: string) {
  if (error instanceof Error && error.message === "Authentication is required.") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalLabError
  ) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  console.error(`${operation} failed:`, error);
  return NextResponse.json(
    { error: "Unable to complete the hospital laboratory result operation." },
    { status: 500 },
  );
}

async function authorize(permission: string) {
  const context = await getCurrentBusinessContext();
  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    permission,
  );
  requireHospitalBusiness(context.business.type as BusinessType);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    await authorize("hospital.labs.read");

    const { itemId } = await context.params;
    const url = new URL(request.url);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const take = Number(url.searchParams.get("take") ?? 25);

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

    const results = await listHospitalLabResults(itemId, skip, take);
    return NextResponse.json({ results });
  } catch (error) {
    return errorResponse(error, "Hospital laboratory result lookup");
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    await authorize("hospital.labs.manage");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON laboratory result object is required." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "A valid laboratory result object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "specimenId",
      "resultValue",
      "numericValue",
      "unit",
      "referenceRange",
      "abnormalFlag",
    ]);

    for (const field of Object.keys(input)) {
      if (!allowedFields.has(field)) {
        return NextResponse.json(
          { error: `Unsupported laboratory result field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (typeof input.resultValue !== "string" || !input.resultValue.trim()) {
      return NextResponse.json(
        { error: "A non-empty resultValue is required." },
        { status: 400 },
      );
    }

    if (
      input.specimenId !== undefined &&
      input.specimenId !== null &&
      typeof input.specimenId !== "string"
    ) {
      return NextResponse.json({ error: "Invalid specimenId." }, { status: 400 });
    }

    if (
      input.numericValue !== undefined &&
      input.numericValue !== null &&
      input.numericValue !== "" &&
      typeof input.numericValue !== "number" &&
      typeof input.numericValue !== "string"
    ) {
      return NextResponse.json({ error: "Invalid numericValue." }, { status: 400 });
    }

    for (const field of ["unit", "referenceRange", "abnormalFlag"] as const) {
      const value = input[field];
      if (value !== undefined && value !== null && typeof value !== "string") {
        return NextResponse.json({ error: `Invalid value for ${field}.` }, { status: 400 });
      }
    }

    const { itemId } = await context.params;
    const result = await createHospitalLabResult({
      orderItemId: itemId,
      resultValue: input.resultValue,
      ...(typeof input.specimenId === "string"
        ? { specimenId: input.specimenId }
        : {}),
      ...(input.specimenId === null ? { specimenId: null } : {}),
      ...(typeof input.numericValue === "number" || typeof input.numericValue === "string"
        ? { numericValue: input.numericValue }
        : {}),
      ...(input.numericValue === null ? { numericValue: null } : {}),
      ...(typeof input.unit === "string" ? { unit: input.unit } : {}),
      ...(input.unit === null ? { unit: null } : {}),
      ...(typeof input.referenceRange === "string"
        ? { referenceRange: input.referenceRange }
        : {}),
      ...(input.referenceRange === null ? { referenceRange: null } : {}),
      ...(typeof input.abnormalFlag === "string"
        ? { abnormalFlag: input.abnormalFlag }
        : {}),
      ...(input.abnormalFlag === null ? { abnormalFlag: null } : {}),
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Hospital laboratory result creation");
  }
}
