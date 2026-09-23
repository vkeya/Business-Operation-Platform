import "server-only";

import { prisma } from "@/lib/database/prisma";
import {
  getCurrentRequiredLegalDocuments,
} from "./legalDocumentService";
import {
  getRequiredLegalAcceptanceStatus,
  type LegalAcceptanceInput,
} from "./legalAcceptanceService";

export async function recordCurrentLegalReacceptance(
  userId: string,
  input: LegalAcceptanceInput,
  metadata: {
    ipAddress?: string;
    userAgent?: string;
  },
) {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error("User ID is required.");
  }

  if (!input.termsAccepted) {
    throw new Error(
      "You must accept the Terms of Service.",
    );
  }

  if (!input.privacyAccepted) {
    throw new Error(
      "You must acknowledge the Privacy Policy.",
    );
  }

  if (!input.acceptableUseAccepted) {
    throw new Error(
      "You must accept the Acceptable Use Policy.",
    );
  }

  return prisma.$transaction(
  async (tx) => {
    const documents =
      await getCurrentRequiredLegalDocuments(tx);

    const status =
      await getRequiredLegalAcceptanceStatus(
        normalizedUserId,
        tx,
      );

    const acceptanceByType = new Map<
      string,
      boolean
    >([
      [
        "TERMS_OF_SERVICE",
        input.termsAccepted,
      ],
      [
        "PRIVACY_POLICY",
        input.privacyAccepted,
      ],
      [
        "ACCEPTABLE_USE",
        input.acceptableUseAccepted,
      ],
    ]);

    for (const document of documents) {
      const accepted =
        acceptanceByType.get(document.type) === true;

      if (!accepted) {
        throw new Error(
          `Required acceptance missing for ${document.type}.`,
        );
      }

      const existing = status.documents.find(
        (item) => item.type === document.type,
      );

      /*
       * If the user already accepted this exact version,
       * do not rewrite the audit timestamp.
       */
      if (
        existing?.accepted &&
        existing.currentVersion === document.version
      ) {
        continue;
      }

      /*
       * Each legal version has its own LegalDocument ID.
       * Upsert therefore protects against concurrent/repeated
       * submissions without overwriting an already accepted
       * version.
       */
      await tx.legalAcceptance.upsert({
        where: {
          userId_documentId: {
            userId: normalizedUserId,
            documentId: document.id,
          },
        },
        update: {
          accepted: true,
          documentVersion: document.version,
          acceptedAt: new Date(),
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        },
        create: {
          userId: normalizedUserId,
          documentId: document.id,
          documentVersion: document.version,
          accepted: true,
          acceptedAt: new Date(),
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        },
      });
    }

    return getRequiredLegalAcceptanceStatus(
      normalizedUserId,
      tx,
    );
    },
    {
      maxWait: 10_000,
      timeout: 20_000,
    },
  );
}