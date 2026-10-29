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
  getHospitalDiagnosis,
} from "@/lib/hospital/hospitalDiagnosisService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ diagnosisId: string }>;
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
      "hospital.diagnoses.read",
    );

    requireHospitalBusiness(context.business.type as BusinessType);

    const { diagnosisId } = await params;

    if (!diagnosisId.trim()) {
      return NextResponse.json(
        { error: "A valid diagnosis ID is required." },
        { status: 400 },
      );
    }

    const diagnosis = await getHospitalDiagnosis(diagnosisId);

    return NextResponse.json({ diagnosis });
  } catch (error) {
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

    console.error("Hospital diagnosis lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve the hospital diagnosis." },
      { status: 500 },
    );
  }
}
