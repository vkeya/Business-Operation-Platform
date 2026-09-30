import type { AuditAction } from "./auditActions";
import type { Prisma } from "../../generated/prisma/client";

export type AuditCategory =
  | "AUTH"
  | "USER"
  | "BUSINESS"
  | "INVENTORY"
  | "SALES"
  | "PURCHASES"
  | "ACCOUNTING"
  | "PAYMENTS"
  | "ETIMS"
  | "PHARMACY"
  | "ADMIN"
  | "SECURITY"
  | "SYSTEM";

export type AuditSeverity =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "CRITICAL";

export type AuditOutcome =
  | "SUCCESS"
  | "FAILED"
  | "DENIED";

export interface RecordAuditEventInput {
  businessId?: string;
  actorId?: string | null;

  action: AuditAction;
  category?: AuditCategory;
  severity?: AuditSeverity;
  outcome?: AuditOutcome;

  entityType: string;
  entityId?: string | null;

  beforeData?: Prisma.InputJsonValue;
  afterData?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;

  ipAddress?: string | null;
  userAgent?: string | null;

  requestId?: string | null;
  correlationId?: string | null;


}