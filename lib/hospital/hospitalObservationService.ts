import { prisma } from "@/lib/database/prisma";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";

export class HospitalObservationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "HospitalObservationError";
    this.statusCode = statusCode;
  }
}

type ListHospitalObservationsOptions = {
  encounterId?: string;
  patientId?: string;
  observationType?: string;
  skip?: number;
  take?: number;
};

type CreateHospitalObservationInput = {
  patientId: string;
  encounterId: string;
  observationType: string;
  value: string;
  numericValue?: number | string | null;
  unit?: string | null;
  observedAt?: string | Date;
};

async function getHospitalObservationContext() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

function validatePagination(skip: number, take: number) {
  if (!Number.isInteger(skip) || skip < 0) {
    throw new HospitalObservationError("Invalid pagination offset.");
  }

  if (!Number.isInteger(take) || take < 1 || take > 100) {
    throw new HospitalObservationError(
      "Page size must be between 1 and 100.",
    );
  }
}

export async function listHospitalObservations(
  options: ListHospitalObservationsOptions = {},
) {
  const { businessId, userId } =
    await getHospitalObservationContext();

  const skip = options.skip ?? 0;
  const take = options.take ?? 25;

  validatePagination(skip, take);

  const encounterId = options.encounterId?.trim();
  const patientId = options.patientId?.trim();
  const observationType = options.observationType?.trim();

  if (!encounterId && !patientId) {
    throw new HospitalObservationError(
      "Filter observations by encounterId or patientId.",
    );
  }

  const observations = await prisma.hospitalObservation.findMany({
    where: {
      businessId,
      ...(encounterId ? { encounterId } : {}),
      ...(patientId ? { patientId } : {}),
      ...(observationType ? { observationType } : {}),
    },
    orderBy: { observedAt: "desc" },
    skip,
    take,
  });

  for (const observation of observations) {
    await recordAuditEvent({
      businessId,
      actorId: userId,
      action: AUDIT_ACTIONS.HOSPITAL_OBSERVATION_VIEWED,
      category: "HOSPITAL",
      entityType: "HospitalObservation",
      entityId: observation.id,
      metadata: {
        encounterId: observation.encounterId,
        patientId: observation.patientId,
        observationType: observation.observationType,
        accessMode: "list",
      },
    });
  }

  return observations;
}

export async function getHospitalObservation(observationId: string) {
  const { businessId, userId } =
    await getHospitalObservationContext();

  const id = observationId?.trim();

  if (!id) {
    throw new HospitalObservationError("Observation ID is required.");
  }

  const observation = await prisma.hospitalObservation.findFirst({
    where: { id, businessId },
  });

  if (!observation) {
    throw new HospitalObservationError("Observation not found.", 404);
  }

  await recordAuditEvent({
    businessId,
    actorId: userId,
    action: AUDIT_ACTIONS.HOSPITAL_OBSERVATION_VIEWED,
    category: "HOSPITAL",
    entityType: "HospitalObservation",
    entityId: observation.id,
    metadata: {
      encounterId: observation.encounterId,
      patientId: observation.patientId,
      observationType: observation.observationType,
      accessMode: "detail",
    },
  });

  return observation;
}

export async function createHospitalObservation(
  input: CreateHospitalObservationInput,
) {
  const { businessId, userId } =
    await getHospitalObservationContext();

  const patientId = input.patientId?.trim();
  const encounterId = input.encounterId?.trim();
  const observationType = input.observationType?.trim();
  const value = input.value?.trim();
  const unit = input.unit?.trim() || null;

  if (!patientId) {
    throw new HospitalObservationError("A patient is required.");
  }

  if (!encounterId) {
    throw new HospitalObservationError("An encounter is required.");
  }

  if (!observationType || observationType.length > 100) {
    throw new HospitalObservationError(
      "Observation type is required and cannot exceed 100 characters.",
    );
  }

  if (!value || value.length > 2000) {
    throw new HospitalObservationError(
      "Observation value is required and cannot exceed 2,000 characters.",
    );
  }

  if (unit && unit.length > 50) {
    throw new HospitalObservationError(
      "Observation unit cannot exceed 50 characters.",
    );
  }

  let numericValue: number | null = null;

  if (input.numericValue !== undefined && input.numericValue !== null) {
    const parsed = Number(input.numericValue);

    if (!Number.isFinite(parsed)) {
      throw new HospitalObservationError(
        "Numeric observation value must be a finite number.",
      );
    }

    if (Math.abs(parsed) > 99999999999999) {
      throw new HospitalObservationError(
        "Numeric observation value is outside the supported range.",
      );
    }

    const decimalPlaces = input.numericValue
      .toString()
      .split(".")[1]?.length ?? 0;

    if (decimalPlaces > 4) {
      throw new HospitalObservationError(
        "Numeric observation value cannot exceed 4 decimal places.",
      );
    }

    numericValue = parsed;
  }

  let observedAt: Date | undefined;

  if (input.observedAt !== undefined) {
    observedAt = input.observedAt instanceof Date
      ? input.observedAt
      : new Date(input.observedAt);

    if (Number.isNaN(observedAt.getTime())) {
      throw new HospitalObservationError(
        "A valid observation date and time are required.",
      );
    }

    if (observedAt.getTime() > Date.now() + 5 * 60 * 1000) {
      throw new HospitalObservationError(
        "Observation time cannot be more than 5 minutes in the future.",
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    const patient = await tx.patient.findFirst({
      where: {
        id: patientId,
        businessId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!patient) {
      throw new HospitalObservationError(
        "Active patient not found in this hospital.",
        404,
      );
    }

    const encounter = await tx.hospitalEncounter.findFirst({
      where: {
        id: encounterId,
        businessId,
        patientId,
      },
      select: { id: true, status: true },
    });

    if (!encounter) {
      throw new HospitalObservationError(
        "Encounter not found for this patient in this hospital.",
        404,
      );
    }

    if (
      encounter.status === "COMPLETED" ||
      encounter.status === "CANCELLED"
    ) {
      throw new HospitalObservationError(
        "Observations can only be added to open or in-progress encounters.",
        409,
      );
    }

    const observation = await tx.hospitalObservation.create({
      data: {
        businessId,
        patientId,
        encounterId,
        authorId: userId,
        observationType,
        value,
        numericValue,
        unit,
        ...(observedAt ? { observedAt } : {}),
      },
    });

    await recordAuditEvent(
      {
        businessId,
        actorId: userId,
        action: AUDIT_ACTIONS.HOSPITAL_OBSERVATION_CREATED,
        category: "HOSPITAL",
        entityType: "HospitalObservation",
        entityId: observation.id,
        metadata: {
          patientId,
          encounterId,
          observationType,
          hasNumericValue: numericValue !== null,
          hasUnit: unit !== null,
        },
      },
      tx,
    );

    return observation;
  });
}
