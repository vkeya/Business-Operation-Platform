-- Proposed migration only. Review the final migration name/order and schema first.
CREATE TYPE "BillingProviderCallbackStatus" AS ENUM (
  'RECEIVED',
  'PROCESSING',
  'PROCESSED',
  'RETRY',
  'REJECTED'
);

CREATE TABLE "BillingProviderCallback" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "reference" TEXT,
  "payload" JSONB NOT NULL,
  "status" "BillingProviderCallbackStatus" NOT NULL DEFAULT 'RECEIVED',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "processedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BillingProviderCallback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BillingProviderCallback_provider_eventKey_key"
  ON "BillingProviderCallback"("provider", "eventKey");
CREATE INDEX "BillingProviderCallback_status_createdAt_idx"
  ON "BillingProviderCallback"("status", "createdAt");
CREATE INDEX "BillingProviderCallback_provider_reference_idx"
  ON "BillingProviderCallback"("provider", "reference");
