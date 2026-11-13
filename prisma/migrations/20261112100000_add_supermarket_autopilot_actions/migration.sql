
CREATE TYPE "SupermarketAutopilotActionStatus" AS ENUM (
  'PENDING',
  'ACCEPTED',
  'DISMISSED',
  'SNOOZED',
  'COMPLETED',
  'EXPIRED'
);

CREATE TABLE "SupermarketAutopilotAction" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,

  "actionType" TEXT NOT NULL,
  "productId" TEXT,
  "productName" TEXT NOT NULL,
  "sku" TEXT,

  "priority" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "score" DECIMAL(10,4) NOT NULL,

  "evidence" JSONB,

  "status" "SupermarketAutopilotActionStatus" NOT NULL DEFAULT 'PENDING',

  "snoozedUntil" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "dismissedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SupermarketAutopilotAction_pkey"
    PRIMARY KEY ("id")
);

CREATE INDEX "SupermarketAutopilotAction_businessId_status_idx"
  ON "SupermarketAutopilotAction"("businessId", "status");

CREATE INDEX "SupermarketAutopilotAction_businessId_createdAt_idx"
  ON "SupermarketAutopilotAction"("businessId", "createdAt");

CREATE INDEX "SupermarketAutopilotAction_businessId_actionType_idx"
  ON "SupermarketAutopilotAction"("businessId", "actionType");

CREATE INDEX "SupermarketAutopilotAction_productId_idx"
  ON "SupermarketAutopilotAction"("productId");

ALTER TABLE "SupermarketAutopilotAction"
  ADD CONSTRAINT "SupermarketAutopilotAction_businessId_fkey"
  FOREIGN KEY ("businessId")
  REFERENCES "Business"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
