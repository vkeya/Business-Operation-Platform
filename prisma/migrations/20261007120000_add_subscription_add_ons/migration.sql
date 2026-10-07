-- Checkpoint 22: Subscription Add-On Persistence
-- Adds persistent subscription add-ons without changing existing billing/subscription fields.

CREATE TYPE "SubscriptionAddOnBillingType" AS ENUM (
  'MONTHLY',
  'ANNUAL'
);

CREATE TYPE "SubscriptionAddOnStatus" AS ENUM (
  'ACTIVE',
  'CANCELLED',
  'EXPIRED'
);

CREATE TABLE "SubscriptionAddOn" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "billingType" "SubscriptionAddOnBillingType" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SubscriptionAddOn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessSubscriptionAddOn" (
  "id" TEXT NOT NULL,
  "businessSubscriptionId" TEXT NOT NULL,
  "addOnCode" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "status" "SubscriptionAddOnStatus" NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BusinessSubscriptionAddOn_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubscriptionAddOn_code_key"
  ON "SubscriptionAddOn"("code");

CREATE INDEX "SubscriptionAddOn_active_idx"
  ON "SubscriptionAddOn"("active");

CREATE UNIQUE INDEX "BusinessSubscriptionAddOn_businessSubscriptionId_addOnCode_key"
  ON "BusinessSubscriptionAddOn"("businessSubscriptionId", "addOnCode");

CREATE INDEX "BusinessSubscriptionAddOn_businessSubscriptionId_idx"
  ON "BusinessSubscriptionAddOn"("businessSubscriptionId");

CREATE INDEX "BusinessSubscriptionAddOn_addOnCode_idx"
  ON "BusinessSubscriptionAddOn"("addOnCode");

CREATE INDEX "BusinessSubscriptionAddOn_status_idx"
  ON "BusinessSubscriptionAddOn"("status");

ALTER TABLE "BusinessSubscriptionAddOn"
  ADD CONSTRAINT "BusinessSubscriptionAddOn_businessSubscriptionId_fkey"
  FOREIGN KEY ("businessSubscriptionId")
  REFERENCES "BusinessSubscription"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "BusinessSubscriptionAddOn"
  ADD CONSTRAINT "BusinessSubscriptionAddOn_addOnCode_fkey"
  FOREIGN KEY ("addOnCode")
  REFERENCES "SubscriptionAddOn"("code")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
