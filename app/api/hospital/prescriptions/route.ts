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
  createHospitalPrescription,
  listHospitalPrescriptions,
} from "@/lib/hospital/hospitalPrescriptionService";
import type { BusinessType } from "@/types";

function errorResponse(error: unknown, operation: string) {
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

  console.error(`${operation} failed:`, error);

  return NextResponse.json(
    { error: "Unable to complete the hospital prescription operation." },
    { status: 500 },
  );
}

async function authorizePrescriptionOperation(permission: string) {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    permission,
  );

  requireHospitalBusiness(context.business.type as BusinessType);

  return context;
}

export async function GET(request: Request) {
  try {
    await authorizePrescriptionOperation("hospital.prescriptions.read");

    const url = new URL(request.url);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const take = Number(url.searchParams.get("take") ?? 25);
    const patientId = url.searchParams.get("patientId")?.trim();
    const encounterId = url.searchParams.get("encounterId")?.trim();

    if (
      !Number.isInteger(skip) ||
      skip < 0 ||
      !Number.isInteger(take) ||
      take < 1 ||
      take > 100
    ) {
      return NextResponse.json(
        { error: "Invalid pagination parameters." },
        { status: 400 },
      );
    }

    if (!patientId && !encounterId) {
      return NextResponse.json(
        { error: "A patientId or encounterId filter is required." },
        { status: 400 },
      );
    }

    const prescriptions = await listHospitalPrescriptions({
      skip,
      take,
      ...(patientId ? { patientId } : {}),
      ...(encounterId ? { encounterId } : {}),
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    return errorResponse(error, "Hospital prescription lookup");
  }
}

export async function POST(request: Request) {
  try {
    await authorizePrescriptionOperation("hospital.prescriptions.manage");

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON prescription object is required." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid prescription object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "patientId",
      "encounterId",
      "prescriptionDate",
      "expiryDate",
      "prescriberName",
      "prescriberLicense",
      "diagnosis",
      "notes",
      "items",
    ]);

    for (const field of Object.keys(input)) {
      if (!allowedFields.has(field)) {
        return NextResponse.json(
          { error: `Unsupported prescription field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof input.patientId !== "string" ||
      !input.patientId.trim() ||
      typeof input.encounterId !== "string" ||
      !input.encounterId.trim() ||
      typeof input.prescriberName !== "string" ||
      !input.prescriberName.trim() ||
      !Array.isArray(input.items)
    ) {
      return NextResponse.json(
        {
          error:
            "Valid patientId, encounterId, prescriberName, and items are required.",
        },
        { status: 400 },
      );
    }

    for (const field of [
      "prescriptionDate",
      "expiryDate",
      "prescriberLicense",
      "diagnosis",
      "notes",
    ] as const) {
      const value = input[field];

      if (
        value !== undefined &&
        value !== null &&
        typeof value !== "string"
      ) {
        return NextResponse.json(
          { error: `Invalid value for ${field}.` },
          { status: 400 },
        );
      }
    }

    const items = [];

    for (const item of input.items) {
      if (
        typeof item !== "object" ||
        item === null ||
        Array.isArray(item)
      ) {
        return NextResponse.json(
          { error: "Each prescription item must be an object." },
          { status: 400 },
        );
      }

      const record = item as Record<string, unknown>;
      const allowedItemFields = new Set([
        "productId",
        "quantityPrescribed",
        "dosageInstructions",
        "duration",
        "notes",
      ]);

      for (const field of Object.keys(record)) {
        if (!allowedItemFields.has(field)) {
          return NextResponse.json(
            { error: `Unsupported prescription item field: ${field}.` },
            { status: 400 },
          );
        }
      }

      if (
        typeof record.productId !== "string" ||
        !record.productId.trim() ||
        !(
          typeof record.quantityPrescribed === "number" ||
          typeof record.quantityPrescribed === "string"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Each item requires a valid productId and quantityPrescribed.",
          },
          { status: 400 },
        );
      }

      for (const field of [
        "dosageInstructions",
        "duration",
        "notes",
      ] as const) {
        const value = record[field];

        if (
          value !== undefined &&
          value !== null &&
          typeof value !== "string"
        ) {
          return NextResponse.json(
            { error: `Invalid prescription item value for ${field}.` },
            { status: 400 },
          );
        }
      }

      items.push({
        productId: record.productId.trim(),
        quantityPrescribed: record.quantityPrescribed,
        ...(typeof record.dosageInstructions === "string"
          ? { dosageInstructions: record.dosageInstructions }
          : {}),
        ...(record.dosageInstructions === null
          ? { dosageInstructions: null }
          : {}),
        ...(typeof record.duration === "string"
          ? { duration: record.duration }
          : {}),
        ...(record.duration === null ? { duration: null } : {}),
        ...(typeof record.notes === "string"
          ? { notes: record.notes }
          : {}),
        ...(record.notes === null ? { notes: null } : {}),
      });
    }

    const prescription = await createHospitalPrescription({
      patientId: input.patientId.trim(),
      encounterId: input.encounterId.trim(),
      prescriberName: input.prescriberName.trim(),
      items,
      ...(typeof input.prescriptionDate === "string"
        ? { prescriptionDate: input.prescriptionDate }
        : {}),
      ...(typeof input.expiryDate === "string"
        ? { expiryDate: input.expiryDate }
        : {}),
      ...(typeof input.prescriberLicense === "string"
        ? { prescriberLicense: input.prescriberLicense }
        : {}),
      ...(input.prescriberLicense === null
        ? { prescriberLicense: null }
        : {}),
      ...(typeof input.diagnosis === "string"
        ? { diagnosis: input.diagnosis }
        : {}),
      ...(input.diagnosis === null ? { diagnosis: null } : {}),
      ...(typeof input.notes === "string" ? { notes: input.notes } : {}),
      ...(input.notes === null ? { notes: null } : {}),
    });

    return NextResponse.json({ prescription }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Hospital prescription creation");
  }
}
