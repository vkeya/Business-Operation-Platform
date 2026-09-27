ALTER TYPE "BusinessReferenceType"
ADD VALUE IF NOT EXISTS 'PHARMACY_PRESCRIPTION';

CREATE TYPE "PharmacyPrescriptionStatus" AS ENUM (
  'ACTIVE',
  'PARTIALLY_DISPENSED',
  'FULLY_DISPENSED',
  'CANCELLED',
  'EXPIRED'
);

CREATE TABLE "PharmacyPrescription" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "customerId" TEXT,
  "saleId" TEXT,
  "prescriptionNumber" TEXT NOT NULL,
  "prescriptionDate" TIMESTAMP(3) NOT NULL,
  "expiryDate" TIMESTAMP(3),
  "prescriberName" TEXT NOT NULL,
  "prescriberLicense" TEXT,
  "diagnosis" TEXT,
  "notes" TEXT,
  "status" "PharmacyPrescriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PharmacyPrescription_pkey"
    PRIMARY KEY ("id")
);

CREATE TABLE "PharmacyPrescriptionItem" (
  "id" TEXT NOT NULL,
  "prescriptionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantityPrescribed" DECIMAL(18,4) NOT NULL,
  "quantityDispensed" DECIMAL(18,4) NOT NULL DEFAULT 0,
  "dosageInstructions" TEXT,
  "duration" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PharmacyPrescriptionItem_pkey"
    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PharmacyPrescription_businessId_prescriptionNumber_key"
ON "PharmacyPrescription"("businessId", "prescriptionNumber");

CREATE INDEX "PharmacyPrescription_businessId_idx"
ON "PharmacyPrescription"("businessId");

CREATE INDEX "PharmacyPrescription_customerId_idx"
ON "PharmacyPrescription"("customerId");

CREATE INDEX "PharmacyPrescription_saleId_idx"
ON "PharmacyPrescription"("saleId");

CREATE INDEX "PharmacyPrescription_prescriptionDate_idx"
ON "PharmacyPrescription"("prescriptionDate");

CREATE INDEX "PharmacyPrescription_expiryDate_idx"
ON "PharmacyPrescription"("expiryDate");

CREATE INDEX "PharmacyPrescription_status_idx"
ON "PharmacyPrescription"("status");

CREATE INDEX "PharmacyPrescriptionItem_prescriptionId_idx"
ON "PharmacyPrescriptionItem"("prescriptionId");

CREATE INDEX "PharmacyPrescriptionItem_productId_idx"
ON "PharmacyPrescriptionItem"("productId");

ALTER TABLE "PharmacyPrescription"
ADD CONSTRAINT "PharmacyPrescription_businessId_fkey"
FOREIGN KEY ("businessId")
REFERENCES "Business"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PharmacyPrescription"
ADD CONSTRAINT "PharmacyPrescription_customerId_fkey"
FOREIGN KEY ("customerId")
REFERENCES "Customer"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "PharmacyPrescription"
ADD CONSTRAINT "PharmacyPrescription_saleId_fkey"
FOREIGN KEY ("saleId")
REFERENCES "Sale"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "PharmacyPrescriptionItem"
ADD CONSTRAINT "PharmacyPrescriptionItem_prescriptionId_fkey"
FOREIGN KEY ("prescriptionId")
REFERENCES "PharmacyPrescription"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "PharmacyPrescriptionItem"
ADD CONSTRAINT "PharmacyPrescriptionItem_productId_fkey"
FOREIGN KEY ("productId")
REFERENCES "Product"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;