CREATE TYPE "DataSubjectRequestType" AS ENUM (
  'ACCESS',
  'CORRECTION',
  'DELETION',
  'EXPORT',
  'RESTRICTION',
  'OBJECTION'
);

CREATE TYPE "DataSubjectRequestStatus" AS ENUM (
  'PENDING',
  'IN_REVIEW',
  'COMPLETED',
  'REJECTED',
  'CANCELLED'
);

CREATE TABLE "DataSubjectRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "DataSubjectRequestType" NOT NULL,
  "status" "DataSubjectRequestStatus" NOT NULL DEFAULT 'PENDING',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "notes" TEXT,
  "resultReference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DataSubjectRequest_pkey"
    PRIMARY KEY ("id")
);

CREATE INDEX "DataSubjectRequest_userId_idx"
ON "DataSubjectRequest"("userId");

CREATE INDEX "DataSubjectRequest_status_idx"
ON "DataSubjectRequest"("status");

CREATE INDEX "DataSubjectRequest_type_idx"
ON "DataSubjectRequest"("type");

CREATE INDEX "DataSubjectRequest_requestedAt_idx"
ON "DataSubjectRequest"("requestedAt");

ALTER TABLE "DataSubjectRequest"
ADD CONSTRAINT "DataSubjectRequest_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;