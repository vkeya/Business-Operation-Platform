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
  HospitalImagingError,
  createHospitalImagingOrder,
  listHospitalImagingOrders,
} from "@/lib/hospital/hospitalImagingService";
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
    error instanceof HospitalImagingError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`${operation} failed:`, error);

  return NextResponse.json(
    { error: "Unable to complete the hospital imaging operation." },
    { status: 500 },
  );
}

async function authorize(permission: string) {
  const context = await getCurrentBusinessContext();

  await requireBusinessOperationAccess(
    context.user.id,
    context.business.id,
    permission,
  );

  requireHospitalBusiness(context.business.type as BusinessType);
}

const orderStatuses = [
  "ORDERED",
  "IN_PROGRESS",
  "PARTIALLY_COMPLETED",
  "COMPLETED",
  "CANCELLED",
] as const;

const priorities = ["ROUTINE", "URGENT", "STAT"] as const;

export async function GET(request: Request) {
  try {
    await authorize("hospital.imaging.read");

    const url = new URL(request.url);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const take = Number(url.searchParams.get("take") ?? 25);
    const patientId = url.searchParams.get("patientId")?.trim();
    const encounterId = url.searchParams.get("encounterId")?.trim();
    const status = url.searchParams.get("status");

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

    if (
      status &&
      !orderStatuses.includes(status as (typeof orderStatuses)[number])
    ) {
      return NextResponse.json(
        { error: "Invalid imaging order status." },
        { status: 400 },
      );
    }

    const orders = await listHospitalImagingOrders({
      skip,
      take,
      ...(patientId ? { patientId } : {}),
      ...(encounterId ? { encounterId } : {}),
      ...(status
        ? { status: status as (typeof orderStatuses)[number] }
        : {}),
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return errorResponse(error, "Hospital imaging order lookup");
  }
}

export async function POST(request: Request) {
  try {
    await authorize("hospital.imaging.manage");

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON imaging order object is required." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid imaging order object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = new Set([
      "patientId",
      "encounterId",
      "priority",
      "clinicalIndication",
      "notes",
      "items",
    ]);

    for (const field of Object.keys(input)) {
      if (!allowedFields.has(field)) {
        return NextResponse.json(
          { error: `Unsupported imaging order field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (
      typeof input.patientId !== "string" ||
      !input.patientId.trim() ||
      typeof input.encounterId !== "string" ||
      !input.encounterId.trim() ||
      !Array.isArray(input.items)
    ) {
      return NextResponse.json(
        {
          error:
            "Valid patientId, encounterId, and items are required.",
        },
        { status: 400 },
      );
    }

    if (
      input.priority !== undefined &&
      (typeof input.priority !== "string" ||
        !priorities.includes(input.priority as (typeof priorities)[number]))
    ) {
      return NextResponse.json(
        { error: "Priority must be ROUTINE, URGENT, or STAT." },
        { status: 400 },
      );
    }

    for (const field of ["clinicalIndication", "notes"] as const) {
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

    if (input.items.length < 1 || input.items.length > 100) {
      return NextResponse.json(
        {
          error:
            "An imaging order must contain between 1 and 100 studies.",
        },
        { status: 400 },
      );
    }

    const items: {
      studyName: string;
      modality: string;
      bodySite: string;
      laterality?: string | null;
      instructions?: string | null;
    }[] = [];

    for (const item of input.items) {
      if (
        typeof item !== "object" ||
        item === null ||
        Array.isArray(item)
      ) {
        return NextResponse.json(
          { error: "Each imaging study must be an object." },
          { status: 400 },
        );
      }

      const record = item as Record<string, unknown>;
      const allowedItemFields = new Set([
        "studyName",
        "modality",
        "bodySite",
        "laterality",
        "instructions",
      ]);

      for (const field of Object.keys(record)) {
        if (!allowedItemFields.has(field)) {
          return NextResponse.json(
            { error: `Unsupported imaging study field: ${field}.` },
            { status: 400 },
          );
        }
      }

      if (
        typeof record.studyName !== "string" ||
        !record.studyName.trim() ||
        typeof record.modality !== "string" ||
        !record.modality.trim() ||
        typeof record.bodySite !== "string" ||
        !record.bodySite.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "Each imaging study requires studyName, modality, and bodySite.",
          },
          { status: 400 },
        );
      }

      for (const field of ["laterality", "instructions"] as const) {
        const value = record[field];

        if (
          value !== undefined &&
          value !== null &&
          typeof value !== "string"
        ) {
          return NextResponse.json(
            { error: `Invalid imaging study value for ${field}.` },
            { status: 400 },
          );
        }
      }

      items.push({
        studyName: record.studyName.trim(),
        modality: record.modality.trim(),
        bodySite: record.bodySite.trim(),
        ...(typeof record.laterality === "string"
          ? { laterality: record.laterality }
          : {}),
        ...(record.laterality === null ? { laterality: null } : {}),
        ...(typeof record.instructions === "string"
          ? { instructions: record.instructions }
          : {}),
        ...(record.instructions === null ? { instructions: null } : {}),
      });
    }

    const order = await createHospitalImagingOrder({
      patientId: input.patientId.trim(),
      encounterId: input.encounterId.trim(),
      items,
      ...(typeof input.priority === "string"
        ? { priority: input.priority as (typeof priorities)[number] }
        : {}),
      ...(typeof input.clinicalIndication === "string"
        ? { clinicalIndication: input.clinicalIndication }
        : {}),
      ...(input.clinicalIndication === null
        ? { clinicalIndication: null }
        : {}),
      ...(typeof input.notes === "string" ? { notes: input.notes } : {}),
      ...(input.notes === null ? { notes: null } : {}),
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Hospital imaging order creation");
  }
}
