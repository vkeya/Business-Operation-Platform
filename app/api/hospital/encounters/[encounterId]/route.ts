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
  getHospitalEncounter,
  HospitalEncounterError,
  updateHospitalEncounterStatus,
} from "@/lib/hospital/hospitalEncounterService";
import type { HospitalEncounterStatus } from "@/generated/prisma/client";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ encounterId: string }>;
};

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

const validStatuses = new Set<HospitalEncounterStatus>([
  "OPEN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    await authorizeEncounterOperation("hospital.encounters.read");

    const { encounterId } = await params;

    if (!encounterId?.trim()) {
      return NextResponse.json(
        { error: "Encounter ID is required." },
        { status: 400 },
      );
    }

    const encounter = await getHospitalEncounter(encounterId);

    return NextResponse.json({ encounter });
  } catch (error) {
    return errorResponse(error, "Hospital encounter lookup");
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    await authorizeEncounterOperation("hospital.encounters.manage");

    const { encounterId } = await params;

    if (!encounterId?.trim()) {
      return NextResponse.json(
        { error: "Encounter ID is required." },
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
        { error: "A valid encounter update object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    for (const field of Object.keys(input)) {
      if (field !== "status") {
        return NextResponse.json(
          { error: `Unsupported encounter field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      Object.keys(input).length !== 1 ||
      typeof input.status !== "string" ||
      !validStatuses.has(input.status as HospitalEncounterStatus)
    ) {
      return NextResponse.json(
        { error: "A valid encounter status is required." },
        { status: 400 },
      );
    }

    const encounter = await updateHospitalEncounterStatus(
      encounterId,
      input.status as HospitalEncounterStatus,
    );

    return NextResponse.json({ encounter });
  } catch (error) {
    return errorResponse(error, "Hospital encounter status update");
  }
}
