import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import {
  HospitalAccessError,
  requireHospitalBusiness,
} from "@/lib/hospital/hospitalAccessService";
import { HospitalPrescriptionError } from "@/lib/hospital/hospitalPrescriptionService";
import { dispenseHospitalPrescription } from "@/lib/hospital/hospitalPrescriptionDispensingService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ prescriptionId: string }>;
};

function optionalString(
  body: Record<string, unknown>,
  key: string,
): string | null | undefined {
  const value = body[key];

  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== "string") {
    throw new HospitalPrescriptionError(
      `${key} must be a string.`,
    );
  }

  return value;
}

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.prescriptions.manage",
    );

    requireHospitalBusiness(context.business.type as BusinessType);

    const { prescriptionId } = await params;

    if (!prescriptionId.trim()) {
      return NextResponse.json(
        { error: "A valid prescription ID is required." },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "The request body must be a JSON object." },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    const requiredFields = [
      "prescriptionItemId",
      "warehouseId",
      "operationId",
    ] as const;

    for (const field of requiredFields) {
      if (
        typeof data[field] !== "string" ||
        !data[field].trim()
      ) {
        return NextResponse.json(
          { error: `${field} is required and must be a non-empty string.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof data.quantity !== "string" &&
      typeof data.quantity !== "number"
    ) {
      return NextResponse.json(
        { error: "quantity must be a number or numeric string." },
        { status: 400 },
      );
    }

    const result = await dispenseHospitalPrescription({
      businessId: context.business.id,
      userId: context.user.id,
      prescriptionId,
      prescriptionItemId: data.prescriptionItemId as string,
      warehouseId: data.warehouseId as string,
      quantity: data.quantity,
      operationId: data.operationId as string,
      notes: optionalString(data, "notes"),
      pharmacistName: optionalString(data, "pharmacistName"),
      pharmacistLicense: optionalString(data, "pharmacistLicense"),
    });

    return NextResponse.json({ result });
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

    console.error("Hospital prescription dispensing failed:", error);

    return NextResponse.json(
      { error: "Unable to dispense the hospital prescription." },
      { status: 500 },
    );
  }
}
