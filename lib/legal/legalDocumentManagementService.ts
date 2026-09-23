import "server-only";

import { prisma } from "@/lib/database/prisma";
import { LegalDocumentType } from "@/generated/prisma/client";

export interface CreateLegalDocumentInput {
  type: LegalDocumentType;
  version: string;
  title: string;
  effectiveAt: Date;
  publishedAt?: Date;
  activate?: boolean;
}

function validateVersion(version: string) {
  const normalized = version.trim();

  if (!normalized) {
    throw new Error("Legal document version is required.");
  }

  if (normalized.length > 50) {
    throw new Error("Legal document version is too long.");
  }

  return normalized;
}

function validateTitle(title: string) {
  const normalized = title.trim();

  if (!normalized) {
    throw new Error("Legal document title is required.");
  }

  if (normalized.length > 255) {
    throw new Error("Legal document title is too long.");
  }

  return normalized;
}

export async function createLegalDocument(
  input: CreateLegalDocumentInput,
) {
  const version = validateVersion(input.version);
  const title = validateTitle(input.title);

  if (!(input.effectiveAt instanceof Date)) {
    throw new Error("Effective date is required.");
  }

  return prisma.$transaction(async (tx) => {
    if (input.activate) {
      await tx.legalDocument.updateMany({
        where: {
          type: input.type,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    return tx.legalDocument.create({
      data: {
        type: input.type,
        version,
        title,
        effectiveAt: input.effectiveAt,
        publishedAt: input.publishedAt ?? new Date(),
        isActive: Boolean(input.activate),
      },
    });
  });
}

export async function activateLegalDocument(
  documentId: string,
) {
  const id = documentId.trim();

  if (!id) {
    throw new Error("Legal document ID is required.");
  }

  return prisma.$transaction(async (tx) => {
    const document = await tx.legalDocument.findUnique({
      where: {
        id,
      },
    });

    if (!document) {
      throw new Error("Legal document not found.");
    }

    await tx.legalDocument.updateMany({
      where: {
        type: document.type,
        isActive: true,
        id: {
          not: document.id,
        },
      },
      data: {
        isActive: false,
      },
    });

    return tx.legalDocument.update({
      where: {
        id: document.id,
      },
      data: {
        isActive: true,
        publishedAt: document.publishedAt ?? new Date(),
      },
    });
  });
}

export async function deactivateLegalDocument(
  documentId: string,
) {
  const id = documentId.trim();

  if (!id) {
    throw new Error("Legal document ID is required.");
  }

  return prisma.$transaction(async (tx) => {
    const document = await tx.legalDocument.findUnique({
      where: {
        id,
      },
    });

    if (!document) {
      throw new Error("Legal document not found.");
    }

    const activeDocumentsOfType =
      await tx.legalDocument.count({
        where: {
          type: document.type,
          isActive: true,
        },
      });

    if (
      document.isActive &&
      activeDocumentsOfType <= 1
    ) {
      throw new Error(
        `Cannot deactivate the only active ${document.type} document.`,
      );
    }

    return tx.legalDocument.update({
      where: {
        id: document.id,
      },
      data: {
        isActive: false,
      },
    });
  });
}

export async function getLegalDocumentHistory(
  type: LegalDocumentType,
) {
  return prisma.legalDocument.findMany({
    where: {
      type,
    },
    orderBy: [
      {
        effectiveAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}