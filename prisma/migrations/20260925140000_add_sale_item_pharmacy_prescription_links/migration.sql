ALTER TABLE "SaleItem"
ADD COLUMN "prescriptionId" TEXT,
ADD COLUMN "prescriptionItemId" TEXT;

CREATE INDEX "SaleItem_prescriptionId_idx"
ON "SaleItem"("prescriptionId");

CREATE INDEX "SaleItem_prescriptionItemId_idx"
ON "SaleItem"("prescriptionItemId");

ALTER TABLE "SaleItem"
ADD CONSTRAINT "SaleItem_prescriptionId_fkey"
FOREIGN KEY ("prescriptionId")
REFERENCES "PharmacyPrescription"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "SaleItem"
ADD CONSTRAINT "SaleItem_prescriptionItemId_fkey"
FOREIGN KEY ("prescriptionItemId")
REFERENCES "PharmacyPrescriptionItem"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;