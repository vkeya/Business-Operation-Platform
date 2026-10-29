-- Hospital imaging schema foundation

CREATE TYPE "HospitalImagingPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

CREATE TYPE "HospitalImagingOrderStatus" AS ENUM ('ORDERED', 'IN_PROGRESS', 'PARTIALLY_COMPLETED', 'COMPLETED', 'CANCELLED');

CREATE TYPE "HospitalImagingItemStatus" AS ENUM ('ORDERED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TYPE "HospitalImagingStudyStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

CREATE TYPE "HospitalImagingReportStatus" AS ENUM ('DRAFT', 'PRELIMINARY', 'VERIFIED', 'RELEASED', 'AMENDED');

ALTER TYPE "BusinessReferenceType" ADD VALUE 'HOSPITAL_IMAGING_ORDER';

CREATE TABLE "HospitalImagingOrder" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderedBy" TEXT NOT NULL,
    "priority" "HospitalImagingPriority" NOT NULL DEFAULT 'ROUTINE',
    "status" "HospitalImagingOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "clinicalIndication" TEXT,
    "notes" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalImagingOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalImagingOrderItem" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "studyName" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "bodySite" TEXT NOT NULL,
    "laterality" TEXT,
    "instructions" TEXT,
    "status" "HospitalImagingItemStatus" NOT NULL DEFAULT 'ORDERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalImagingOrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalImagingStudy" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "studyNumber" TEXT NOT NULL,
    "status" "HospitalImagingStudyStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "performedBy" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalImagingStudy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalImagingReport" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "studyId" TEXT,
    "findings" TEXT NOT NULL,
    "impression" TEXT NOT NULL,
    "recommendations" TEXT,
    "status" "HospitalImagingReportStatus" NOT NULL DEFAULT 'DRAFT',
    "enteredBy" TEXT NOT NULL,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "releasedBy" TEXT,
    "releasedAt" TIMESTAMP(3),
    "amendmentReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalImagingReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalImagingReportRevision" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "findings" TEXT NOT NULL,
    "impression" TEXT NOT NULL,
    "recommendations" TEXT,
    "status" "HospitalImagingReportStatus" NOT NULL,
    "amendedBy" TEXT NOT NULL,
    "amendmentReason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HospitalImagingReportRevision_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HospitalImagingOrder_businessId_patientId_orderedAt_idx" ON "HospitalImagingOrder"("businessId", "patientId", "orderedAt");

CREATE INDEX "HospitalImagingOrder_businessId_encounterId_orderedAt_idx" ON "HospitalImagingOrder"("businessId", "encounterId", "orderedAt");

CREATE INDEX "HospitalImagingOrder_businessId_status_orderedAt_idx" ON "HospitalImagingOrder"("businessId", "status", "orderedAt");

CREATE UNIQUE INDEX "HospitalImagingOrder_businessId_orderNumber_key" ON "HospitalImagingOrder"("businessId", "orderNumber");

CREATE INDEX "HospitalImagingOrderItem_businessId_orderId_createdAt_idx" ON "HospitalImagingOrderItem"("businessId", "orderId", "createdAt");

CREATE INDEX "HospitalImagingOrderItem_businessId_modality_status_created_idx" ON "HospitalImagingOrderItem"("businessId", "modality", "status", "createdAt");

CREATE INDEX "HospitalImagingStudy_businessId_orderItemId_createdAt_idx" ON "HospitalImagingStudy"("businessId", "orderItemId", "createdAt");

CREATE INDEX "HospitalImagingStudy_businessId_status_scheduledAt_idx" ON "HospitalImagingStudy"("businessId", "status", "scheduledAt");

CREATE UNIQUE INDEX "HospitalImagingStudy_businessId_studyNumber_key" ON "HospitalImagingStudy"("businessId", "studyNumber");

CREATE INDEX "HospitalImagingReport_businessId_orderItemId_createdAt_idx" ON "HospitalImagingReport"("businessId", "orderItemId", "createdAt");

CREATE INDEX "HospitalImagingReport_businessId_studyId_idx" ON "HospitalImagingReport"("businessId", "studyId");

CREATE INDEX "HospitalImagingReport_businessId_status_createdAt_idx" ON "HospitalImagingReport"("businessId", "status", "createdAt");

CREATE INDEX "HospitalImagingReportRevision_businessId_reportId_createdAt_idx" ON "HospitalImagingReportRevision"("businessId", "reportId", "createdAt");

CREATE UNIQUE INDEX "HospitalImagingReportRevision_businessId_reportId_revision_key" ON "HospitalImagingReportRevision"("businessId", "reportId", "revision");

ALTER TABLE "HospitalImagingOrder" ADD CONSTRAINT "HospitalImagingOrder_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingOrder" ADD CONSTRAINT "HospitalImagingOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingOrder" ADD CONSTRAINT "HospitalImagingOrder_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "HospitalEncounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingOrderItem" ADD CONSTRAINT "HospitalImagingOrderItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingOrderItem" ADD CONSTRAINT "HospitalImagingOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "HospitalImagingOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingStudy" ADD CONSTRAINT "HospitalImagingStudy_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingStudy" ADD CONSTRAINT "HospitalImagingStudy_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "HospitalImagingOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingReport" ADD CONSTRAINT "HospitalImagingReport_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingReport" ADD CONSTRAINT "HospitalImagingReport_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "HospitalImagingOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingReport" ADD CONSTRAINT "HospitalImagingReport_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "HospitalImagingStudy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingReportRevision" ADD CONSTRAINT "HospitalImagingReportRevision_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalImagingReportRevision" ADD CONSTRAINT "HospitalImagingReportRevision_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "HospitalImagingReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
