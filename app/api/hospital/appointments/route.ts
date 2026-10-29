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
  HospitalAppointmentError,
  createHospitalAppointment,
  listHospitalAppointments,
} from "@/lib/hospital/hospitalAppointmentService";
import type { BusinessType } from "@/types";

function errorResponse(error: unknown, operation: string) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalAppointmentError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`${operation} failed:`, error);

  return NextResponse.json(
    { error: "Unable to complete the hospital appointment operation." },
    { status: 500 },
  );
}

async function authorizeAppointmentOperation(permission: string) {
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
    await authorizeAppointmentOperation("hospital.appointments.read");

    const url = new URL(request.url);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const take = Number(url.searchParams.get("take") ?? 25);
    const patientId = url.searchParams.get("patientId")?.trim();
    const clinicianId = url.searchParams.get("clinicianId")?.trim();
    const followUpFromEncounterId =
      url.searchParams.get("followUpFromEncounterId")?.trim();
    const status = url.searchParams.get("status");
    const fromValue = url.searchParams.get("from");
    const toValue = url.searchParams.get("to");

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

    const validStatuses = new Set([
      "SCHEDULED",
      "CONFIRMED",
      "CHECKED_IN",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ]);

    if (status && !validStatuses.has(status)) {
      return NextResponse.json(
        { error: "Invalid appointment status." },
        { status: 400 },
      );
    }

    const from = fromValue ? new Date(fromValue) : undefined;
    const to = toValue ? new Date(toValue) : undefined;

    if (
      (from && Number.isNaN(from.getTime())) ||
      (to && Number.isNaN(to.getTime()))
    ) {
      return NextResponse.json(
        { error: "Invalid appointment date filter." },
        { status: 400 },
      );
    }

    const appointments = await listHospitalAppointments({
      skip,
      take,
      ...(patientId ? { patientId } : {}),
      ...(clinicianId ? { clinicianId } : {}),
      ...(followUpFromEncounterId ? { followUpFromEncounterId } : {}),
      ...(status
        ? {
            status: status as
              | "SCHEDULED"
              | "CONFIRMED"
              | "CHECKED_IN"
              | "COMPLETED"
              | "CANCELLED"
              | "NO_SHOW",
          }
        : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    return errorResponse(error, "Hospital appointment lookup");
  }
}

export async function POST(request: Request) {
  try {
    await authorizeAppointmentOperation("hospital.appointments.manage");

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "A valid appointment object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    if (
      typeof input.patientId !== "string" ||
      typeof input.scheduledStart !== "string" ||
      typeof input.scheduledEnd !== "string" ||
      typeof input.reason !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Patient, start time, end time, and appointment reason are required.",
        },
        { status: 400 },
      );
    }

    if (
      (input.clinicianId !== undefined &&
        input.clinicianId !== null &&
        typeof input.clinicianId !== "string") ||
      (input.notes !== undefined &&
        input.notes !== null &&
        typeof input.notes !== "string") ||
      (input.followUpFromEncounterId !== undefined &&
        input.followUpFromEncounterId !== null &&
        typeof input.followUpFromEncounterId !== "string")
    ) {
      return NextResponse.json(
        { error: "Invalid clinician, notes, or follow-up encounter value." },
        { status: 400 },
      );
    }

    const scheduledStart = new Date(input.scheduledStart);
    const scheduledEnd = new Date(input.scheduledEnd);

    if (
      Number.isNaN(scheduledStart.getTime()) ||
      Number.isNaN(scheduledEnd.getTime())
    ) {
      return NextResponse.json(
        { error: "Valid appointment start and end times are required." },
        { status: 400 },
      );
    }

    const appointment = await createHospitalAppointment({
      patientId: input.patientId,
      scheduledStart,
      scheduledEnd,
      reason: input.reason,
      ...(typeof input.clinicianId === "string" ||
      input.clinicianId === null
        ? { clinicianId: input.clinicianId }
        : {}),
      ...(typeof input.notes === "string" || input.notes === null
        ? { notes: input.notes }
        : {}),
      ...(typeof input.followUpFromEncounterId === "string" ||
      input.followUpFromEncounterId === null
        ? { followUpFromEncounterId: input.followUpFromEncounterId }
        : {}),
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Hospital appointment creation");
  }
}
