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
  releaseHospitalLabResult,
} from "@/lib/hospital/hospitalLabService";
import type { BusinessType } from "@/types";

export async function POST(
  _request: Request,
  routeContext: { params: Promise<{ resultId: string }> },
) {
  try {
    const context = await getCurrentBusinessContext();
    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.lab_results.release",
    );
    requireHospitalBusiness(context.business.type as BusinessType);

    const { resultId } = await routeContext.params;
    const result = await releaseHospitalLabResult(resultId);
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
    console.error("Hospital laboratory result release failed:", error);
    return NextResponse.json(
      { error: "Unable to release the hospital laboratory result." },
      { status: 500 },
    );
  }
}
