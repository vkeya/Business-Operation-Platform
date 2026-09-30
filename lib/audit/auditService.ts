import { prisma } from "@/lib/database/prisma";

import { sanitizeAuditData } from "./auditSanitizer";
import type { RecordAuditEventInput } from "./auditTypes";

type AuditDbClient = Pick<typeof prisma, "auditEvent">;

export async function recordAuditEvent(
  input: RecordAuditEventInput,
  client: AuditDbClient = prisma,
) {
  const businessId = input.businessId?.trim() || null;

  return client.auditEvent.create({
    data: {
      businessId,

      actorId: input.actorId ?? null,

      action: input.action,
      category: input.category ?? "BUSINESS",
      severity: input.severity ?? "INFO",
      outcome: input.outcome ?? "SUCCESS",

      entityType: input.entityType,
      entityId: input.entityId ?? null,

      beforeData:
        input.beforeData !== undefined
          ? sanitizeAuditData(input.beforeData)
          : undefined,

      afterData:
        input.afterData !== undefined
          ? sanitizeAuditData(input.afterData)
          : undefined,

      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,

      requestId: input.requestId ?? null,
      correlationId: input.correlationId ?? null,

      metadata:
        input.metadata !== undefined
          ? sanitizeAuditData(input.metadata)
          : undefined,
    },
  });
}