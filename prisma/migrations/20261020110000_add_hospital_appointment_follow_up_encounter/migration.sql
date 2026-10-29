ALTER TABLE "HospitalAppointment"
ADD COLUMN "followUpFromEncounterId" TEXT;

CREATE INDEX "HospitalAppointment_businessId_followUpFromEncounterId_idx"
ON "HospitalAppointment"("businessId", "followUpFromEncounterId");

ALTER TABLE "HospitalAppointment"
ADD CONSTRAINT "HospitalAppointment_followUpFromEncounterId_fkey"
FOREIGN KEY ("followUpFromEncounterId")
REFERENCES "HospitalEncounter"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
