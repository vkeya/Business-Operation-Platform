-- Hospital laboratory enums
CREATE TYPE "HospitalLabOrderStatus" AS ENUM (
  'ORDERED', 'COLLECTED', 'IN_PROGRESS', 'PARTIALLY_RESULTED',
  'COMPLETED', 'CANCELLED'
);

CREATE TYPE "HospitalLabPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

CREATE TYPE "HospitalLabItemStatus" AS ENUM (
  'ORDERED', 'PROCESSING', 'RESULTED', 'CANCELLED'
);

CREATE TYPE "HospitalSpecimenStatus" AS ENUM (
  'PENDING', 'COLLECTED', 'RECEIVED', 'REJECTED'
);

CREATE TYPE "HospitalLabResultStatus" AS ENUM (
  'DRAFT', 'PRELIMINARY', 'VERIFIED', 'RELEASED', 'AMENDED'
);


-- Hospital laboratory orders
CREATE TABLE "HospitalLabOrder" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "encounterId" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "orderedBy" TEXT NOT NULL,
  "priority" "HospitalLabPriority" NOT NULL DEFAULT 'ROUTINE',
  "status" "HospitalLabOrderStatus" NOT NULL DEFAULT 'ORDERED',
  "clinicalIndication" TEXT,
  "notes" TEXT,
  "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HospitalLabOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalLabOrderItem" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "testCode" TEXT,
  "testName" TEXT NOT NULL,
  "specimenType" TEXT NOT NULL,
  "status" "HospitalLabItemStatus" NOT NULL DEFAULT 'ORDERED',
  "instructions" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HospitalLabOrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalLabSpecimen" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "specimenNumber" TEXT NOT NULL,
  "specimenType" TEXT NOT NULL,
  "status" "HospitalSpecimenStatus" NOT NULL DEFAULT 'PENDING',
  "collectedBy" TEXT,
  "collectedAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HospitalLabSpecimen_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalLabResult" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "specimenId" TEXT,
  "resultValue" TEXT NOT NULL,
  "numericValue" DECIMAL(18,4),
  "unit" TEXT,
  "referenceRange" TEXT,
  "abnormalFlag" TEXT,
  "status" "HospitalLabResultStatus" NOT NULL DEFAULT 'DRAFT',
  "enteredBy" TEXT NOT NULL,
  "verifiedBy" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "releasedBy" TEXT,
  "releasedAt" TIMESTAMP(3),
  "amendmentReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HospitalLabResult_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "HospitalLabResultRevision" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "resultId" TEXT NOT NULL,
  "revision" INTEGER NOT NULL,
  "resultValue" TEXT NOT NULL,
  "numericValue" DECIMAL(18,4),
  "unit" TEXT,
  "referenceRange" TEXT,
  "abnormalFlag" TEXT,
  "status" "HospitalLabResultStatus" NOT NULL,
  "amendedBy" TEXT NOT NULL,
  "amendmentReason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HospitalLabResultRevision_pkey" PRIMARY KEY ("id")
);

-- Laboratory indexes
CREATE UNIQUE INDEX "HospitalLabOrder_businessId_orderNumber_key"
  ON "HospitalLabOrder"("businessId", "orderNumber");
CREATE INDEX "HospitalLabOrder_businessId_patientId_orderedAt_idx"
  ON "HospitalLabOrder"("businessId", "patientId", "orderedAt");
CREATE INDEX "HospitalLabOrder_businessId_encounterId_orderedAt_idx"
  ON "HospitalLabOrder"("businessId", "encounterId", "orderedAt");
CREATE INDEX "HospitalLabOrder_businessId_status_orderedAt_idx"
  ON "HospitalLabOrder"("businessId", "status", "orderedAt");

CREATE INDEX "HospitalLabOrderItem_businessId_orderId_idx"
  ON "HospitalLabOrderItem"("businessId", "orderId");
CREATE INDEX "HospitalLabOrderItem_businessId_testCode_idx"
  ON "HospitalLabOrderItem"("businessId", "testCode");
CREATE INDEX "HospitalLabOrderItem_businessId_status_idx"
  ON "HospitalLabOrderItem"("businessId", "status");

CREATE UNIQUE INDEX "HospitalLabSpecimen_businessId_specimenNumber_key"
  ON "HospitalLabSpecimen"("businessId", "specimenNumber");
CREATE INDEX "HospitalLabSpecimen_businessId_orderItemId_createdAt_idx"
  ON "HospitalLabSpecimen"("businessId", "orderItemId", "createdAt");
CREATE INDEX "HospitalLabSpecimen_businessId_status_createdAt_idx"
  ON "HospitalLabSpecimen"("businessId", "status", "createdAt");

CREATE INDEX "HospitalLabResult_businessId_orderItemId_createdAt_idx"
  ON "HospitalLabResult"("businessId", "orderItemId", "createdAt");
CREATE INDEX "HospitalLabResult_businessId_specimenId_idx"
  ON "HospitalLabResult"("businessId", "specimenId");
CREATE INDEX "HospitalLabResult_businessId_status_createdAt_idx"
  ON "HospitalLabResult"("businessId", "status", "createdAt");

CREATE UNIQUE INDEX "HospitalLabResultRevision_businessId_resultId_revision_key"
  ON "HospitalLabResultRevision"("businessId", "resultId", "revision");
CREATE INDEX "HospitalLabResultRevision_businessId_resultId_createdAt_idx"
  ON "HospitalLabResultRevision"("businessId", "resultId", "createdAt");

-- Foreign keys
ALTER TABLE "HospitalLabOrder"
  ADD CONSTRAINT "HospitalLabOrder_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalLabOrder"
  ADD CONSTRAINT "HospitalLabOrder_patientId_fkey"
  FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalLabOrder"
  ADD CONSTRAINT "HospitalLabOrder_encounterId_fkey"
  FOREIGN KEY ("encounterId") REFERENCES "HospitalEncounter"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalLabOrderItem"
  ADD CONSTRAINT "HospitalLabOrderItem_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalLabOrderItem"
  ADD CONSTRAINT "HospitalLabOrderItem_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "HospitalLabOrder"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalLabSpecimen"
  ADD CONSTRAINT "HospitalLabSpecimen_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalLabSpecimen"
  ADD CONSTRAINT "HospitalLabSpecimen_orderItemId_fkey"
  FOREIGN KEY ("orderItemId") REFERENCES "HospitalLabOrderItem"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalLabResult"
  ADD CONSTRAINT "HospitalLabResult_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalLabResult"
  ADD CONSTRAINT "HospitalLabResult_orderItemId_fkey"
  FOREIGN KEY ("orderItemId") REFERENCES "HospitalLabOrderItem"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalLabResult"
  ADD CONSTRAINT "HospitalLabResult_specimenId_fkey"
  FOREIGN KEY ("specimenId") REFERENCES "HospitalLabSpecimen"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "HospitalLabResultRevision"
  ADD CONSTRAINT "HospitalLabResultRevision_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalLabResultRevision"
  ADD CONSTRAINT "HospitalLabResultRevision_resultId_fkey"
  FOREIGN KEY ("resultId") REFERENCES "HospitalLabResult"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
