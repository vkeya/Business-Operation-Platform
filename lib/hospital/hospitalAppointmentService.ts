import { prisma } from "@/lib/database/prisma";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";

export class HospitalAppointmentError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "HospitalAppointmentError";
  }
}

export interface CreateHospitalAppointmentInput {
  patientId: string;
  clinicianId?: string | null;
  followUpFromEncounterId?: string | null;
  scheduledStart: Date;
  scheduledEnd: Date;
  reason: string;
  notes?: string | null;
}

export interface ListHospitalAppointmentsOptions {
  patientId?: string;
  clinicianId?: string;
  followUpFromEncounterId?: string;
  status?: "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  from?: Date;
  to?: Date;
  skip?: number;
  take?: number;
}

async function getHospitalContext() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

function validateSchedule(
  scheduledStart: Date,
  scheduledEnd: Date,
) {
  if (
    !(scheduledStart instanceof Date) ||
    Number.isNaN(scheduledStart.getTime())
  ) {
    throw new HospitalAppointmentError(
      "A valid appointment start date is required.",
    );
  }

  if (
    !(scheduledEnd instanceof Date) ||
    Number.isNaN(scheduledEnd.getTime())
  ) {
    throw new HospitalAppointmentError(
      "A valid appointment end date is required.",
    );
  }

  if (scheduledEnd <= scheduledStart) {
    throw new HospitalAppointmentError(
      "Appointment end time must be after its start time.",
    );
  }
}

async function validateClinician(
  businessId: string,
  clinicianId: string,
  client: typeof prisma,
) {
  const membership = await client.businessMembership.findFirst({
    where: {
      businessId,
      userId: clinicianId,
      isActive: true,
      user: {
        isActive: true,
      },
    },
    select: {
      id: true,
    },
  });

  if (!membership) {
    throw new HospitalAppointmentError(
      "The selected clinician must be an active user with active membership in this hospital.",
      404,
    );
  }
}

export async function listHospitalAppointments(
  options: ListHospitalAppointmentsOptions = {},
) {
  const { businessId } = await getHospitalContext();

  if (options.from && Number.isNaN(options.from.getTime())) {
    throw new HospitalAppointmentError("Invalid appointment start filter.");
  }

  if (options.to && Number.isNaN(options.to.getTime())) {
    throw new HospitalAppointmentError("Invalid appointment end filter.");
  }

  if (options.from && options.to && options.to < options.from) {
    throw new HospitalAppointmentError(
      "The end filter must be after the start filter.",
    );
  }

  const skip = Math.max(0, Math.floor(options.skip ?? 0));
  const take = Math.min(100, Math.max(1, Math.floor(options.take ?? 25)));

  return prisma.hospitalAppointment.findMany({
    where: {
      businessId,
      ...(options.patientId
        ? { patientId: options.patientId }
        : {}),
      ...(options.clinicianId
        ? { clinicianId: options.clinicianId }
        : {}),
      ...(options.followUpFromEncounterId
        ? { followUpFromEncounterId: options.followUpFromEncounterId }
        : {}),
      ...(options.status ? { status: options.status } : {}),
      ...(options.from || options.to
        ? {
            scheduledStart: {
              ...(options.from ? { gte: options.from } : {}),
              ...(options.to ? { lte: options.to } : {}),
            },
          }
        : {}),
    },
    include: {
      patient: {
        select: {
          id: true,
          patientNumber: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
    orderBy: {
      scheduledStart: "asc",
    },
    skip,
    take,
  });
}

export async function getHospitalAppointment(
  appointmentId: string,
) {
  const { businessId, userId } = await getHospitalContext();

  const appointment = await prisma.hospitalAppointment.findFirst({
    where: {
      id: appointmentId,
      businessId,
    },
    include: {
      patient: true,
    },
  });

  if (!appointment) {
    throw new HospitalAppointmentError("Appointment not found.", 404);
  }

  await recordAuditEvent({
    businessId,
    actorId: userId,
    action: AUDIT_ACTIONS.HOSPITAL_APPOINTMENT_VIEWED,
    category: "HOSPITAL",
    entityType: "HospitalAppointment",
    entityId: appointment.id,
    metadata: {
      operation: "appointment_record_view",
    },
  });

  return appointment;
}

export async function createHospitalAppointment(
  input: CreateHospitalAppointmentInput,
) {
  const { businessId, userId } = await getHospitalContext();

  const patientId = input.patientId?.trim();
  const clinicianId = input.clinicianId?.trim() || null;
  const followUpFromEncounterId =
    input.followUpFromEncounterId?.trim() || null;
  const reason = input.reason?.trim();
  const notes = input.notes?.trim() || null;

  if (!patientId) {
    throw new HospitalAppointmentError("A patient is required.");
  }

  if (!reason) {
    throw new HospitalAppointmentError("An appointment reason is required.");
  }

  validateSchedule(input.scheduledStart, input.scheduledEnd);

  if (clinicianId === userId) {
    // The creator may also be the clinician; membership validation below
    // still applies.
  }

  return prisma.$transaction(async (tx) => {
    const patient = await tx.patient.findFirst({
      where: {
        id: patientId,
        businessId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!patient) {
      throw new HospitalAppointmentError(
        "Active patient not found in this hospital.",
        404,
      );
    }

    if (followUpFromEncounterId) {
      const sourceEncounter = await tx.hospitalEncounter.findFirst({
        where: {
          id: followUpFromEncounterId,
          businessId,
          patientId,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (!sourceEncounter) {
        throw new HospitalAppointmentError(
          "The source encounter was not found for this patient in this hospital.",
          404,
        );
      }

      if (sourceEncounter.status === "CANCELLED") {
        throw new HospitalAppointmentError(
          "A follow-up cannot be scheduled from a cancelled encounter.",
          409,
        );
      }
    }

    if (clinicianId) {
      const membership = await tx.businessMembership.findFirst({
        where: {
          businessId,
          userId: clinicianId,
          isActive: true,
          user: {
            isActive: true,
          },
        },
        select: {
          id: true,
        },
      });

      if (!membership) {
        throw new HospitalAppointmentError(
          "The selected clinician must be an active user with active membership in this hospital.",
          404,
        );
      }

      // Serialize bookings for this clinician so concurrent requests cannot
      // both pass the overlap check. All appointment writers must use this lock.
      await tx.$queryRaw<Array<{ locked: boolean }>>`
        SELECT (
          pg_advisory_xact_lock(
            hashtextextended(${`${businessId}:${clinicianId}`}, 0)
          ) IS NULL
        ) AS locked
      `;

      const conflict = await tx.hospitalAppointment.findFirst({
        where: {
          businessId,
          clinicianId,
          status: {
            notIn: ["CANCELLED", "NO_SHOW"],
          },
          scheduledStart: {
            lt: input.scheduledEnd,
          },
          scheduledEnd: {
            gt: input.scheduledStart,
          },
        },
        select: {
          id: true,
          appointmentNumber: true,
        },
      });

      if (conflict) {
        throw new HospitalAppointmentError(
          `The clinician already has an overlapping appointment (${conflict.appointmentNumber}).`,
          409,
        );
      }
    }

    const appointmentNumber = await generateBusinessReference({
      businessId,
      referenceType: "HOSPITAL_APPOINTMENT",
      prefix: "APT",
      padLength: 6,
      client: tx,
    });

    const appointment = await tx.hospitalAppointment.create({
      data: {
        businessId,
        patientId,
        appointmentNumber,
        clinicianId,
        followUpFromEncounterId,
        scheduledStart: input.scheduledStart,
        scheduledEnd: input.scheduledEnd,
        reason,
        notes,
        createdBy: userId,
      },
      include: {
        patient: {
          select: {
            id: true,
            patientNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await recordAuditEvent(
      {
        businessId,
        actorId: userId,
        action: AUDIT_ACTIONS.HOSPITAL_APPOINTMENT_CREATED,
        category: "HOSPITAL",
        entityType: "HospitalAppointment",
        entityId: appointment.id,
        afterData: appointment,
        metadata: {
          appointmentNumber: appointment.appointmentNumber,
          patientId,
          clinicianId,
        },
      },
      tx,
    );

    return appointment;
  }, {
    maxWait: 10_000,
    timeout: 15_000,
  });
}

export interface UpdateHospitalAppointmentInput {
  patientId?: string;
  clinicianId?: string | null;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  reason?: string;
  notes?: string | null;
  status?:
    | "SCHEDULED"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
}

const ALLOWED_APPOINTMENT_TRANSITIONS: Record<
  "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
  readonly string[]
> = {
  SCHEDULED: ["CONFIRMED", "CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CHECKED_IN: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export async function updateHospitalAppointment(
  appointmentId: string,
  input: UpdateHospitalAppointmentInput,
) {
  const { businessId, userId } = await getHospitalContext();
  const id = appointmentId?.trim();

  if (!id) {
    throw new HospitalAppointmentError("Appointment ID is required.");
  }

  if (Object.keys(input).length === 0) {
    throw new HospitalAppointmentError(
      "At least one appointment field must be provided.",
    );
  }

  if (
    input.patientId !== undefined &&
    (typeof input.patientId !== "string" || !input.patientId.trim())
  ) {
    throw new HospitalAppointmentError("A valid patient ID is required.");
  }

  if (
    input.reason !== undefined &&
    (typeof input.reason !== "string" || !input.reason.trim())
  ) {
    throw new HospitalAppointmentError("Appointment reason cannot be empty.");
  }

  if (
    input.notes !== undefined &&
    input.notes !== null &&
    typeof input.notes !== "string"
  ) {
    throw new HospitalAppointmentError("Invalid appointment notes.");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.hospitalAppointment.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      throw new HospitalAppointmentError("Appointment not found.", 404);
    }

    if (
      existing.status === "COMPLETED" ||
      existing.status === "CANCELLED" ||
      existing.status === "NO_SHOW"
    ) {
      throw new HospitalAppointmentError(
        "Completed, cancelled, or no-show appointments cannot be edited.",
        409,
      );
    }

    const nextStatus = input.status ?? existing.status;

    if (
      input.status &&
      !ALLOWED_APPOINTMENT_TRANSITIONS[existing.status].includes(nextStatus)
    ) {
      throw new HospitalAppointmentError(
        `Cannot change appointment status from ${existing.status} to ${nextStatus}.`,
        409,
      );
    }

    const scheduledStart = input.scheduledStart ?? existing.scheduledStart;
    const scheduledEnd = input.scheduledEnd ?? existing.scheduledEnd;
    const patientId = input.patientId?.trim() ?? existing.patientId;
    const clinicianId =
      input.clinicianId === undefined
        ? existing.clinicianId
        : input.clinicianId?.trim() || null;

    const scheduleChanged =
      scheduledStart.getTime() !== existing.scheduledStart.getTime() ||
      scheduledEnd.getTime() !== existing.scheduledEnd.getTime() ||
      clinicianId !== existing.clinicianId;

    if (
      scheduleChanged &&
      (nextStatus === "CANCELLED" || nextStatus === "NO_SHOW")
    ) {
      throw new HospitalAppointmentError(
        "Cancel or mark an appointment as no-show without changing its schedule.",
      );
    }

    if (
      input.scheduledStart !== undefined ||
      input.scheduledEnd !== undefined
    ) {
      validateSchedule(scheduledStart, scheduledEnd);
    }

    if (patientId !== existing.patientId) {
      const patient = await tx.patient.findFirst({
        where: {
          id: patientId,
          businessId,
          isActive: true,
        },
        select: { id: true },
      });

      if (!patient) {
        throw new HospitalAppointmentError(
          "Active patient not found in this hospital.",
          404,
        );
      }
    }

    const locks = [
      existing.clinicianId,
      clinicianId,
    ]
      .filter((value): value is string => Boolean(value))
      .map((value) => `${businessId}:${value}`);

    for (const lockKey of [...new Set(locks)].sort()) {
      await tx.$queryRaw<Array<{ locked: boolean }>>`
       SELECT (
         pg_advisory_xact_lock(
           hashtextextended(${lockKey}, 0)
         ) IS NULL
       ) AS locked
     `;
    }

    if (clinicianId) {
      const membership = await tx.businessMembership.findFirst({
        where: {
          businessId,
          userId: clinicianId,
          isActive: true,
          user: { isActive: true },
        },
        select: { id: true },
      });

      if (!membership) {
        throw new HospitalAppointmentError(
          "The selected clinician must be an active user with active membership in this hospital.",
          404,
        );
      }

      const conflict = await tx.hospitalAppointment.findFirst({
        where: {
          businessId,
          id: { not: existing.id },
          clinicianId,
          status: { notIn: ["CANCELLED", "NO_SHOW"] },
          scheduledStart: { lt: scheduledEnd },
          scheduledEnd: { gt: scheduledStart },
        },
        select: {
          id: true,
          appointmentNumber: true,
        },
      });

      if (conflict) {
        throw new HospitalAppointmentError(
          `The clinician already has an overlapping appointment (${conflict.appointmentNumber}).`,
          409,
        );
      }
    }

    const updated = await tx.hospitalAppointment.update({
      where: { id: existing.id },
      data: {
        ...(input.patientId !== undefined ? { patientId } : {}),
        ...(input.clinicianId !== undefined ? { clinicianId } : {}),
        ...(input.scheduledStart !== undefined ? { scheduledStart } : {}),
        ...(input.scheduledEnd !== undefined ? { scheduledEnd } : {}),
        ...(input.reason !== undefined ? { reason: input.reason.trim() } : {}),
        ...(input.notes !== undefined
          ? { notes: input.notes?.trim() || null }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
      include: {
        patient: {
          select: {
            id: true,
            patientNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await recordAuditEvent(
      {
        businessId,
        actorId: userId,
        action:
          input.status && input.status !== existing.status
            ? AUDIT_ACTIONS.HOSPITAL_APPOINTMENT_STATUS_CHANGED
            : AUDIT_ACTIONS.HOSPITAL_APPOINTMENT_UPDATED,
        category: "HOSPITAL",
        entityType: "HospitalAppointment",
        entityId: updated.id,
        beforeData: existing,
        afterData: updated,
        metadata: {
          appointmentNumber: updated.appointmentNumber,
        },
      },
      tx,
    );

    return updated;
  }, {
    maxWait: 10_000,
    timeout: 15_000,
  });
}

