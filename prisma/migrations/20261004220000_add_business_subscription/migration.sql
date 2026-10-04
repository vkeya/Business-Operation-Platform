CREATE TYPE "SubscriptionPlan" AS ENUM (
  'FREE_TRIAL',
  'STARTER',
  'PROFESSIONAL',
  'BUSINESS'
);

CREATE TYPE "SubscriptionStatus" AS ENUM (
  'TRIALING',
  'ACTIVE',
  'EXPIRED',
  'CANCELLED'
);

CREATE TABLE "BusinessSubscription" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "plan" "SubscriptionPlan" NOT NULL,
  "status" "SubscriptionStatus" NOT NULL,
  "trialStartedAt" TIMESTAMP(3),
  "trialEndsAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BusinessSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BusinessSubscription_businessId_key"
ON "BusinessSubscription"("businessId");

CREATE INDEX "BusinessSubscription_status_idx"
ON "BusinessSubscription"("status");

CREATE INDEX "BusinessSubscription_trialEndsAt_idx"
ON "BusinessSubscription"("trialEndsAt");

ALTER TABLE "BusinessSubscription"
ADD CONSTRAINT "BusinessSubscription_businessId_fkey"
FOREIGN KEY ("businessId")
REFERENCES "Business"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;