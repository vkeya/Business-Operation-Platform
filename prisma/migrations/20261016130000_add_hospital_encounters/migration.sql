CREATE TYPE "HospitalEncounterType" AS ENUM (
  'OUTPATIENT',
  'EMERGENCY',
  'FOLLOW_UP',
  'INPATIENT'
);

CREATE TYPE "HospitalEncounterStatus" AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE "HospitalEncounter" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "appointmentId" TEXT,
  "encounterNumber" TEXT NOT NULL,
  "type" "HospitalEncounterType" NOT NULL,
  "status" "HospitalEncounterStatus" NOT NULL DEFAULT 'OPEN',
  "clinicianId" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),

  CONSTRAINT "HospitalEncounter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HospitalEncounter_businessId_encounterNumber_key"
ON "HospitalEncounter"("businessId", "encounterNumber");

CREATE INDEX "HospitalEncounter_businessId_patientId_createdAt_idx"
ON "HospitalEncounter"("businessId", "patientId", "createdAt");

CREATE INDEX "HospitalEncounter_businessId_appointmentId_idx"
ON "HospitalEncounter"("businessId", "appointmentId");

CREATE INDEX "HospitalEncounter_businessId_status_createdAt_idx"
ON "HospitalEncounter"("businessId", "status", "createdAt");

CREATE INDEX "HospitalEncounter_businessId_clinicianId_createdAt_idx"
ON "HospitalEncounter"("businessId", "clinicianId", "createdAt");

ALTER TABLE "HospitalEncounter"
ADD CONSTRAINT "HospitalEncounter_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalEncounter"
ADD CONSTRAINT "HospitalEncounter_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalEncounter"
ADD CONSTRAINT "HospitalEncounter_appointmentId_fkey"
FOREIGN KEY ("appointmentId") REFERENCES "HospitalAppointment"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
