import { prisma } from "@/lib/database/prisma";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";
import {
  HospitalAdmissionStatus,
  HospitalBedStatus,
} from "@/generated/prisma/client";

export class HospitalBedAllocationError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "HospitalBedAllocationError";
  }
}

const MAX_TRANSACTION_ATTEMPTS = 3;

function errorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }

  return undefined;
}

async function getContext() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

function requiredId(value: string, label: string): string {
  const id = value?.trim();

  if (!id) {
    throw new HospitalBedAllocationError(`${label} is required.`);
  }

  return id;
}

function optionalReason(value?: string | null): string | null {
  if (value == null) return null;

  const reason = value.trim();

  if (reason.length > 500) {
    throw new HospitalBedAllocationError(
      "Release reason cannot exceed 500 characters.",
    );
  }

  return reason || null;
}

export async function allocateHospitalBed(
  admissionId: string,
  bedId: string,
) {
  const { businessId, userId } = await getContext();
  const admissionKey = requiredId(admissionId, "Admission ID");
  const bedKey = requiredId(bedId, "Bed ID");

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // Serialize bed allocation against discharge/cancellation for this admission.
          const lockedAdmission = await tx.$queryRaw<{ id: string }[]>`
            SELECT "id"
            FROM "HospitalAdmission"
            WHERE "id" = ${admissionKey}
              AND "businessId" = ${businessId}
            FOR UPDATE
          `;

          if (lockedAdmission.length === 0) {
            throw new HospitalBedAllocationError(
              "Admission not found.",
              404,
            );
          }

          const admission = await tx.hospitalAdmission.findFirst({
            where: { id: admissionKey, businessId },
            select: {
              id: true,
              admissionNumber: true,
              status: true,
            },
          });

          if (!admission) {
            throw new HospitalBedAllocationError(
              "Admission not found.",
              404,
            );
          }

          if (admission.status !== HospitalAdmissionStatus.ADMITTED) {
            throw new HospitalBedAllocationError(
              "A bed can only be allocated to an admitted patient.",
              409,
            );
          }

          // Lock order: admission, then bed. Release uses the same order.
          const lockedBed = await tx.$queryRaw<{ id: string }[]>`
            SELECT "id"
            FROM "HospitalBed"
            WHERE "id" = ${bedKey}
              AND "businessId" = ${businessId}
            FOR UPDATE
          `;
          if (lockedBed.length === 0) {
            throw new HospitalBedAllocationError("Bed not found.", 404);
          }

          const bed = await tx.hospitalBed.findFirst({
            where: { id: bedKey, businessId },
            include: {
              ward: {
                select: { id: true, name: true, isActive: true },
              },
            },
          });

          if (!bed) {
            throw new HospitalBedAllocationError("Bed not found.", 404);
          }

          if (!bed.ward.isActive) {
            throw new HospitalBedAllocationError(
              "The bed's ward is inactive.",
              409,
            );
          }

          if (bed.status !== HospitalBedStatus.AVAILABLE) {
            throw new HospitalBedAllocationError(
              "The selected bed is not available.",
              409,
            );
          }

          const existingAllocation =
            await tx.hospitalBedAllocation.findFirst({
              where: {
                businessId,
                admissionId: admission.id,
                releasedAt: null,
              },
              select: { id: true },
            });

          if (existingAllocation) {
            throw new HospitalBedAllocationError(
              "This admission already has an active bed allocation.",
              409,
            );
          }

          const allocation = await tx.hospitalBedAllocation.create({
            data: {
              businessId,
              admissionId: admission.id,
              bedId: bed.id,
              allocatedBy: userId,
            },
            include: {
              admission: {
                select: {
                  id: true,
                  admissionNumber: true,
                  patientId: true,
                },
              },
              bed: {
                include: {
                  ward: {
                    select: { id: true, code: true, name: true },
                  },
                },
              },
            },
          });

          await tx.hospitalBed.update({
            where: {
              businessId_id: { businessId, id: bed.id },
            },
            data: { status: HospitalBedStatus.OCCUPIED },
          });

          await recordAuditEvent(
            {
              businessId,
              actorId: userId,
              action: AUDIT_ACTIONS.HOSPITAL_BED_ALLOCATION_CREATED,
              category: "HOSPITAL",
              entityType: "HospitalBedAllocation",
              entityId: allocation.id,
              afterData: {
                admissionId: admission.id,
                admissionNumber: admission.admissionNumber,
                bedId: bed.id,
                bedNumber: bed.bedNumber,
                wardId: bed.wardId,
              },
            },
            tx,
          );

          return allocation;
        },
        {
          isolationLevel: "Serializable",
          maxWait: 10000,
          timeout: 15000,
        },
      );
    } catch (error: unknown) {
      const code = errorCode(error);

      if (code === "P2034" && attempt < MAX_TRANSACTION_ATTEMPTS) {
        continue;
      }

      if (code === "P2002") {
        throw new HospitalBedAllocationError(
          "The bed or admission already has an active allocation.",
          409,
        );
      }

      throw error;
    }
  }

  throw new HospitalBedAllocationError(
    "Could not allocate the bed due to concurrent changes. Please retry.",
    409,
  );
}

export async function releaseHospitalBedAllocation(
  allocationId: string,
  releaseReason?: string | null,
) {
  const { businessId, userId } = await getContext();
  const allocationKey = requiredId(allocationId, "Allocation ID");
  const reason = optionalReason(releaseReason);

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const allocation = await tx.hospitalBedAllocation.findFirst({
            where: {
              id: allocationKey,
              businessId,
              releasedAt: null,
            },
            include: {
              admission: {
                select: {
                  id: true,
                  admissionNumber: true,
                },
              },
              bed: {
                select: {
                  id: true,
                  bedNumber: true,
                  status: true,
                },
              },
            },
          });

          if (!allocation) {
            throw new HospitalBedAllocationError(
              "Active bed allocation not found.",
              404,
            );
          }

          // Use the same lock order as allocation: admission, then bed.
          const lockedAdmission = await tx.$queryRaw<{ id: string }[]>`
            SELECT "id"
            FROM "HospitalAdmission"
            WHERE "id" = ${allocation.admission.id}
              AND "businessId" = ${businessId}
            FOR UPDATE
          `;
          if (lockedAdmission.length === 0) {
            throw new HospitalBedAllocationError("Admission not found.", 404);
          }

          const lockedBed = await tx.$queryRaw<{ id: string }[]>`
            SELECT "id"
            FROM "HospitalBed"
            WHERE "id" = ${allocation.bed.id}
              AND "businessId" = ${businessId}
            FOR UPDATE
          `;
          if (lockedBed.length === 0) {
            throw new HospitalBedAllocationError("Bed not found.", 404);
          }

          // Confirm the allocation is still active after acquiring the locks.
          const currentAllocation =
            await tx.hospitalBedAllocation.findFirst({
              where: {
                id: allocationKey,
                businessId,
                releasedAt: null,
              },
              select: { id: true },
            });

          if (!currentAllocation) {
            throw new HospitalBedAllocationError(
              "Active bed allocation not found.",
              404,
            );
          }

          const releasedAt = new Date();

          const updatedAllocation =
            await tx.hospitalBedAllocation.update({
              where: { id: allocation.id },
              data: {
                releasedAt,
                releasedBy: userId,
                releaseReason: reason,
              },
              include: {
                admission: {
                  select: {
                    id: true,
                    admissionNumber: true,
                    patientId: true,
                  },
                },
                bed: {
                  include: {
                    ward: {
                      select: { id: true, code: true, name: true },
                    },
                  },
                },
              },
            });

          const nextBedStatus =
            allocation.bed.status === HospitalBedStatus.OCCUPIED
              ? HospitalBedStatus.AVAILABLE
              : allocation.bed.status;

          if (nextBedStatus !== allocation.bed.status) {
            await tx.hospitalBed.update({
              where: {
                businessId_id: {
                  businessId,
                  id: allocation.bed.id,
                },
              },
              data: { status: nextBedStatus },
            });
          }

          await recordAuditEvent(
            {
              businessId,
              actorId: userId,
              action: AUDIT_ACTIONS.HOSPITAL_BED_ALLOCATION_RELEASED,
              category: "HOSPITAL",
              entityType: "HospitalBedAllocation",
              entityId: allocation.id,
              beforeData: {
                releasedAt: null,
                bedStatus: allocation.bed.status,
              },
              afterData: {
                releasedAt,
                releasedBy: userId,
                releaseReason: reason,
                bedStatus: nextBedStatus,
                admissionId: allocation.admission.id,
                admissionNumber: allocation.admission.admissionNumber,
                bedId: allocation.bed.id,
                bedNumber: allocation.bed.bedNumber,
              },
            },
            tx,
          );

          return updatedAllocation;
        },
        {
          isolationLevel: "Serializable",
          maxWait: 10000,
          timeout: 15000,
        },
      );
    } catch (error: unknown) {
      const code = errorCode(error);

      if (code === "P2034" && attempt < MAX_TRANSACTION_ATTEMPTS) {
        continue;
      }

      if (code === "P2002") {
        throw new HospitalBedAllocationError(
          "The allocation changed concurrently. Please refresh and retry.",
          409,
        );
      }

      throw error;
    }
  }

  throw new HospitalBedAllocationError(
    "Could not release the allocation due to concurrent changes. Please retry.",
    409,
  );
}
