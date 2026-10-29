
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
  listHospitalPatients,
  createHospitalPatient,
} from "@/lib/hospital/hospitalPatientService";
import type { BusinessType } from "@/types";

export async function GET(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.patients.read",
    );

    requireHospitalBusiness(
      context.business.type as BusinessType,
    );

    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? "";
    const skipValue = Number(url.searchParams.get("skip") ?? 0);
    const takeValue = Number(url.searchParams.get("take") ?? 25);

    if (
      !Number.isInteger(skipValue) ||
      skipValue < 0 ||
      !Number.isInteger(takeValue) ||
      takeValue < 1 ||
      takeValue > 100
    ) {
      return NextResponse.json(
        { error: "Invalid pagination parameters." },
        { status: 400 },
      );
    }

    const patients = await listHospitalPatients({
      search,
      skip: skipValue,
      take: takeValue,
    });

    return NextResponse.json({ patients });
  } catch (error) {
    if (
      error instanceof BusinessPermissionError ||
      error instanceof SubscriptionEntitlementError ||
      error instanceof HospitalAccessError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Hospital patient lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to load hospital patients." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.patients.manage",
    );

    requireHospitalBusiness(
      context.business.type as BusinessType,
    );

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid patient object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    if (
      typeof input.firstName !== "string" ||
      typeof input.lastName !== "string"
    ) {
      return NextResponse.json(
        { error: "First name and last name are required." },
        { status: 400 },
      );
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

    const patient = await createHospitalPatient({
      firstName: input.firstName,
      lastName: input.lastName,
      ...(typeof input.middleName === "string" || input.middleName === null
        ? { middleName: input.middleName }
        : {}),
      ...(input.dateOfBirth === undefined || input.dateOfBirth === null
        ? { dateOfBirth: input.dateOfBirth as null | undefined }
        : { dateOfBirth: new Date(input.dateOfBirth as string) }),
      ...(typeof input.sex === "string" || input.sex === null
        ? { sex: input.sex }
        : {}),
      ...(typeof input.phone === "string" || input.phone === null
        ? { phone: input.phone }
        : {}),
      ...(typeof input.email === "string" || input.email === null
        ? { email: input.email }
        : {}),
      ...(typeof input.address === "string" || input.address === null
        ? { address: input.address }
        : {}),
      ...(typeof input.emergencyContactName === "string" || input.emergencyContactName === null
        ? { emergencyContactName: input.emergencyContactName }
        : {}),
      ...(typeof input.emergencyContactRelationship === "string" || input.emergencyContactRelationship === null
        ? { emergencyContactRelationship: input.emergencyContactRelationship }
        : {}),
      ...(typeof input.emergencyContactPhone === "string" || input.emergencyContactPhone === null
        ? { emergencyContactPhone: input.emergencyContactPhone }
        : {}),
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
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

    console.error("Hospital patient registration failed:", error);

    return NextResponse.json(
      { error: "Unable to register hospital patient." },
      { status: 500 },
    );
  }
}
