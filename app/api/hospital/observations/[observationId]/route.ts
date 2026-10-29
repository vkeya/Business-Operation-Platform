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
  getHospitalObservation,
} from "@/lib/hospital/hospitalObservationService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ observationId: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.observations.read",
    );

    requireHospitalBusiness(context.business.type as BusinessType);

    const { observationId } = await params;

    if (!observationId.trim()) {
      return NextResponse.json(
        { error: "A valid observation ID is required." },
        { status: 400 },
      );
    }

    const observation = await getHospitalObservation(observationId);

    return NextResponse.json({ observation });
  } catch (error) {
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

    console.error("Hospital observation lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve the hospital observation." },
      { status: 500 },
    );
  }
}
