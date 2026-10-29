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
  updateHospitalLabSpecimen,
} from "@/lib/hospital/hospitalLabService";
import type { BusinessType } from "@/types";

function errorResponse(error: unknown) {
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

  console.error("Hospital specimen update failed:", error);
  return NextResponse.json(
    { error: "Unable to update the hospital laboratory specimen." },
    { status: 500 },
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ specimenId: string }> },
) {
  try {
    const businessContext = await getCurrentBusinessContext();
    await requireBusinessOperationAccess(
      businessContext.user.id,
      businessContext.business.id,
      "hospital.labs.manage",
    );
    requireHospitalBusiness(businessContext.business.type as BusinessType);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "A valid JSON object is required." }, { status: 400 });
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "A valid specimen update object is required." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const allowedFields = ["action", "rejectionReason", "notes"];
    for (const field of Object.keys(input)) {
      if (!allowedFields.includes(field)) {
        return NextResponse.json({ error: `Unsupported specimen update field: ${field}.` }, { status: 400 });
      }
    }

    if (
      typeof input.action !== "string" ||
      !["collect", "receive", "reject"].includes(input.action)
    ) {
      return NextResponse.json(
        { error: "Action must be collect, receive, or reject." },
        { status: 400 },
      );
    }

    for (const field of ["rejectionReason", "notes"] as const) {
      const value = input[field];
      if (value !== undefined && value !== null && typeof value !== "string") {
        return NextResponse.json({ error: `Invalid value for ${field}.` }, { status: 400 });
      }
    }

    const { specimenId } = await context.params;
    const specimen = await updateHospitalLabSpecimen(
      specimenId,
      input.action as "collect" | "receive" | "reject",
      {
        ...(typeof input.rejectionReason === "string"
          ? { rejectionReason: input.rejectionReason }
          : {}),
        ...(input.rejectionReason === null ? { rejectionReason: null } : {}),
        ...(typeof input.notes === "string" ? { notes: input.notes } : {}),
        ...(input.notes === null ? { notes: null } : {}),
      },
    );

    return NextResponse.json({ specimen });
  } catch (error) {
    return errorResponse(error);
  }
}
