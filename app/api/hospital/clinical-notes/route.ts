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
  HospitalClinicalNoteError,
  HOSPITAL_CLINICAL_NOTE_TYPES,
  createHospitalClinicalNote,
  listHospitalClinicalNotes,
} from "@/lib/hospital/hospitalClinicalNoteService";
import type { HospitalClinicalNoteType } from "@/lib/hospital/hospitalClinicalNoteService";
import type { BusinessType } from "@/types";

function errorResponse(error: unknown, operation: string) {
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

  console.error(`${operation} failed:`, error);

  return NextResponse.json(
    { error: "Unable to complete the hospital clinical note operation." },
    { status: 500 },
  );
}

async function authorizeClinicalNoteOperation(permission: string) {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    permission,
  );

  requireHospitalBusiness(context.business.type as BusinessType);

  return context;
}

const validNoteTypes = new Set<string>(
  HOSPITAL_CLINICAL_NOTE_TYPES,
);

export async function GET(request: Request) {
  try {
    await authorizeClinicalNoteOperation("hospital.clinical_notes.read");

    const url = new URL(request.url);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const take = Number(url.searchParams.get("take") ?? 25);
    const encounterId = url.searchParams.get("encounterId")?.trim();
    const patientId = url.searchParams.get("patientId")?.trim();

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

    if (!encounterId && !patientId) {
      return NextResponse.json(
        { error: "Provide encounterId or patientId to retrieve clinical notes." },
        { status: 400 },
      );
    }

    const notes = await listHospitalClinicalNotes({
      skip,
      take,
      ...(encounterId ? { encounterId } : {}),
      ...(patientId ? { patientId } : {}),
    });

    return NextResponse.json({ notes });
  } catch (error) {
    return errorResponse(error, "Hospital clinical note lookup");
  }
}

export async function POST(request: Request) {
  try {
    await authorizeClinicalNoteOperation("hospital.clinical_notes.manage");

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid clinical note object is required." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid clinical note object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "patientId",
      "encounterId",
      "noteType",
      "content",
    ]);

    for (const field of Object.keys(input)) {
      if (!allowedFields.has(field)) {
        return NextResponse.json(
          { error: `Unsupported clinical note field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof input.patientId !== "string" ||
      !input.patientId.trim() ||
      typeof input.encounterId !== "string" ||
      !input.encounterId.trim() ||
      typeof input.noteType !== "string" ||
      !validNoteTypes.has(input.noteType) ||
      typeof input.content !== "string" ||
      !input.content.trim() ||
      input.content.length > 20000
    ) {
      return NextResponse.json(
        {
          error:
            "Valid patientId, encounterId, noteType, and non-empty content of at most 20,000 characters are required.",
        },
        { status: 400 },
      );
    }

    const note = await createHospitalClinicalNote({
      patientId: input.patientId.trim(),
      encounterId: input.encounterId.trim(),
      noteType: input.noteType as HospitalClinicalNoteType,
      content: input.content,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Hospital clinical note creation");
  }
}
