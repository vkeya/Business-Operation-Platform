import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import { HospitalAccessError } from "@/lib/hospital/hospitalAccessService";
import {
  changeHospitalBedStatus,
  getHospitalBed,
  HospitalWardBedError,
} from "@/lib/hospital/hospitalWardBedService";
import { HospitalBedStatus } from "../../../../../generated/prisma/client";

function errorResponse(error: unknown, operation: string) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalWardBedError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`Hospital bed ${operation} failed:`, error);

  return NextResponse.json(
    { error: `Unable to ${operation} hospital bed.` },
    { status: 500 },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type RouteContext = {
  params: Promise<{ bedId: string }>;
};

export async function GET(_request: Request, routeContext: RouteContext) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.beds.read",
    );

    const { bedId } = await routeContext.params;
    const bed = await getHospitalBed(bedId);

    return NextResponse.json({ bed });
  } catch (error) {
    return errorResponse(error, "load");
  }
}

export async function PATCH(request: Request, routeContext: RouteContext) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.beds.manage",
    );

    const { bedId } = await routeContext.params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON bed object is required." },
        { status: 400 },
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "A valid bed object is required." },
        { status: 400 },
      );
    }

    const keys = Object.keys(body);

    if (keys.length !== 1 || keys[0] !== "status") {
      return NextResponse.json(
        { error: "Only the bed status can be changed through this endpoint." },
        { status: 400 },
      );
    }

    if (
      typeof body.status !== "string" ||
      !Object.values(HospitalBedStatus).includes(
        body.status as HospitalBedStatus,
      )
    ) {
      return NextResponse.json(
        { error: "A valid bed status is required." },
        { status: 400 },
      );
    }

    const bed = await changeHospitalBedStatus(
      bedId,
      body.status as HospitalBedStatus,
    );

    return NextResponse.json({ bed });
  } catch (error) {
    return errorResponse(error, "update");
  }
}
