-- ADMIN-1.1
-- Extend AuditEvent for platform-wide audit infrastructure

ALTER TABLE "AuditEvent"
    ADD COLUMN "category" TEXT NOT NULL DEFAULT 'BUSINESS',
    ADD COLUMN "severity" TEXT NOT NULL DEFAULT 'INFO',
    ADD COLUMN "outcome" TEXT NOT NULL DEFAULT 'SUCCESS',
    ADD COLUMN "requestId" TEXT,
    ADD COLUMN "correlationId" TEXT,
    ADD COLUMN "metadata" JSONB;

-- Query optimization for tenant-scoped audit views
CREATE INDEX "AuditEvent_businessId_createdAt_idx"
    ON "AuditEvent"("businessId", "createdAt");

CREATE INDEX "AuditEvent_businessId_action_idx"
    ON "AuditEvent"("businessId", "action");

CREATE INDEX "AuditEvent_businessId_category_idx"
    ON "AuditEvent"("businessId", "category");

CREATE INDEX "AuditEvent_businessId_severity_idx"
    ON "AuditEvent"("businessId", "severity");

CREATE INDEX "AuditEvent_businessId_outcome_idx"
    ON "AuditEvent"("businessId", "outcome");

CREATE INDEX "AuditEvent_actorId_createdAt_idx"
    ON "AuditEvent"("actorId", "createdAt");