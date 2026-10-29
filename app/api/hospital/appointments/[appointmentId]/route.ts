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
  getHospitalAppointment,
  updateHospitalAppointment,
} from "@/lib/hospital/hospitalAppointmentService";
import type { UpdateHospitalAppointmentInput } from "@/lib/hospital/hospitalAppointmentService";
import type { BusinessType } from "@/types";

type RouteContext = {
  params: Promise<{ appointmentId: string }>;
};

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

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    await authorizeAppointmentOperation("hospital.appointments.read");

    const { appointmentId } = await params;

    if (!appointmentId?.trim()) {
      return NextResponse.json(
        { error: "Appointment ID is required." },
        { status: 400 },
      );
    }

    const appointment = await getHospitalAppointment(appointmentId);

    return NextResponse.json({ appointment });
  } catch (error) {
    return errorResponse(error, "Hospital appointment lookup");
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    await authorizeAppointmentOperation("hospital.appointments.manage");

    const { appointmentId } = await params;

    if (!appointmentId?.trim()) {
      return NextResponse.json(
        { error: "Appointment ID is required." },
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
        { error: "A valid appointment update object is required." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const allowedFields = [
      "patientId",
      "clinicianId",
      "scheduledStart",
      "scheduledEnd",
      "reason",
      "notes",
      "status",
    ] as const;

    const allowedFieldSet = new Set<string>(allowedFields);

    for (const field of Object.keys(input)) {
      if (!allowedFieldSet.has(field)) {
        return NextResponse.json(
          { error: `Unsupported appointment field: ${field}.` },
          { status: 400 },
        );
      }
    }

    if (Object.keys(input).length === 0) {
      return NextResponse.json(
        { error: "At least one appointment field must be provided." },
        { status: 400 },
      );
    }

    for (const field of ["patientId", "reason"] as const) {
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

    for (const field of ["clinicianId", "notes"] as const) {
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

    for (const field of ["scheduledStart", "scheduledEnd"] as const) {
      if (
        input[field] !== undefined &&
        (typeof input[field] !== "string" ||
          Number.isNaN(Date.parse(input[field])))
      ) {
        return NextResponse.json(
          { error: `A valid ${field} date is required.` },
          { status: 400 },
        );
      }
    }

    const validStatuses = new Set([
      "SCHEDULED",
      "CONFIRMED",
      "CHECKED_IN",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ]);

    if (
      input.status !== undefined &&
      (typeof input.status !== "string" ||
        !validStatuses.has(input.status))
    ) {
      return NextResponse.json(
        { error: "Invalid appointment status." },
        { status: 400 },
      );
    }

    const updateInput: UpdateHospitalAppointmentInput = {
      ...(typeof input.patientId === "string"
        ? { patientId: input.patientId }
        : {}),
      ...(typeof input.clinicianId === "string" ||
      input.clinicianId === null
        ? { clinicianId: input.clinicianId }
        : {}),
      ...(typeof input.scheduledStart === "string"
        ? { scheduledStart: new Date(input.scheduledStart) }
        : {}),
      ...(typeof input.scheduledEnd === "string"
        ? { scheduledEnd: new Date(input.scheduledEnd) }
        : {}),
      ...(typeof input.reason === "string"
        ? { reason: input.reason }
        : {}),
      ...(typeof input.notes === "string" || input.notes === null
        ? { notes: input.notes }
        : {}),
      ...(typeof input.status === "string"
        ? {
            status: input.status as UpdateHospitalAppointmentInput["status"],
          }
        : {}),
    };

    const appointment = await updateHospitalAppointment(
      appointmentId,
      updateInput,
    );

    return NextResponse.json({ appointment });
  } catch (error) {
    return errorResponse(error, "Hospital appointment update");
  }
}
