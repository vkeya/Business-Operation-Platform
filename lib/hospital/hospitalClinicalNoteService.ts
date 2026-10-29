import { prisma } from "@/lib/database/prisma";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";
import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireHospitalBusiness } from "@/lib/hospital/hospitalAccessService";
import type { BusinessType } from "@/types";

export class HospitalClinicalNoteError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "HospitalClinicalNoteError";
    this.statusCode = statusCode;
  }
}

export const HOSPITAL_CLINICAL_NOTE_TYPES = [
  "INITIAL_ASSESSMENT",
  "PROGRESS",
  "CONSULTATION",
  "DISCHARGE_SUMMARY",
] as const;

export type HospitalClinicalNoteType =
  (typeof HOSPITAL_CLINICAL_NOTE_TYPES)[number];

type ListHospitalClinicalNotesOptions = {
  encounterId?: string;
  patientId?: string;
  skip?: number;
  take?: number;
};

type CreateHospitalClinicalNoteInput = {
  encounterId: string;
  patientId: string;
  noteType: HospitalClinicalNoteType;
  content: string;
};

async function getHospitalClinicalNoteContext() {
  const context = await getCurrentBusinessContext();

  requireHospitalBusiness(context.business.type as BusinessType);

  return {
    businessId: context.business.id,
    userId: context.user.id,
  };
}

function validatePagination(skip: number, take: number) {
  if (!Number.isInteger(skip) || skip < 0) {
    throw new HospitalClinicalNoteError("Invalid pagination offset.");
  }

  if (!Number.isInteger(take) || take < 1 || take > 100) {
    throw new HospitalClinicalNoteError(
      "Page size must be between 1 and 100.",
    );
  }
}

export async function listHospitalClinicalNotes(
  options: ListHospitalClinicalNotesOptions = {},
) {
  const { businessId, userId } =
    await getHospitalClinicalNoteContext();

  const skip = options.skip ?? 0;
  const take = options.take ?? 25;

  validatePagination(skip, take);

  const encounterId = options.encounterId?.trim();
  const patientId = options.patientId?.trim();

  if (!encounterId && !patientId) {
    throw new HospitalClinicalNoteError(
      "Filter notes by encounterId or patientId.",
    );
  }

  const where = {
    businessId,
    ...(encounterId ? { encounterId } : {}),
    ...(patientId ? { patientId } : {}),
  };

  const notes = await prisma.hospitalClinicalNote.findMany({
    where,
    select: {
      id: true,
      businessId: true,
      patientId: true,
      encounterId: true,
      authorId: true,
      noteType: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  for (const note of notes) {
    await recordAuditEvent({
      businessId,
      actorId: userId,
      action: AUDIT_ACTIONS.HOSPITAL_CLINICAL_NOTE_VIEWED,
      category: "HOSPITAL",
      entityType: "HospitalClinicalNote",
      entityId: note.id,
      metadata: {
        encounterId: note.encounterId,
        patientId: note.patientId,
        accessMode: "list",
      },
    });
  }

  return notes;
}

export async function getHospitalClinicalNote(noteId: string) {
  const { businessId, userId } =
    await getHospitalClinicalNoteContext();

  const id = noteId?.trim();

  if (!id) {
    throw new HospitalClinicalNoteError(
      "Clinical note ID is required.",
    );
  }

  const note = await prisma.hospitalClinicalNote.findFirst({
    where: {
      id,
      businessId,
    },
    select: {
      id: true,
      businessId: true,
      patientId: true,
      encounterId: true,
      authorId: true,
      noteType: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!note) {
    throw new HospitalClinicalNoteError(
      "Clinical note not found.",
      404,
    );
  }

  await recordAuditEvent({
    businessId,
    actorId: userId,
    action: AUDIT_ACTIONS.HOSPITAL_CLINICAL_NOTE_VIEWED,
    category: "HOSPITAL",
    entityType: "HospitalClinicalNote",
    entityId: note.id,
    metadata: {
      encounterId: note.encounterId,
      patientId: note.patientId,
      accessMode: "detail",
    },
  });

  return note;
}

export async function createHospitalClinicalNote(
  input: CreateHospitalClinicalNoteInput,
) {
  const { businessId, userId } =
    await getHospitalClinicalNoteContext();

  const patientId = input.patientId?.trim();
  const encounterId = input.encounterId?.trim();
  const content = input.content?.trim();

  if (!patientId) {
    throw new HospitalClinicalNoteError("A patient is required.");
  }

  if (!encounterId) {
    throw new HospitalClinicalNoteError("An encounter is required.");
  }

  if (
    !HOSPITAL_CLINICAL_NOTE_TYPES.includes(input.noteType)
  ) {
    throw new HospitalClinicalNoteError("Invalid clinical note type.");
  }

  if (!content) {
    throw new HospitalClinicalNoteError(
      "Clinical note content is required.",
    );
  }

  if (content.length > 20000) {
    throw new HospitalClinicalNoteError(
      "Clinical note content cannot exceed 20,000 characters.",
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
      throw new HospitalClinicalNoteError(
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
      select: {
        id: true,
        status: true,
      },
    });

    if (!encounter) {
      throw new HospitalClinicalNoteError(
        "Encounter not found for this patient in this hospital.",
        404,
      );
    }

    if (
      encounter.status === "CANCELLED" ||
      encounter.status === "COMPLETED"
    ) {
      throw new HospitalClinicalNoteError(
        "Clinical notes can only be added to open or in-progress encounters.",
        409,
      );
    }

    const note = await tx.hospitalClinicalNote.create({
      data: {
        businessId,
        patientId,
        encounterId,
        authorId: userId,
        noteType: input.noteType,
        content,
      },
      select: {
        id: true,
        businessId: true,
        patientId: true,
        encounterId: true,
        authorId: true,
        noteType: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await recordAuditEvent(
      {
        businessId,
        actorId: userId,
        action: AUDIT_ACTIONS.HOSPITAL_CLINICAL_NOTE_CREATED,
        category: "HOSPITAL",
        entityType: "HospitalClinicalNote",
        entityId: note.id,
        metadata: {
          encounterId,
          patientId,
          noteType: input.noteType,
        },
      },
      tx,
    );

    return note;
  });
}
