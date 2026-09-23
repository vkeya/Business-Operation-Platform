import "server-only";

import { prisma } from "@/lib/database/prisma";
import { LegalDocumentType } from "@/generated/prisma/client";
import { getCurrentRequiredLegalDocuments } from "./legalDocumentService";

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

export interface LegalAcceptanceInput {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  acceptableUseAccepted: boolean;
}

export function validateRequiredLegalAcceptance(
  input: LegalAcceptanceInput,
) {
  if (!input.termsAccepted) {
    return "You must accept the Terms of Service.";
  }

  if (!input.privacyAccepted) {
    return "You must acknowledge the Privacy Policy.";
  }

  if (!input.acceptableUseAccepted) {
    return "You must accept the Acceptable Use Policy.";
  }

  return null;
}

export async function recordRequiredLegalAcceptance(
  tx: PrismaTransactionClient,
  userId: string,
  input: LegalAcceptanceInput,
  metadata: {
    ipAddress?: string;
    userAgent?: string;
  },
) {
  const documents = await getCurrentRequiredLegalDocuments(tx);

  const acceptedTypes = new Set<LegalDocumentType>();

  if (input.termsAccepted) {
    acceptedTypes.add(LegalDocumentType.TERMS_OF_SERVICE);
  }

  if (input.privacyAccepted) {
    acceptedTypes.add(LegalDocumentType.PRIVACY_POLICY);
  }

  if (input.acceptableUseAccepted) {
    acceptedTypes.add(LegalDocumentType.ACCEPTABLE_USE);
  }

  for (const document of documents) {
    if (!acceptedTypes.has(document.type)) {
      continue;
    }

    await tx.legalAcceptance.create({
      data: {
        userId,
        documentId: document.id,
        documentVersion: document.version,
        accepted: true,
        acceptedAt: new Date(),
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      },
    });
  }
}

export interface LegalAcceptanceStatus {
  documentId: string;
  type: string;
  title: string;
  currentVersion: string;
  acceptedVersion: string | null;
  acceptedAt: Date | null;
  accepted: boolean;
  requiresReacceptance: boolean;
}

export interface RequiredLegalAcceptanceStatus {
  allAccepted: boolean;
  requiresReacceptance: boolean;
  documents: LegalAcceptanceStatus[];
}

export async function getRequiredLegalAcceptanceStatus(
  userId: string,
  db: typeof prisma | PrismaTransactionClient = prisma,
): Promise<RequiredLegalAcceptanceStatus> {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error("User ID is required.");
  }

  const documents = await getCurrentRequiredLegalDocuments(db);

  /*
   * Retrieve the user's acceptance history together with the
   * legal document type. This is intentionally NOT restricted
   * to the currently active document IDs because historical
   * versions are required to determine whether reacceptance
   * is necessary.
   */
  const acceptances = await db.legalAcceptance.findMany({
    where: {
      userId: normalizedUserId,
      accepted: true,
    },
    include: {
      document: {
        select: {
          type: true,
          version: true,
        },
      },
    },
    orderBy: {
      acceptedAt: "desc",
    },
  });

  /*
   * Keep the latest accepted version for each legal document type.
   */
  const latestAcceptanceByType = new Map<
    LegalDocumentType,
    (typeof acceptances)[number]
  >();

  for (const acceptance of acceptances) {
    const type = acceptance.document.type;

    if (!latestAcceptanceByType.has(type)) {
      latestAcceptanceByType.set(type, acceptance);
    }
  }

  const statuses: LegalAcceptanceStatus[] = documents.map(
    (document) => {
      const acceptance =
        latestAcceptanceByType.get(document.type);

      const acceptedVersion =
        acceptance?.documentVersion ??
        acceptance?.document.version ??
        null;

      const accepted =
        Boolean(acceptance) &&
        acceptedVersion === document.version;

      return {
        documentId: document.id,
        type: document.type,
        title: document.title,
        currentVersion: document.version,
        acceptedVersion,
        acceptedAt: acceptance?.acceptedAt ?? null,
        accepted,
        requiresReacceptance: !accepted,
      };
    },
  );

  const requiresReacceptance = statuses.some(
    (status) => status.requiresReacceptance,
  );

  return {
    allAccepted: !requiresReacceptance,
    requiresReacceptance,
    documents: statuses,
  };
}

export async function requireCurrentLegalAcceptance(
  userId: string,
  db: typeof prisma | PrismaTransactionClient = prisma,
) {
  const status =
    await getRequiredLegalAcceptanceStatus(userId, db);

  if (!status.allAccepted) {
    const pendingDocuments = status.documents
      .filter(
        (document) => document.requiresReacceptance,
      )
      .map((document) => document.type);

    throw new Error(
      `Current legal acceptance required for: ${pendingDocuments.join(
        ", ",
      )}`,
    );
  }

  return status;
}