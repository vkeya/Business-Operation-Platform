import { prisma } from "@/lib/database/prisma";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";
import type { HospitalAdmissionStatus } from "@/generated/prisma/client";

export class HospitalAdmissionError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "HospitalAdmissionError";
  }
}

export interface CreateHospitalAdmissionInput {
  patientId: string;
  encounterId?: string | null;
  admissionReason?: string | null;
  clinicianId?: string | null;
  admittedAt?: Date;
}

export interface ListHospitalAdmissionsOptions {
  patientId?: string;
  encounterId?: string;
  clinicianId?: string;
  status?: HospitalAdmissionStatus;
  skip?: number;
  take?: number;
}

async function getHospitalAdmissionContext() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

const VALID_ADMISSION_STATUSES = new Set<HospitalAdmissionStatus>([
  "ADMITTED",
  "DISCHARGED",
  "CANCELLED",
]);

const ALLOWED_ADMISSION_TRANSITIONS: Record<
  HospitalAdmissionStatus,
  readonly HospitalAdmissionStatus[]
> = {
  ADMITTED: ["DISCHARGED", "CANCELLED"],
  DISCHARGED: [],
  CANCELLED: [],
};

function isSerializationConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2034"
  );
}

export async function listHospitalAdmissions(
  options: ListHospitalAdmissionsOptions = {},
) {
  const { businessId } = await getHospitalAdmissionContext();
  const skip = options.skip ?? 0;
  const take = options.take ?? 25;

  if (!Number.isInteger(skip) || skip < 0) {
    throw new HospitalAdmissionError("Invalid pagination offset.");
  }

  if (!Number.isInteger(take) || take < 1 || take > 100) {
    throw new HospitalAdmissionError(
      "Page size must be between 1 and 100.",
    );
  }

  if (
    options.status !== undefined &&
    !VALID_ADMISSION_STATUSES.has(options.status)
  ) {
    throw new HospitalAdmissionError("Invalid admission status.");
  }

  return prisma.hospitalAdmission.findMany({
    where: {
      businessId,
      ...(options.patientId
        ? { patientId: options.patientId }
        : {}),
      ...(options.encounterId
        ? { encounterId: options.encounterId }
        : {}),
      ...(options.clinicianId
        ? { clinicianId: options.clinicianId }
        : {}),
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
    orderBy: { admittedAt: "desc" },
    skip,
    take,
  });
}

export async function getHospitalAdmission(admissionId: string) {
  const { businessId, userId } = await getHospitalAdmissionContext();
  const id = admissionId?.trim();

  if (!id) {
    throw new HospitalAdmissionError("Admission ID is required.");
  }

  const admission = await prisma.hospitalAdmission.findFirst({
    where: { id, businessId },
    include: {
      patient: true,
      encounter: true,
      allocations: {
        where: { releasedAt: null },
        include: {
          bed: {
            include: { ward: true },
          },
        },
      },
    },
  });

  if (!admission) {
    throw new HospitalAdmissionError("Admission not found.", 404);
  }

  await recordAuditEvent({
    businessId,
    actorId: userId,
    action: AUDIT_ACTIONS.HOSPITAL_ADMISSION_VIEWED,
    category: "HOSPITAL",
    entityType: "HospitalAdmission",
    entityId: admission.id,
    metadata: {
      operation: "admission_record_view",
      admissionNumber: admission.admissionNumber,
    },
  });

  return admission;
}

export async function createHospitalAdmission(
  input: CreateHospitalAdmissionInput,
) {
  const { businessId, userId } = await getHospitalAdmissionContext();

  const patientId = input.patientId?.trim();
  const encounterId = input.encounterId?.trim() || null;
  const clinicianId = input.clinicianId?.trim() || null;
  const admissionReason = input.admissionReason?.trim() || null;

  if (!patientId) {
    throw new HospitalAdmissionError("A patient is required.");
  }

  if (
    input.admittedAt !== undefined &&
    (!(input.admittedAt instanceof Date) ||
      Number.isNaN(input.admittedAt.getTime()))
  ) {
    throw new HospitalAdmissionError("Invalid admission date.");
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
        throw new HospitalAdmissionError(
          "Active patient not found in this hospital.",
          404,
        );
      }

      if (encounterId) {
        const encounter = await tx.hospitalEncounter.findFirst({
          where: {
            id: encounterId,
            businessId,
            patientId,
            status: { not: "CANCELLED" },
          },
          select: { id: true },
        });

        if (!encounter) {
          throw new HospitalAdmissionError(
            "A non-cancelled encounter for this patient was not found in this hospital.",
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
          throw new HospitalAdmissionError(
            "The selected clinician must have active membership in this hospital.",
            404,
          );
        }
      }

      const admissionNumber = await generateBusinessReference({
        businessId,
        referenceType: "HOSPITAL_ADMISSION",
        prefix: "ADM",
        padLength: 6,
        client: tx,
      });

      const admission = await tx.hospitalAdmission.create({
        data: {
          businessId,
          patientId,
          encounterId,
          clinicianId,
          admissionNumber,
          admissionReason,
          createdBy: userId,
          ...(input.admittedAt
            ? { admittedAt: input.admittedAt }
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
          action: AUDIT_ACTIONS.HOSPITAL_ADMISSION_CREATED,
          category: "HOSPITAL",
          entityType: "HospitalAdmission",
          entityId: admission.id,
          afterData: admission,
          metadata: {
            admissionNumber: admission.admissionNumber,
            patientId,
          },
        },
        tx,
      );

      return admission;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function updateHospitalAdmissionStatus(
  admissionId: string,
  nextStatus: HospitalAdmissionStatus,
  dischargeNotes?: string | null,
) {
  const { businessId, userId } = await getHospitalAdmissionContext();
  const id = admissionId?.trim();
  const notes = dischargeNotes?.trim() || null;

  if (!id) {
    throw new HospitalAdmissionError("Admission ID is required.");
  }

  if (!VALID_ADMISSION_STATUSES.has(nextStatus)) {
    throw new HospitalAdmissionError("Invalid admission status.");
  }

  if (nextStatus === "ADMITTED") {
    throw new HospitalAdmissionError(
      "An admission cannot be reopened through a status update.",
    );
  }

  if (nextStatus === "CANCELLED" && dischargeNotes != null) {
    throw new HospitalAdmissionError(
      "Discharge notes are only supported when discharging an admission.",
    );
  }

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // Serialize discharge/cancellation against bed allocation for this admission.
          const lockedAdmission = await tx.$queryRaw<{ id: string }[]>`
            SELECT "id"
            FROM "HospitalAdmission"
            WHERE "id" = ${id}
              AND "businessId" = ${businessId}
            FOR UPDATE
          `;

          if (lockedAdmission.length === 0) {
            throw new HospitalAdmissionError(
              "Admission not found.",
              404,
            );
          }

          const existing = await tx.hospitalAdmission.findFirst({
            where: { id, businessId },
          });

          if (!existing) {
            throw new HospitalAdmissionError(
              "Admission not found.",
              404,
            );
          }

          if (
            !ALLOWED_ADMISSION_TRANSITIONS[existing.status].includes(
              nextStatus,
            )
          ) {
            throw new HospitalAdmissionError(
              `Cannot change admission status from ${existing.status} to ${nextStatus}.`,
            );
          }

          if (
            nextStatus === "DISCHARGED" ||
            nextStatus === "CANCELLED"
          ) {
            const activeAllocation =
              await tx.hospitalBedAllocation.findFirst({
                where: {
                  businessId,
                  admissionId: id,
                  releasedAt: null,
                },
                select: { id: true },
              });

            if (activeAllocation) {
              throw new HospitalAdmissionError(
                "Release the active bed allocation before discharging or cancelling this admission.",
              );
            }
          }

          const admission = await tx.hospitalAdmission.update({
            where: {
              businessId_id: {
                businessId,
                id,
              },
            },
            data: {
              status: nextStatus,
              ...(nextStatus === "DISCHARGED"
                ? {
                    dischargedAt: new Date(),
                    dischargeNotes: notes,
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
                },
              },
            },
          });

          await recordAuditEvent(
            {
              businessId,
              actorId: userId,
              action: AUDIT_ACTIONS.HOSPITAL_ADMISSION_STATUS_CHANGED,
              category: "HOSPITAL",
              entityType: "HospitalAdmission",
              entityId: admission.id,
              beforeData: existing,
              afterData: admission,
              metadata: {
                admissionNumber: admission.admissionNumber,
                previousStatus: existing.status,
                nextStatus,
              },
            },
            tx,
          );

          return admission;
        },
        {
          maxWait: 10_000,
          timeout: 15_000,
          isolationLevel: "Serializable",
        },
      );
    } catch (error) {
      if (isSerializationConflict(error) && attempt < maxAttempts) {
        continue;
      }

      if (isSerializationConflict(error)) {
        throw new HospitalAdmissionError(
          "The admission changed concurrently. Please reload and try again.",
          409,
        );
      }

      throw error;
    }
  }

  throw new HospitalAdmissionError(
    "Unable to update admission status.",
    409,
  );
}
