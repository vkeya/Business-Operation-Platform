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
  amendHospitalLabResult,
} from "@/lib/hospital/hospitalLabService";
import type { BusinessType } from "@/types";

export async function POST(
  request: Request,
  routeContext: { params: Promise<{ resultId: string }> },
) {
  try {
    const context = await getCurrentBusinessContext();
    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.labs.manage",
    );
    requireHospitalBusiness(context.business.type as BusinessType);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "A valid JSON amendment object is required." }, { status: 400 });
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "A valid amendment object is required." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "resultValue",
      "numericValue",
      "unit",
      "referenceRange",
      "abnormalFlag",
      "amendmentReason",
    ]);

    for (const field of Object.keys(input)) {
      if (!allowedFields.has(field)) {
        return NextResponse.json({ error: `Unsupported amendment field: ${field}.` }, { status: 400 });
      }
    }

    if (
      typeof input.resultValue !== "string" ||
      !input.resultValue.trim() ||
      typeof input.amendmentReason !== "string" ||
      !input.amendmentReason.trim()
    ) {
      return NextResponse.json(
        { error: "A resultValue and amendmentReason are required." },
        { status: 400 },
      );
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

    const { resultId } = await routeContext.params;
    const result = await amendHospitalLabResult(resultId, {
      resultValue: input.resultValue,
      amendmentReason: input.amendmentReason,
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

    return NextResponse.json({ result });
  } catch (error) {
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
    console.error("Hospital laboratory result amendment failed:", error);
    return NextResponse.json(
      { error: "Unable to amend the hospital laboratory result." },
      { status: 500 },
    );
  }
}
