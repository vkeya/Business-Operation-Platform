
ALTER TABLE "SupermarketAutopilotAction"
  ADD COLUMN "identityKey" TEXT,
  ADD COLUMN "isCurrent" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- The table is currently empty. Make identityKey mandatory.
ALTER TABLE "SupermarketAutopilotAction"
  ALTER COLUMN "identityKey" SET NOT NULL;

-- Prevent duplicate current recommendations for the same business identity.
CREATE UNIQUE INDEX "SupermarketAutopilotAction_businessId_identityKey_current_key"
  ON "SupermarketAutopilotAction" ("businessId", "identityKey")
  WHERE "isCurrent" = true;
