-- Checkpoint 62: paid capacity add-on billing metadata and invoice type

ALTER TYPE "BillingInvoiceType" ADD VALUE IF NOT EXISTS 'SUBSCRIPTION_ADD_ON';

ALTER TABLE "BillingInvoice"
  ADD COLUMN IF NOT EXISTS "addOnCode" TEXT,
  ADD COLUMN IF NOT EXISTS "addOnQuantity" INTEGER;

CREATE INDEX IF NOT EXISTS "BillingInvoice_addOnCode_idx"
  ON "BillingInvoice"("addOnCode");

INSERT INTO "SubscriptionAddOn" ("id", "code", "name", "description", "billingType", "active", "createdAt", "updatedAt")
VALUES
  ('seed_additional_user', 'ADDITIONAL_USER', 'Additional User', 'Additional user capacity beyond the Professional plan allowance.', 'MONTHLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_additional_branch', 'ADDITIONAL_BRANCH', 'Additional Branch', 'Additional branch capacity beyond the Professional plan allowance.', 'MONTHLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE
SET "name" = EXCLUDED."name",
    "description" = EXCLUDED."description",
    "billingType" = EXCLUDED."billingType",
    "active" = EXCLUDED."active",
    "updatedAt" = CURRENT_TIMESTAMP;
