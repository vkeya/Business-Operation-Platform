import { prisma } from "@/lib/database/prisma";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";
import {
  HospitalBedStatus,
  HospitalWardType,
  Prisma,
} from "../../generated/prisma/client";

export class HospitalWardBedError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "HospitalWardBedError";
    this.statusCode = statusCode;
  }
}

async function getHospitalWardBedContext() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HospitalWardBedError(`${field} is required.`);
  }

  return value.trim();
}

function optionalText(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new HospitalWardBedError(`${field} must be text.`);
  }

  const result = value.trim();
  return result || null;
}

function enumValue<T extends Record<string, string>>(
  value: unknown,
  allowed: T,
  field: string,
): T[keyof T] {
  if (
    typeof value !== "string" ||
    !Object.values(allowed).includes(value)
  ) {
    throw new HospitalWardBedError(`${field} is invalid.`);
  }

  return value as T[keyof T];
}

function pagination(skip = 0, take = 25) {
  if (!Number.isInteger(skip) || skip < 0) {
    throw new HospitalWardBedError("Invalid pagination offset.");
  }

  if (!Number.isInteger(take) || take < 1 || take > 100) {
    throw new HospitalWardBedError(
      "Page size must be between 1 and 100.",
    );
  }

  return { skip, take };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export type CreateHospitalWardInput = {
  code: string;
  name: string;
  type?: HospitalWardType;
  description?: string | null;
};

export type UpdateHospitalWardInput = {
  code?: string;
  name?: string;
  type?: HospitalWardType;
  description?: string | null;
  isActive?: boolean;
};

export type CreateHospitalBedInput = {
  wardId: string;
  bedNumber: string;
  notes?: string | null;
};

export async function listHospitalWards(options: {
  skip?: number;
  take?: number;
  includeInactive?: boolean;
} = {}) {
  const { businessId } = await getHospitalWardBedContext();
  const { skip, take } = pagination(options.skip, options.take);

  return prisma.hospitalWard.findMany({
    where: {
      businessId,
      ...(options.includeInactive ? {} : { isActive: true }),
    },
    include: {
      _count: { select: { beds: true } },
    },
    orderBy: [{ name: "asc" }, { code: "asc" }],
    skip,
    take,
  });
}

export async function createHospitalWard(
  input: CreateHospitalWardInput,
) {
  const { businessId, userId } = await getHospitalWardBedContext();

  const code = requiredText(input.code, "Ward code");
  const name = requiredText(input.name, "Ward name");
  const type = input.type === undefined
    ? HospitalWardType.GENERAL
    : enumValue(input.type, HospitalWardType, "Ward type");
  const description = optionalText(input.description, "Description");

  try {
    const ward = await prisma.hospitalWard.create({
      data: {
        businessId,
        code,
        name,
        type,
        description,
      },
    });

    await recordAuditEvent({
      businessId,
      actorId: userId,
      action: AUDIT_ACTIONS.HOSPITAL_WARD_CREATED,
      category: "HOSPITAL",
      entityType: "HospitalWard",
      entityId: ward.id,
      afterData: {
        code: ward.code,
        name: ward.name,
        type: ward.type,
        description: ward.description,
      },
    });

    return ward;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new HospitalWardBedError(
        "A ward with this code already exists.",
        409,
      );
    }
    throw error;
  }
}

export async function getHospitalWard(wardId: string) {
  const { businessId } = await getHospitalWardBedContext();
  const id = requiredText(wardId, "Ward ID");

  const ward = await prisma.hospitalWard.findFirst({
    where: { id, businessId },
    include: {
      _count: { select: { beds: true } },
      beds: {
        orderBy: { bedNumber: "asc" },
        include: {
          allocations: {
            where: { businessId, releasedAt: null },
            select: {
              id: true,
              admissionId: true,
              allocatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!ward) {
    throw new HospitalWardBedError("Ward not found.", 404);
  }

  return ward;
}

export async function updateHospitalWard(
  wardId: string,
  input: UpdateHospitalWardInput,
) {
  const { businessId, userId } = await getHospitalWardBedContext();
  const id = requiredText(wardId, "Ward ID");

  const existing = await prisma.hospitalWard.findFirst({
    where: { id, businessId },
  });

  if (!existing) {
    throw new HospitalWardBedError("Ward not found.", 404);
  }

  const data: Prisma.HospitalWardUpdateInput = {};

  if (input.code !== undefined) {
    data.code = requiredText(input.code, "Ward code");
  }
  if (input.name !== undefined) {
    data.name = requiredText(input.name, "Ward name");
  }
  if (input.type !== undefined) {
    data.type = enumValue(input.type, HospitalWardType, "Ward type");
  }
  if (input.description !== undefined) {
    data.description = optionalText(input.description, "Description");
  }
  if (input.isActive !== undefined) {
    if (typeof input.isActive !== "boolean") {
      throw new HospitalWardBedError("isActive must be a boolean.");
    }

    if (existing.isActive && !input.isActive) {
      const occupiedBeds = await prisma.hospitalBed.count({
        where: {
          businessId,
          wardId: id,
          OR: [
            { status: HospitalBedStatus.OCCUPIED },
            {
              allocations: {
                some: { businessId, releasedAt: null },
              },
            },
          ],
        },
      });

      if (occupiedBeds > 0) {
        throw new HospitalWardBedError(
          "Cannot deactivate a ward with occupied beds or active allocations.",
          409,
        );
      }
    }

    data.isActive = input.isActive;
  }

  if (Object.keys(data).length === 0) {
    throw new HospitalWardBedError("No ward changes were provided.");
  }

  try {
    const ward = await prisma.hospitalWard.update({
      where: {
        businessId_id: { businessId, id },
      },
      data,
    });

    await recordAuditEvent({
      businessId,
      actorId: userId,
      action: AUDIT_ACTIONS.HOSPITAL_WARD_UPDATED,
      category: "HOSPITAL",
      entityType: "HospitalWard",
      entityId: ward.id,
      beforeData: existing,
      afterData: ward,
    });

    return ward;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new HospitalWardBedError(
        "A ward with this code already exists.",
        409,
      );
    }
    throw error;
  }
}

export async function listHospitalBeds(options: {
  wardId?: string;
  status?: HospitalBedStatus;
  skip?: number;
  take?: number;
} = {}) {
  const { businessId } = await getHospitalWardBedContext();
  const { skip, take } = pagination(options.skip, options.take);

  const wardId = options.wardId
    ? requiredText(options.wardId, "Ward ID")
    : undefined;

  const status = options.status === undefined
    ? undefined
    : enumValue(options.status, HospitalBedStatus, "Bed status");

  if (wardId) {
    const ward = await prisma.hospitalWard.findFirst({
      where: { id: wardId, businessId },
      select: { id: true },
    });

    if (!ward) {
      throw new HospitalWardBedError("Ward not found.", 404);
    }
  }

  return prisma.hospitalBed.findMany({
    where: {
      businessId,
      ...(wardId ? { wardId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      ward: {
        select: { id: true, code: true, name: true, isActive: true },
      },
    },
    orderBy: [{ ward: { name: "asc" } }, { bedNumber: "asc" }],
    skip,
    take,
  });
}

export async function createHospitalBed(
  input: CreateHospitalBedInput,
) {
  const { businessId, userId } = await getHospitalWardBedContext();

  const wardId = requiredText(input.wardId, "Ward ID");
  const bedNumber = requiredText(input.bedNumber, "Bed number");
  const notes = optionalText(input.notes, "Notes");

  const ward = await prisma.hospitalWard.findFirst({
    where: { id: wardId, businessId, isActive: true },
    select: { id: true },
  });

  if (!ward) {
    throw new HospitalWardBedError(
      "An active ward in this business is required.",
      404,
    );
  }

  try {
    const bed = await prisma.hospitalBed.create({
      data: {
        businessId,
        wardId,
        bedNumber,
        notes,
      },
    });

    await recordAuditEvent({
      businessId,
      actorId: userId,
      action: AUDIT_ACTIONS.HOSPITAL_BED_CREATED,
      category: "HOSPITAL",
      entityType: "HospitalBed",
      entityId: bed.id,
      afterData: {
        wardId: bed.wardId,
        bedNumber: bed.bedNumber,
        status: bed.status,
        notes: bed.notes,
      },
    });

    return bed;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new HospitalWardBedError(
        "A bed with this number already exists in the ward.",
        409,
      );
    }
    throw error;
  }
}

export async function getHospitalBed(bedId: string) {
  const { businessId } = await getHospitalWardBedContext();
  const id = requiredText(bedId, "Bed ID");

  const bed = await prisma.hospitalBed.findFirst({
    where: { id, businessId },
    include: {
      ward: {
        select: {
          id: true,
          code: true,
          name: true,
          isActive: true,
        },
      },
      allocations: {
        where: { businessId, releasedAt: null },
        select: {
          id: true,
          admissionId: true,
          allocatedAt: true,
          allocatedBy: true,
        },
      },
    },
  });

  if (!bed) {
    throw new HospitalWardBedError("Bed not found.", 404);
  }

  return bed;
}

export async function changeHospitalBedStatus(
  bedId: string,
  nextStatus: HospitalBedStatus,
) {
  const { businessId, userId } = await getHospitalWardBedContext();
  const id = requiredText(bedId, "Bed ID");
  const status = enumValue(
    nextStatus,
    HospitalBedStatus,
    "Bed status",
  );

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // Serialize status changes with allocation and release operations.
          const lockedBed = await tx.$queryRaw<{ id: string }[]>`
            SELECT "id"
            FROM "HospitalBed"
            WHERE "id" = ${id}
              AND "businessId" = ${businessId}
            FOR UPDATE
          `;
          if (lockedBed.length === 0) {
            throw new HospitalWardBedError("Bed not found.", 404);
          }

          const existing = await tx.hospitalBed.findFirst({
            where: { id, businessId },
          });

          if (!existing) {
            throw new HospitalWardBedError("Bed not found.", 404);
          }

          const activeAllocation =
            await tx.hospitalBedAllocation.findFirst({
              where: {
                businessId,
                bedId: id,
                releasedAt: null,
              },
              select: { id: true },
            });

          if (
            activeAllocation &&
            status !== HospitalBedStatus.OCCUPIED
          ) {
            throw new HospitalWardBedError(
              "A bed with an active allocation must remain occupied until the allocation is released.",
              409,
            );
          }

          if (
            !activeAllocation &&
            status === HospitalBedStatus.OCCUPIED
          ) {
            throw new HospitalWardBedError(
              "A bed cannot be marked occupied without an active allocation.",
              409,
            );
          }

          if (existing.status === status) {
            return existing;
          }

          const bed = await tx.hospitalBed.update({
            where: {
              businessId_id: { businessId, id },
            },
            data: { status },
          });

          await recordAuditEvent(
            {
              businessId,
              actorId: userId,
              action: AUDIT_ACTIONS.HOSPITAL_BED_STATUS_CHANGED,
              category: "HOSPITAL",
              entityType: "HospitalBed",
              entityId: bed.id,
              beforeData: { status: existing.status },
              afterData: { status: bed.status },
            },
            tx,
          );

          return bed;
        },
        {
          isolationLevel: "Serializable",
          maxWait: 10000,
          timeout: 15000,
        },
      );
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? (error as { code?: unknown }).code
          : undefined;

      if (code === "P2034" && attempt < maxAttempts) {
        continue;
      }

      if (code === "P2034") {
        throw new HospitalWardBedError(
          "The bed status changed concurrently. Please refresh and retry.",
          409,
        );
      }

      throw error;
    }
  }

  throw new HospitalWardBedError(
    "Could not update the bed status. Please retry.",
    409,
  );
}
