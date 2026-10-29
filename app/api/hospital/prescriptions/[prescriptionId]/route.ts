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
  HospitalPrescriptionError,
  getHospitalPrescription,
} from "@/lib/hospital/hospitalPrescriptionService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ prescriptionId: string }>;
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
      "hospital.prescriptions.read",
    );

    requireHospitalBusiness(context.business.type as BusinessType);

    const { prescriptionId } = await params;

    if (!prescriptionId.trim()) {
      return NextResponse.json(
        { error: "A valid prescription ID is required." },
        { status: 400 },
      );
    }

    const prescription = await getHospitalPrescription(prescriptionId);

    return NextResponse.json({ prescription });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Authentication is required."
    ) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    if (
      error instanceof BusinessPermissionError ||
      error instanceof SubscriptionEntitlementError ||
      error instanceof HospitalAccessError ||
      error instanceof HospitalPrescriptionError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Hospital prescription lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve the hospital prescription." },
      { status: 500 },
    );
  }
}
