import { prisma } from "@/lib/database/prisma";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";

export class HospitalDiagnosisError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "HospitalDiagnosisError";
    this.statusCode = statusCode;
  }
}

type ListHospitalDiagnosesOptions = {
  encounterId?: string;
  patientId?: string;
  skip?: number;
  take?: number;
};

type CreateHospitalDiagnosisInput = {
  patientId: string;
  encounterId: string;
  code?: string | null;
  description: string;
  classification?: string | null;
};

async function getHospitalDiagnosisContext() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

function validatePagination(skip: number, take: number) {
  if (!Number.isInteger(skip) || skip < 0) {
    throw new HospitalDiagnosisError("Invalid pagination offset.");
  }

  if (!Number.isInteger(take) || take < 1 || take > 100) {
    throw new HospitalDiagnosisError(
      "Page size must be between 1 and 100.",
    );
  }
}

export async function listHospitalDiagnoses(
  options: ListHospitalDiagnosesOptions = {},
) {
  const { businessId, userId } =
    await getHospitalDiagnosisContext();

  const skip = options.skip ?? 0;
  const take = options.take ?? 25;

  validatePagination(skip, take);

  const encounterId = options.encounterId?.trim();
  const patientId = options.patientId?.trim();

  if (!encounterId && !patientId) {
    throw new HospitalDiagnosisError(
      "Filter diagnoses by encounterId or patientId.",
    );
  }

  const diagnoses = await prisma.hospitalDiagnosis.findMany({
    where: {
      businessId,
      ...(encounterId ? { encounterId } : {}),
      ...(patientId ? { patientId } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  for (const diagnosis of diagnoses) {
    await recordAuditEvent({
      businessId,
      actorId: userId,
      action: AUDIT_ACTIONS.HOSPITAL_DIAGNOSIS_VIEWED,
      category: "HOSPITAL",
      entityType: "HospitalDiagnosis",
      entityId: diagnosis.id,
      metadata: {
        encounterId: diagnosis.encounterId,
        patientId: diagnosis.patientId,
        accessMode: "list",
      },
    });
  }

  return diagnoses;
}

export async function getHospitalDiagnosis(diagnosisId: string) {
  const { businessId, userId } =
    await getHospitalDiagnosisContext();

  const id = diagnosisId?.trim();

  if (!id) {
    throw new HospitalDiagnosisError("Diagnosis ID is required.");
  }

  const diagnosis = await prisma.hospitalDiagnosis.findFirst({
    where: { id, businessId },
  });

  if (!diagnosis) {
    throw new HospitalDiagnosisError("Diagnosis not found.", 404);
  }

  await recordAuditEvent({
    businessId,
    actorId: userId,
    action: AUDIT_ACTIONS.HOSPITAL_DIAGNOSIS_VIEWED,
    category: "HOSPITAL",
    entityType: "HospitalDiagnosis",
    entityId: diagnosis.id,
    metadata: {
      encounterId: diagnosis.encounterId,
      patientId: diagnosis.patientId,
      accessMode: "detail",
    },
  });

  return diagnosis;
}

export async function createHospitalDiagnosis(
  input: CreateHospitalDiagnosisInput,
) {
  const { businessId, userId } =
    await getHospitalDiagnosisContext();

  const patientId = input.patientId?.trim();
  const encounterId = input.encounterId?.trim();
  const description = input.description?.trim();
  const code = input.code?.trim() || null;
  const classification = input.classification?.trim() || null;

  if (!patientId) {
    throw new HospitalDiagnosisError("A patient is required.");
  }

  if (!encounterId) {
    throw new HospitalDiagnosisError("An encounter is required.");
  }

  if (!description) {
    throw new HospitalDiagnosisError(
      "Diagnosis description is required.",
    );
  }

  if (description.length > 2000) {
    throw new HospitalDiagnosisError(
      "Diagnosis description cannot exceed 2,000 characters.",
    );
  }

  if (code && code.length > 100) {
    throw new HospitalDiagnosisError(
      "Diagnosis code cannot exceed 100 characters.",
    );
  }

  if (classification && classification.length > 100) {
    throw new HospitalDiagnosisError(
      "Diagnosis classification cannot exceed 100 characters.",
    );
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
      throw new HospitalDiagnosisError(
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
      throw new HospitalDiagnosisError(
        "Encounter not found for this patient in this hospital.",
        404,
      );
    }

    if (
      encounter.status === "COMPLETED" ||
      encounter.status === "CANCELLED"
    ) {
      throw new HospitalDiagnosisError(
        "Diagnoses can only be added to open or in-progress encounters.",
        409,
      );
    }

    const diagnosis = await tx.hospitalDiagnosis.create({
      data: {
        businessId,
        patientId,
        encounterId,
        authorId: userId,
        code,
        description,
        classification,
      },
    });

    await recordAuditEvent(
      {
        businessId,
        actorId: userId,
        action: AUDIT_ACTIONS.HOSPITAL_DIAGNOSIS_CREATED,
        category: "HOSPITAL",
        entityType: "HospitalDiagnosis",
        entityId: diagnosis.id,
        metadata: {
          patientId,
          encounterId,
          code,
          classification,
        },
      },
      tx,
    );

    return diagnosis;
  });
}
