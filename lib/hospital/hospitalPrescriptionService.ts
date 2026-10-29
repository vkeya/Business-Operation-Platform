import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { generateBusinessReference } from "@/lib/business/reference/referenceGenerator";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";

export class HospitalPrescriptionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "HospitalPrescriptionError";
    this.statusCode = statusCode;
  }
}

type HospitalPrescriptionItemInput = {
  productId: string;
  quantityPrescribed: number | string;
  dosageInstructions?: string | null;
  duration?: string | null;
  notes?: string | null;
};

type CreateHospitalPrescriptionInput = {
  patientId: string;
  encounterId: string;
  prescriptionDate?: string | Date;
  expiryDate?: string | Date | null;
  prescriberName: string;
  prescriberLicense?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  items: HospitalPrescriptionItemInput[];
};

type ListHospitalPrescriptionsOptions = {
  patientId?: string;
  encounterId?: string;
  skip?: number;
  take?: number;
};

async function getHospitalPrescriptionContext() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

function validatePagination(skip: number, take: number) {
  if (!Number.isInteger(skip) || skip < 0) {
    throw new HospitalPrescriptionError("Invalid pagination offset.");
  }

  if (!Number.isInteger(take) || take < 1 || take > 100) {
    throw new HospitalPrescriptionError(
      "Page size must be between 1 and 100.",
    );
  }
}

function parseDate(value: string | Date | undefined, field: string) {
  if (value === undefined) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new HospitalPrescriptionError(`${field} is invalid.`);
  }

  return date;
}

export async function listHospitalPrescriptions(
  options: ListHospitalPrescriptionsOptions = {},
) {
  const { businessId, userId } =
    await getHospitalPrescriptionContext();

  const skip = options.skip ?? 0;
  const take = options.take ?? 25;
  validatePagination(skip, take);

  const patientId = options.patientId?.trim();
  const encounterId = options.encounterId?.trim();

  if (!patientId && !encounterId) {
    throw new HospitalPrescriptionError(
      "Filter prescriptions by patientId or encounterId.",
    );
  }

  const prescriptions = await prisma.pharmacyPrescription.findMany({
    where: {
      businessId,
      ...(patientId ? { hospitalPatientId: patientId } : {}),
      ...(encounterId ? { hospitalEncounterId: encounterId } : {}),
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  for (const prescription of prescriptions) {
    await recordAuditEvent({
      businessId,
      actorId: userId,
      action: AUDIT_ACTIONS.HOSPITAL_PRESCRIPTION_VIEWED,
      category: "HOSPITAL",
      entityType: "PharmacyPrescription",
      entityId: prescription.id,
      metadata: {
        patientId: prescription.hospitalPatientId,
        encounterId: prescription.hospitalEncounterId,
        accessMode: "list",
      },
    });
  }

  return prescriptions;
}

export async function getHospitalPrescription(prescriptionId: string) {
  const { businessId, userId } =
    await getHospitalPrescriptionContext();

  const id = prescriptionId?.trim();

  if (!id) {
    throw new HospitalPrescriptionError("Prescription ID is required.");
  }

  const prescription = await prisma.pharmacyPrescription.findFirst({
    where: {
      id,
      businessId,
      hospitalPatientId: { not: null },
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
        },
      },
    },
  });

  if (!prescription) {
    throw new HospitalPrescriptionError("Prescription not found.", 404);
  }

  await recordAuditEvent({
    businessId,
    actorId: userId,
    action: AUDIT_ACTIONS.HOSPITAL_PRESCRIPTION_VIEWED,
    category: "HOSPITAL",
    entityType: "PharmacyPrescription",
    entityId: prescription.id,
    metadata: {
      patientId: prescription.hospitalPatientId,
      encounterId: prescription.hospitalEncounterId,
      accessMode: "detail",
    },
  });

  return prescription;
}

export async function createHospitalPrescription(
  input: CreateHospitalPrescriptionInput,
) {
  const { businessId, userId } =
    await getHospitalPrescriptionContext();

  const patientId = input.patientId?.trim();
  const encounterId = input.encounterId?.trim();
  const prescriberName = input.prescriberName?.trim();

  if (!patientId || !encounterId) {
    throw new HospitalPrescriptionError(
      "A patient and encounter are required.",
    );
  }

  if (!prescriberName) {
    throw new HospitalPrescriptionError("Prescriber name is required.");
  }

  if (prescriberName.length > 200) {
    throw new HospitalPrescriptionError(
      "Prescriber name cannot exceed 200 characters.",
    );
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new HospitalPrescriptionError(
      "A prescription must contain at least one medicine.",
    );
  }

  if (input.items.length > 100) {
    throw new HospitalPrescriptionError(
      "A prescription cannot contain more than 100 items.",
    );
  }

  const prescriptionDate =
    parseDate(input.prescriptionDate, "Prescription date") ??
    new Date();
  const expiryDate = parseDate(input.expiryDate ?? undefined, "Expiry date");

  if (expiryDate && expiryDate <= prescriptionDate) {
    throw new HospitalPrescriptionError(
      "Prescription expiry date must be after the prescription date.",
    );
  }

  const prescriberLicense = input.prescriberLicense?.trim() || null;
  const diagnosis = input.diagnosis?.trim() || null;
  const notes = input.notes?.trim() || null;

  if (prescriberLicense && prescriberLicense.length > 100) {
    throw new HospitalPrescriptionError(
      "Prescriber license cannot exceed 100 characters.",
    );
  }

  if (diagnosis && diagnosis.length > 2000) {
    throw new HospitalPrescriptionError(
      "Diagnosis cannot exceed 2,000 characters.",
    );
  }

  if (notes && notes.length > 4000) {
    throw new HospitalPrescriptionError(
      "Prescription notes cannot exceed 4,000 characters.",
    );
  }

  const items = input.items.map((item) => {
    const productId = item.productId?.trim();

    if (!productId) {
      throw new HospitalPrescriptionError(
        "Every prescription item requires a product.",
      );
    }

    let quantity: Prisma.Decimal;

    try {
      quantity = new Prisma.Decimal(item.quantityPrescribed);
    } catch {
      throw new HospitalPrescriptionError(
        "Prescribed quantities must be valid numbers.",
      );
    }

    if (
      !quantity.isFinite() ||
      quantity.lessThanOrEqualTo(0) ||
      quantity.decimalPlaces() > 4
    ) {
      throw new HospitalPrescriptionError(
        "Prescribed quantities must be positive and have at most four decimal places.",
      );
    }

    const dosageInstructions = item.dosageInstructions?.trim() || null;
    const duration = item.duration?.trim() || null;
    const itemNotes = item.notes?.trim() || null;

    if (dosageInstructions && dosageInstructions.length > 1000) {
      throw new HospitalPrescriptionError(
        "Dosage instructions cannot exceed 1,000 characters.",
      );
    }

    if (duration && duration.length > 200) {
      throw new HospitalPrescriptionError(
        "Duration cannot exceed 200 characters.",
      );
    }

    if (itemNotes && itemNotes.length > 1000) {
      throw new HospitalPrescriptionError(
        "Item notes cannot exceed 1,000 characters.",
      );
    }

    return {
      productId,
      quantity,
      dosageInstructions,
      duration,
      notes: itemNotes,
    };
  });

  if (new Set(items.map((item) => item.productId)).size !== items.length) {
    throw new HospitalPrescriptionError(
      "Each medicine may appear only once on a prescription.",
    );
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
        throw new HospitalPrescriptionError(
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
        throw new HospitalPrescriptionError(
          "Encounter not found for this patient in this hospital.",
          404,
        );
      }

      if (
        encounter.status === "COMPLETED" ||
        encounter.status === "CANCELLED"
      ) {
        throw new HospitalPrescriptionError(
          "Prescriptions cannot be created for a completed or cancelled encounter.",
          409,
        );
      }

      const productIds = items.map((item) => item.productId);

      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          businessId,
          status: "ACTIVE",
          pharmacyProduct: {
            is: {
              status: "ACTIVE",
              prescriptionType: { not: "OTC" },
            },
          },
        },
        select: {
          id: true,
          pharmacyProduct: {
            select: { id: true },
          },
        },
      });

      if (products.length !== productIds.length) {
        throw new HospitalPrescriptionError(
          "Every prescribed medicine must be an active pharmacy product owned by this hospital and require a prescription.",
        );
      }

      const prescriptionNumber = await generateBusinessReference({
        businessId,
        referenceType: "PHARMACY_PRESCRIPTION",
        prefix: "RX",
        client: tx,
      });

      const prescription = await tx.pharmacyPrescription.create({
        data: {
          businessId,
          hospitalPatientId: patientId,
          hospitalEncounterId: encounterId,
          prescriptionNumber,
          prescriptionDate,
          expiryDate: expiryDate ?? null,
          prescriberName,
          prescriberLicense,
          diagnosis,
          notes,
          createdBy: userId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantityPrescribed: item.quantity,
              quantityDispensed: new Prisma.Decimal(0),
              dosageInstructions: item.dosageInstructions,
              duration: item.duration,
              notes: item.notes,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
        },
      });

      await recordAuditEvent(
        {
          businessId,
          actorId: userId,
          action: AUDIT_ACTIONS.HOSPITAL_PRESCRIPTION_CREATED,
          category: "HOSPITAL",
          entityType: "PharmacyPrescription",
          entityId: prescription.id,
          metadata: {
            prescriptionNumber: prescription.prescriptionNumber,
            patientId,
            encounterId,
            itemCount: prescription.items.length,
            status: prescription.status,
          },
        },
        tx,
      );

      return prescription;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}
