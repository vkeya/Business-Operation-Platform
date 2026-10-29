import { prisma } from "@/lib/database/prisma";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";
import type {
  HospitalEncounterStatus,
  HospitalEncounterType,
} from "@/generated/prisma/client";

export class HospitalEncounterError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "HospitalEncounterError";
  }
}

export interface CreateHospitalEncounterInput {
  patientId: string;
  appointmentId?: string | null;
  type: HospitalEncounterType;
  clinicianId?: string | null;
}

export interface ListHospitalEncountersOptions {
  patientId?: string;
  appointmentId?: string;
  clinicianId?: string;
  status?: HospitalEncounterStatus;
  skip?: number;
  take?: number;
}

export async function getHospitalEncounterContext() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

const VALID_ENCOUNTER_TYPES = new Set<HospitalEncounterType>([
  "OUTPATIENT",
  "EMERGENCY",
  "FOLLOW_UP",
  "INPATIENT",
]);

const ALLOWED_ENCOUNTER_TRANSITIONS: Record<
  HospitalEncounterStatus,
  readonly HospitalEncounterStatus[]
> = {
  OPEN: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function listHospitalEncounters(
  options: ListHospitalEncountersOptions = {},
) {
  const { businessId } = await getHospitalEncounterContext();

  const skip = options.skip ?? 0;
  const take = options.take ?? 25;

  if (!Number.isInteger(skip) || skip < 0) {
    throw new HospitalEncounterError("Invalid pagination offset.");
  }

  if (!Number.isInteger(take) || take < 1 || take > 100) {
    throw new HospitalEncounterError(
      "Page size must be between 1 and 100.",
    );
  }

  return prisma.hospitalEncounter.findMany({
    where: {
      businessId,
      ...(options.patientId ? { patientId: options.patientId } : {}),
      ...(options.appointmentId
        ? { appointmentId: options.appointmentId }
        : {}),
      ...(options.clinicianId ? { clinicianId: options.clinicianId } : {}),
      ...(options.status ? { status: options.status } : {}),
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
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

export async function getHospitalEncounter(encounterId: string) {
  const { businessId, userId } = await getHospitalEncounterContext();
  const id = encounterId?.trim();

  if (!id) {
    throw new HospitalEncounterError("Encounter ID is required.");
  }

  const encounter = await prisma.hospitalEncounter.findFirst({
    where: { id, businessId },
    include: {
      patient: true,
      appointment: true,
    },
  });

  if (!encounter) {
    throw new HospitalEncounterError("Encounter not found.", 404);
  }

  await recordAuditEvent({
    businessId,
    actorId: userId,
    action: AUDIT_ACTIONS.HOSPITAL_ENCOUNTER_VIEWED,
    category: "HOSPITAL",
    entityType: "HospitalEncounter",
    entityId: encounter.id,
    metadata: {
      operation: "encounter_record_view",
      encounterNumber: encounter.encounterNumber,
    },
  });

  return encounter;
}

export async function createHospitalEncounter(
  input: CreateHospitalEncounterInput,
) {
  const { businessId, userId } = await getHospitalEncounterContext();

  const patientId = input.patientId?.trim();
  const appointmentId = input.appointmentId?.trim() || null;
  const clinicianId = input.clinicianId?.trim() || null;

  if (!patientId) {
    throw new HospitalEncounterError("A patient is required.");
  }

  if (!VALID_ENCOUNTER_TYPES.has(input.type)) {
    throw new HospitalEncounterError("Invalid encounter type.");
  }

  return prisma.$transaction(
    async (tx) => {
      const patient = await tx.patient.findFirst({
        where: {
          id: patientId,
          businessId,
          isActive: true,
        },
        select: { id: true },
      });

      if (!patient) {
        throw new HospitalEncounterError(
          "Active patient not found in this hospital.",
          404,
        );
      }

      if (appointmentId) {
        const appointment = await tx.hospitalAppointment.findFirst({
          where: {
            id: appointmentId,
            businessId,
            patientId,
          },
          select: { id: true },
        });

        if (!appointment) {
          throw new HospitalEncounterError(
            "Appointment not found for this patient in this hospital.",
            404,
          );
        }
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
          throw new HospitalEncounterError(
            "The selected clinician must have active membership in this hospital.",
            404,
          );
        }
      }

      const encounterNumber = await generateBusinessReference({
        businessId,
        referenceType: "HOSPITAL_ENCOUNTER",
        prefix: "ENC",
        padLength: 6,
        client: tx,
      });

      const encounter = await tx.hospitalEncounter.create({
        data: {
          businessId,
          patientId,
          appointmentId,
          encounterNumber,
          type: input.type,
          clinicianId,
          createdBy: userId,
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
      });

      await recordAuditEvent(
        {
          businessId,
          actorId: userId,
          action: AUDIT_ACTIONS.HOSPITAL_ENCOUNTER_CREATED,
          category: "HOSPITAL",
          entityType: "HospitalEncounter",
          entityId: encounter.id,
          afterData: encounter,
          metadata: {
            encounterNumber: encounter.encounterNumber,
            patientId,
            appointmentId,
            clinicianId,
            type: input.type,
          },
        },
        tx,
      );

      return encounter;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function updateHospitalEncounterStatus(
  encounterId: string,
  nextStatus: HospitalEncounterStatus,
) {
  const { businessId, userId } = await getHospitalEncounterContext();
  const id = encounterId?.trim();

  if (!id) {
    throw new HospitalEncounterError("Encounter ID is required.");
  }

  if (
    !["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(nextStatus)
  ) {
    throw new HospitalEncounterError("Invalid encounter status.");
  }

  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.hospitalEncounter.findFirst({
        where: { id, businessId },
      });

      if (!existing) {
        throw new HospitalEncounterError("Encounter not found.", 404);
      }

      if (
        !ALLOWED_ENCOUNTER_TRANSITIONS[existing.status].includes(nextStatus)
      ) {
        throw new HospitalEncounterError(
          `Cannot transition an encounter from ${existing.status} to ${nextStatus}.`,
          409,
        );
      }

      const encounter = await tx.hospitalEncounter.update({
        where: { id: existing.id },
        data: {
          status: nextStatus,
          ...(nextStatus === "COMPLETED"
            ? { completedAt: new Date() }
            : {}),
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
          action: AUDIT_ACTIONS.HOSPITAL_ENCOUNTER_STATUS_CHANGED,
          category: "HOSPITAL",
          entityType: "HospitalEncounter",
          entityId: encounter.id,
          beforeData: { status: existing.status },
          afterData: { status: encounter.status },
          metadata: {
            encounterNumber: encounter.encounterNumber,
            previousStatus: existing.status,
            nextStatus,
          },
        },
        tx,
      );

      return encounter;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}
