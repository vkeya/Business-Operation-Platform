
import { prisma } from "@/lib/database/prisma";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";

export class HospitalPatientError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "HospitalPatientError";
  }
}

async function getHospitalContext() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(
    context.business.type as BusinessType,
  );

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

export interface CreateHospitalPatientInput {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth?: Date | null;
  sex?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
}

export interface UpdateHospitalPatientInput {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  dateOfBirth?: Date | null;
  sex?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
}

export async function listHospitalPatients(options?: {
  search?: string;
  includeInactive?: boolean;
  skip?: number;
  take?: number;
}) {
  const { businessId, userId } = await getHospitalContext();

  const search = options?.search?.trim();
  const skip = Math.max(0, options?.skip ?? 0);
  const take = Math.min(
    100,
    Math.max(1, options?.take ?? 25),
  );

  return prisma.patient.findMany({
    where: {
      businessId,
      ...(options?.includeInactive
        ? {}
        : { isActive: true }),
      ...(search
        ? {
            OR: [
              {
                patientNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                firstName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                middleName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                phone: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [
      { lastName: "asc" },
      { firstName: "asc" },
    ],
    skip,
    take,
  });
}

export async function getHospitalPatient(
  patientId: string,
) {
    const { businessId, userId } = await getHospitalContext();

  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      businessId,
    },
  });

  if (!patient) {
    throw new HospitalPatientError(
      "Patient not found.",
      404,
    );
  }
  
  await recordAuditEvent({
  businessId,
  actorId: userId,
  action: AUDIT_ACTIONS.HOSPITAL_PATIENT_VIEWED,
  category: "HOSPITAL",
  entityType: "Patient",
  entityId: patient.id,
  metadata: {
    operation: "patient_record_view",
  },
});

  return patient;
}

export async function createHospitalPatient(
  input: CreateHospitalPatientInput,
) {
  const { businessId, userId } = await getHospitalContext();

  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();

  if (!firstName || !lastName) {
    throw new HospitalPatientError(
      "First name and last name are required.",
    );
  }

  if (
    input.dateOfBirth &&
    Number.isNaN(input.dateOfBirth.getTime())
  ) {
    throw new HospitalPatientError(
      "A valid date of birth is required.",
    );
  }

  // When date of birth is provided, prevent a likely duplicate
  // without treating a shared family phone number as a duplicate.
  if (input.dateOfBirth) {
    const existingPatient = await prisma.patient.findFirst({
      where: {
        businessId,
        firstName: {
          equals: firstName,
          mode: "insensitive",
        },
        lastName: {
          equals: lastName,
          mode: "insensitive",
        },
        dateOfBirth: input.dateOfBirth,
      },
      select: { id: true },
    });

    if (existingPatient) {
      throw new HospitalPatientError(
        "A patient with the same name and date of birth already exists.",
        409,
      );
    }
  }

  const patientNumber = await generateBusinessReference({
    businessId,
    referenceType: "HOSPITAL_PATIENT",
    prefix: "PAT",
    padLength: 6,
  });

  const patient = await prisma.patient.create({
  data: {
    businessId,
    patientNumber,
    firstName,
    middleName: input.middleName?.trim() || null,
    lastName,
    dateOfBirth: input.dateOfBirth ?? null,
    sex: input.sex?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    address: input.address?.trim() || null,
    emergencyContactName:
      input.emergencyContactName?.trim() || null,
    emergencyContactRelationship:
      input.emergencyContactRelationship?.trim() || null,
    emergencyContactPhone:
      input.emergencyContactPhone?.trim() || null,
  },
});

await recordAuditEvent({
  businessId,
  actorId: userId,
  action: AUDIT_ACTIONS.HOSPITAL_PATIENT_CREATED,
  category: "HOSPITAL",
  entityType: "Patient",
  entityId: patient.id,
  metadata: {
    operation: "patient_registration",
  },
});

return patient;
}

export async function updateHospitalPatient(
  patientId: string,
  input: UpdateHospitalPatientInput,
) {
  const { businessId, userId } = await getHospitalContext();

  const existingPatient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      businessId,
    },
    select: { id: true },
  });

  if (!existingPatient) {
    throw new HospitalPatientError(
      "Patient not found.",
      404,
    );
  }

  const data: UpdateHospitalPatientInput = {};

  if (input.firstName !== undefined) {
    const value = input.firstName.trim();

    if (!value) {
      throw new HospitalPatientError(
        "First name cannot be empty.",
      );
    }

    data.firstName = value;
  }

  if (input.lastName !== undefined) {
    const value = input.lastName.trim();

    if (!value) {
      throw new HospitalPatientError(
        "Last name cannot be empty.",
      );
    }

    data.lastName = value;
  }

  if (input.middleName !== undefined) {
    data.middleName = input.middleName?.trim() || null;
  }

  if (input.dateOfBirth !== undefined) {
    if (
      input.dateOfBirth &&
      Number.isNaN(input.dateOfBirth.getTime())
    ) {
      throw new HospitalPatientError(
        "A valid date of birth is required.",
      );
    }

    data.dateOfBirth = input.dateOfBirth;
  }

  if (input.sex !== undefined) {
    data.sex = input.sex?.trim() || null;
  }

  if (input.phone !== undefined) {
    data.phone = input.phone?.trim() || null;
  }

  if (input.email !== undefined) {
    data.email = input.email?.trim() || null;
  }

  if (input.address !== undefined) {
    data.address = input.address?.trim() || null;
  }

  if (input.emergencyContactName !== undefined) {
    data.emergencyContactName =
      input.emergencyContactName?.trim() || null;
  }

  if (input.emergencyContactRelationship !== undefined) {
    data.emergencyContactRelationship =
      input.emergencyContactRelationship?.trim() || null;
  }

  if (input.emergencyContactPhone !== undefined) {
    data.emergencyContactPhone =
      input.emergencyContactPhone?.trim() || null;
  }

  const patient = await prisma.patient.update({
  where: {
    id: existingPatient.id,
  },
  data,
});

await recordAuditEvent({
  businessId,
  actorId: userId,
  action: AUDIT_ACTIONS.HOSPITAL_PATIENT_UPDATED,
  category: "HOSPITAL",
  entityType: "Patient",
  entityId: patient.id,
  metadata: {
    operation: "patient_demographic_update",
    updatedFields: Object.keys(data),
  },
});

return patient;
}

export async function deactivateHospitalPatient(
  patientId: string,
) {
  const { businessId, userId } = await getHospitalContext();

  const result = await prisma.patient.updateMany({
    where: {
      id: patientId,
      businessId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  if (result.count === 0) {
    throw new HospitalPatientError(
      "Active patient not found.",
      404,
    );
  }
  
  await recordAuditEvent({
  businessId,
  actorId: userId,
  action: AUDIT_ACTIONS.HOSPITAL_PATIENT_DEACTIVATED,
  category: "HOSPITAL",
  entityType: "Patient",
  entityId: patientId,
  metadata: {
    operation: "patient_deactivation",
  },
});

  return { success: true };
}
