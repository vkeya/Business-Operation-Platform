ALTER TABLE "PharmacyPrescription"
  ADD COLUMN "hospitalPatientId" TEXT,
  ADD COLUMN "hospitalEncounterId" TEXT;

CREATE INDEX "PharmacyPrescription_hospitalPatientId_idx"
  ON "PharmacyPrescription"("hospitalPatientId");

CREATE INDEX "PharmacyPrescription_hospitalEncounterId_idx"
  ON "PharmacyPrescription"("hospitalEncounterId");

ALTER TABLE "PharmacyPrescription"
  ADD CONSTRAINT "PharmacyPrescription_hospitalPatientId_fkey"
  FOREIGN KEY ("hospitalPatientId")
  REFERENCES "Patient"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "PharmacyPrescription"
  ADD CONSTRAINT "PharmacyPrescription_hospitalEncounterId_fkey"
  FOREIGN KEY ("hospitalEncounterId")
  REFERENCES "HospitalEncounter"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
