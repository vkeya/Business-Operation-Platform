import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import {
  BusinessPermissionError,
} from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import {
  HospitalAccessError,
  requireHospitalBusiness,
} from "@/lib/hospital/hospitalAccessService";
import {
  HospitalPatientError,
  getHospitalPatient,
  updateHospitalPatient,
  deactivateHospitalPatient,
} from "@/lib/hospital/hospitalPatientService";
import type { UpdateHospitalPatientInput } from "@/lib/hospital/hospitalPatientService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ patientId: string }>;
};

function errorResponse(error: unknown, operation: string) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalPatientError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`${operation} failed:`, error);

  return NextResponse.json(
    { error: "Unable to complete the patient operation." },
    { status: 500 },
  );
}

async function authorizePatientOperation(
  permission: string,
) {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    permission,
  );

  requireHospitalBusiness(
    context.business.type as BusinessType,
  );

  return context;
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    await authorizePatientOperation("hospital.patients.read");

    const { patientId } = await params;

    if (!patientId?.trim()) {
      return NextResponse.json(
        { error: "Patient ID is required." },
        { status: 400 },
      );
    }

    const patient = await getHospitalPatient(patientId);

    return NextResponse.json({ patient });
  } catch (error) {
    return errorResponse(error, "Hospital patient lookup");
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    await authorizePatientOperation("hospital.patients.manage");

    const { patientId } = await params;

    if (!patientId?.trim()) {
      return NextResponse.json(
        { error: "Patient ID is required." },
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
        { error: "A valid patient update object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    const allowedFields = [
      "firstName",
      "middleName",
      "lastName",
      "dateOfBirth",
      "sex",
      "phone",
      "email",
      "address",
      "emergencyContactName",
      "emergencyContactRelationship",
      "emergencyContactPhone",
    ] as const;

    const allowedFieldSet = new Set<string>(allowedFields);

    for (const field of Object.keys(input)) {
      if (!allowedFieldSet.has(field)) {
        return NextResponse.json(
          { error: `Unsupported patient field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (Object.keys(input).length === 0) {
      return NextResponse.json(
        { error: "At least one field must be provided." },
        { status: 400 },
      );
    }

    const optionalStringFields = [
      "middleName",
      "sex",
      "phone",
      "email",
      "address",
      "emergencyContactName",
      "emergencyContactRelationship",
      "emergencyContactPhone",
    ] as const;

    for (const field of optionalStringFields) {
      if (
        input[field] !== undefined &&
        input[field] !== null &&
        typeof input[field] !== "string"
      ) {
        return NextResponse.json(
          { error: `Invalid value for ${field}.` },
          { status: 400 },
        );
      }
    }

    for (const field of ["firstName", "lastName"] as const) {
      if (
        input[field] !== undefined &&
        typeof input[field] !== "string"
      ) {
        return NextResponse.json(
          { error: `Invalid value for ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      input.dateOfBirth !== undefined &&
      input.dateOfBirth !== null &&
      (
        typeof input.dateOfBirth !== "string" ||
        Number.isNaN(Date.parse(input.dateOfBirth))
      )
    ) {
      return NextResponse.json(
        { error: "A valid date of birth is required." },
        { status: 400 },
      );
    }

    const updateInput: UpdateHospitalPatientInput = {};

    for (const field of optionalStringFields) {
      const value = input[field];

      if (value === null || typeof value === "string") {
        updateInput[field] = value;
      }
    }

    if (typeof input.firstName === "string") {
      updateInput.firstName = input.firstName;
    }

    if (typeof input.lastName === "string") {
      updateInput.lastName = input.lastName;
    }

    if (input.dateOfBirth === null) {
      updateInput.dateOfBirth = null;
    } else if (typeof input.dateOfBirth === "string") {
      updateInput.dateOfBirth = new Date(input.dateOfBirth);
    }

    const patient = await updateHospitalPatient(
      patientId,
      updateInput,
    );

    return NextResponse.json({ patient });
  } catch (error) {
    return errorResponse(error, "Hospital patient update");
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    await authorizePatientOperation("hospital.patients.manage");

    const { patientId } = await params;

    if (!patientId?.trim()) {
      return NextResponse.json(
        { error: "Patient ID is required." },
        { status: 400 },
      );
    }

    await deactivateHospitalPatient(patientId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Hospital patient deactivation");
  }
}