import "server-only";

import { prisma } from "@/lib/database/prisma";
import { LegalDocumentType } from "@/generated/prisma/client";

export const REQUIRED_REGISTRATION_DOCUMENTS: LegalDocumentType[] = [
  LegalDocumentType.TERMS_OF_SERVICE,
  LegalDocumentType.PRIVACY_POLICY,
  LegalDocumentType.ACCEPTABLE_USE,
];

type PrismaTransactionClient = Parameters<
  typeof prisma.$transaction
>[0] extends (client: infer T) => unknown
  ? T
  : never;

export async function getCurrentRequiredLegalDocuments(
  db: typeof prisma | PrismaTransactionClient = prisma,
) {
  const documents = await db.legalDocument.findMany({
    where: {
      type: {
        in: REQUIRED_REGISTRATION_DOCUMENTS,
      },
      isActive: true,
    },
    orderBy: [
      {
        type: "asc",
      },
      {
        effectiveAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  const byType = new Map<LegalDocumentType, (typeof documents)[number]>();

  for (const document of documents) {
    if (!byType.has(document.type)) {
      byType.set(document.type, document);
    }
  }

  const missing = REQUIRED_REGISTRATION_DOCUMENTS.filter(
    (type) => !byType.has(type),
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing active legal documents: ${missing.join(", ")}`,
    );
  }

  return REQUIRED_REGISTRATION_DOCUMENTS.map(
    (type) => byType.get(type)!,
  );
}

export async function getCurrentLegalDocument(
  type: LegalDocumentType,
  db: typeof prisma | PrismaTransactionClient = prisma,
) {
  return db.legalDocument.findFirst({
    where: {
      type,
      isActive: true,
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