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
  createHospitalLabOrder,
  listHospitalLabOrders,
} from "@/lib/hospital/hospitalLabService";
import type { BusinessType } from "@/types";

function errorResponse(error: unknown, operation: string) {
  if (error instanceof Error && error.message === "Authentication is required.") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalLabError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`${operation} failed:`, error);
  return NextResponse.json(
    { error: "Unable to complete the hospital laboratory operation." },
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
  "COLLECTED",
  "IN_PROGRESS",
  "PARTIALLY_RESULTED",
  "COMPLETED",
  "CANCELLED",
] as const;

const priorities = ["ROUTINE", "URGENT", "STAT"] as const;

export async function GET(request: Request) {
  try {
    await authorize("hospital.labs.read");

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

    if (status && !orderStatuses.includes(status as (typeof orderStatuses)[number])) {
      return NextResponse.json(
        { error: "Invalid laboratory order status." },
        { status: 400 },
      );
    }

    const orders = await listHospitalLabOrders({
      skip,
      take,
      ...(patientId ? { patientId } : {}),
      ...(encounterId ? { encounterId } : {}),
      ...(status ? { status: status as (typeof orderStatuses)[number] } : {}),
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return errorResponse(error, "Hospital laboratory order lookup");
  }
}

export async function POST(request: Request) {
  try {
    await authorize("hospital.labs.manage");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON laboratory order object is required." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "A valid laboratory order object is required." },
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
          { error: `Unsupported laboratory order field: ${field}.` },
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
        { error: "Valid patientId, encounterId, and items are required." },
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
      if (value !== undefined && value !== null && typeof value !== "string") {
        return NextResponse.json(
          { error: `Invalid value for ${field}.` },
          { status: 400 },
        );
      }
    }

    if (input.items.length < 1 || input.items.length > 100) {
      return NextResponse.json(
        { error: "A laboratory order must contain between 1 and 100 tests." },
        { status: 400 },
      );
    }

    const items: {
      testCode?: string | null;
      testName: string;
      specimenType: string;
      instructions?: string | null;
    }[] = [];

    for (const item of input.items) {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        return NextResponse.json(
          { error: "Each laboratory test must be an object." },
          { status: 400 },
        );
      }

      const record = item as Record<string, unknown>;
      const allowedItemFields = new Set([
        "testCode",
        "testName",
        "specimenType",
        "instructions",
      ]);

      for (const field of Object.keys(record)) {
        if (!allowedItemFields.has(field)) {
          return NextResponse.json(
            { error: `Unsupported laboratory test field: ${field}.` },
            { status: 400 },
          );
        }
      }

      if (
        typeof record.testName !== "string" ||
        !record.testName.trim() ||
        typeof record.specimenType !== "string" ||
        !record.specimenType.trim()
      ) {
        return NextResponse.json(
          { error: "Each test requires a testName and specimenType." },
          { status: 400 },
        );
      }

      for (const field of ["testCode", "instructions"] as const) {
        const value = record[field];
        if (value !== undefined && value !== null && typeof value !== "string") {
          return NextResponse.json(
            { error: `Invalid laboratory test value for ${field}.` },
            { status: 400 },
          );
        }
      }

      items.push({
        testName: record.testName.trim(),
        specimenType: record.specimenType.trim(),
        ...(typeof record.testCode === "string"
          ? { testCode: record.testCode }
          : {}),
        ...(record.testCode === null ? { testCode: null } : {}),
        ...(typeof record.instructions === "string"
          ? { instructions: record.instructions }
          : {}),
        ...(record.instructions === null ? { instructions: null } : {}),
      });
    }

    const order = await createHospitalLabOrder({
      patientId: input.patientId.trim(),
      encounterId: input.encounterId.trim(),
      items,
      ...(typeof input.priority === "string"
        ? { priority: input.priority as (typeof priorities)[number] }
        : {}),
      ...(typeof input.clinicalIndication === "string"
        ? { clinicalIndication: input.clinicalIndication }
        : {}),
      ...(input.clinicalIndication === null ? { clinicalIndication: null } : {}),
      ...(typeof input.notes === "string" ? { notes: input.notes } : {}),
      ...(input.notes === null ? { notes: null } : {}),
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Hospital laboratory order creation");
  }
}
