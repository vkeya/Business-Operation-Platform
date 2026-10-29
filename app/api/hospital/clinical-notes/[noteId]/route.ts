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
  getHospitalClinicalNote,
  HospitalClinicalNoteError,
} from "@/lib/hospital/hospitalClinicalNoteService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ noteId: string }>;
};

function errorResponse(error: unknown) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalClinicalNoteError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error("Hospital clinical note detail lookup failed:", error);

  return NextResponse.json(
    { error: "Unable to retrieve the hospital clinical note." },
    { status: 500 },
  );
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.clinical_notes.read",
    );

    requireHospitalBusiness(context.business.type as BusinessType);

    const { noteId } = await params;
    const note = await getHospitalClinicalNote(noteId);

    return NextResponse.json({ note });
  } catch (error) {
    return errorResponse(error);
  }
}
