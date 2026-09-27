CREATE TYPE "PharmacyControlledRecordStatus" AS ENUM (
  'DISPENSED',
  'REVERSED',
  'CANCELLED'
);

CREATE TABLE "PharmacyControlledDispensingRecord" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "saleId" TEXT NOT NULL,
  "saleItemId" TEXT NOT NULL,
  "pharmacyProductId" TEXT NOT NULL,
  "pharmacyBatchId" TEXT NOT NULL,
  "prescriptionId" TEXT,
  "prescriptionItemId" TEXT,
  "customerId" TEXT,
  "quantity" DECIMAL(18,4) NOT NULL,
  "dispensedBy" TEXT NOT NULL,
  "pharmacistName" TEXT,
  "pharmacistLicense" TEXT,
  "registerReference" TEXT,
  "reason" TEXT,
  "status" "PharmacyControlledRecordStatus" NOT NULL DEFAULT 'DISPENSED',
  "dispensedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reversedAt" TIMESTAMP(3),
  "reversalReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PharmacyControlledDispensingRecord_pkey"
    PRIMARY KEY ("id")
);

CREATE INDEX "PharmacyControlledDispensingRecord_businessId_idx"
  ON "PharmacyControlledDispensingRecord"("businessId");

CREATE INDEX "PharmacyControlledDispensingRecord_saleId_idx"
  ON "PharmacyControlledDispensingRecord"("saleId");

CREATE INDEX "PharmacyControlledDispensingRecord_saleItemId_idx"
  ON "PharmacyControlledDispensingRecord"("saleItemId");

CREATE INDEX "PharmacyControlledDispensingRecord_pharmacyProductId_idx"
  ON "PharmacyControlledDispensingRecord"("pharmacyProductId");

CREATE INDEX "PharmacyControlledDispensingRecord_pharmacyBatchId_idx"
  ON "PharmacyControlledDispensingRecord"("pharmacyBatchId");

CREATE INDEX "PharmacyControlledDispensingRecord_prescriptionId_idx"
  ON "PharmacyControlledDispensingRecord"("prescriptionId");

CREATE INDEX "PharmacyControlledDispensingRecord_prescriptionItemId_idx"
  ON "PharmacyControlledDispensingRecord"("prescriptionItemId");

CREATE INDEX "PharmacyControlledDispensingRecord_customerId_idx"
  ON "PharmacyControlledDispensingRecord"("customerId");

CREATE INDEX "PharmacyControlledDispensingRecord_dispensedBy_idx"
  ON "PharmacyControlledDispensingRecord"("dispensedBy");

CREATE INDEX "PharmacyControlledDispensingRecord_dispensedAt_idx"
  ON "PharmacyControlledDispensingRecord"("dispensedAt");

CREATE INDEX "PharmacyControlledDispensingRecord_status_idx"
  ON "PharmacyControlledDispensingRecord"("status");

CREATE INDEX "PharmacyControlledDispensingRecord_registerReference_idx"
  ON "PharmacyControlledDispensingRecord"("registerReference");

ALTER TABLE "PharmacyControlledDispensingRecord"
  ADD CONSTRAINT "PharmacyControlledDispensingRecord_businessId_fkey"
  FOREIGN KEY ("businessId")
  REFERENCES "Business"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "PharmacyControlledDispensingRecord"
  ADD CONSTRAINT "PharmacyControlledDispensingRecord_saleId_fkey"
  FOREIGN KEY ("saleId")
  REFERENCES "Sale"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "PharmacyControlledDispensingRecord"
  ADD CONSTRAINT "PharmacyControlledDispensingRecord_saleItemId_fkey"
  FOREIGN KEY ("saleItemId")
  REFERENCES "SaleItem"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "PharmacyControlledDispensingRecord"
  ADD CONSTRAINT "PharmacyControlledDispensingRecord_pharmacyProductId_fkey"
  FOREIGN KEY ("pharmacyProductId")
  REFERENCES "PharmacyProduct"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "PharmacyControlledDispensingRecord"
  ADD CONSTRAINT "PharmacyControlledDispensingRecord_pharmacyBatchId_fkey"
  FOREIGN KEY ("pharmacyBatchId")
  REFERENCES "PharmacyBatch"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "PharmacyControlledDispensingRecord"
  ADD CONSTRAINT "PharmacyControlledDispensingRecord_prescriptionId_fkey"
  FOREIGN KEY ("prescriptionId")
  REFERENCES "PharmacyPrescription"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "PharmacyControlledDispensingRecord"
  ADD CONSTRAINT "PharmacyControlledDispensingRecord_prescriptionItemId_fkey"
  FOREIGN KEY ("prescriptionItemId")
  REFERENCES "PharmacyPrescriptionItem"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "PharmacyControlledDispensingRecord"
  ADD CONSTRAINT "PharmacyControlledDispensingRecord_customerId_fkey"
  FOREIGN KEY ("customerId")
  REFERENCES "Customer"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;