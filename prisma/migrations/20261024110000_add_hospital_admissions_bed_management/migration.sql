-- Hospital admissions and bed management.
-- Includes business-scoped foreign keys and active-allocation safeguards.

CREATE TYPE "HospitalAdmissionStatus" AS ENUM (
  'ADMITTED', 'DISCHARGED', 'CANCELLED'
);

CREATE TYPE "HospitalWardType" AS ENUM (
  'GENERAL', 'MATERNITY', 'PAEDIATRIC', 'SURGICAL',
  'MEDICAL', 'ICU', 'EMERGENCY', 'OTHER'
);

CREATE TYPE "HospitalBedStatus" AS ENUM (
  'AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_SERVICE'
);


-- Parent tables

CREATE TABLE "HospitalWard" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "HospitalWardType" NOT NULL DEFAULT 'GENERAL',
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HospitalWard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalBed" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "wardId" TEXT NOT NULL,
  "bedNumber" TEXT NOT NULL,
  "status" "HospitalBedStatus" NOT NULL DEFAULT 'AVAILABLE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HospitalBed_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalAdmission" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "encounterId" TEXT,
  "admissionNumber" TEXT NOT NULL,
  "status" "HospitalAdmissionStatus" NOT NULL DEFAULT 'ADMITTED',
  "admittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dischargedAt" TIMESTAMP(3),
  "admissionReason" TEXT,
  "dischargeNotes" TEXT,
  "clinicianId" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HospitalAdmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalBedAllocation" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "admissionId" TEXT NOT NULL,
  "bedId" TEXT NOT NULL,
  "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt" TIMESTAMP(3),
  "allocatedBy" TEXT NOT NULL,
  "releasedBy" TEXT,
  "releaseReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HospitalBedAllocation_pkey" PRIMARY KEY ("id")
);

-- Compound unique keys required as targets for business-scoped foreign keys.
CREATE UNIQUE INDEX "Patient_businessId_id_key"
  ON "Patient" ("businessId", "id");

CREATE UNIQUE INDEX "HospitalEncounter_businessId_id_key"
  ON "HospitalEncounter" ("businessId", "id");

CREATE UNIQUE INDEX "HospitalWard_businessId_id_key"
  ON "HospitalWard" ("businessId", "id");

CREATE UNIQUE INDEX "HospitalBed_businessId_id_key"
  ON "HospitalBed" ("businessId", "id");

CREATE UNIQUE INDEX "HospitalAdmission_businessId_id_key"
  ON "HospitalAdmission" ("businessId", "id");

-- Ward and bed indexes.
CREATE UNIQUE INDEX "HospitalWard_businessId_code_key"
  ON "HospitalWard" ("businessId", "code");

CREATE INDEX "HospitalWard_businessId_isActive_name_idx"
  ON "HospitalWard" ("businessId", "isActive", "name");

CREATE UNIQUE INDEX "HospitalBed_businessId_wardId_bedNumber_key"
  ON "HospitalBed" ("businessId", "wardId", "bedNumber");

CREATE INDEX "HospitalBed_businessId_status_idx"
  ON "HospitalBed" ("businessId", "status");

CREATE INDEX "HospitalBed_businessId_wardId_status_idx"
  ON "HospitalBed" ("businessId", "wardId", "status");

-- Admission indexes.
CREATE UNIQUE INDEX "HospitalAdmission_businessId_admissionNumber_key"
  ON "HospitalAdmission" ("businessId", "admissionNumber");

CREATE INDEX "HospitalAdmission_businessId_status_admittedAt_idx"
  ON "HospitalAdmission" ("businessId", "status", "admittedAt");

CREATE INDEX "HospitalAdmission_businessId_patientId_admittedAt_idx"
  ON "HospitalAdmission" ("businessId", "patientId", "admittedAt");

CREATE INDEX "HospitalAdmission_businessId_encounterId_idx"
  ON "HospitalAdmission" ("businessId", "encounterId");

-- Allocation indexes.
CREATE INDEX "HospitalBedAllocation_businessId_admissionId_allocatedAt_idx"
  ON "HospitalBedAllocation" ("businessId", "admissionId", "allocatedAt");

CREATE INDEX "HospitalBedAllocation_businessId_bedId_releasedAt_idx"
  ON "HospitalBedAllocation" ("businessId", "bedId", "releasedAt");

-- Only one active allocation may exist for a bed or an admission.
CREATE UNIQUE INDEX "HospitalBedAllocation_one_active_per_bed_key"
  ON "HospitalBedAllocation" ("bedId")
  WHERE "releasedAt" IS NULL;

CREATE UNIQUE INDEX "HospitalBedAllocation_one_active_per_admission_key"
  ON "HospitalBedAllocation" ("admissionId")
  WHERE "releasedAt" IS NULL;

-- Direct business ownership.
ALTER TABLE "HospitalWard"
  ADD CONSTRAINT "HospitalWard_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalBed"
  ADD CONSTRAINT "HospitalBed_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalAdmission"
  ADD CONSTRAINT "HospitalAdmission_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalBedAllocation"
  ADD CONSTRAINT "HospitalBedAllocation_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Related records must belong to the same business.
ALTER TABLE "HospitalBed"
  ADD CONSTRAINT "HospitalBed_businessId_wardId_fkey"
  FOREIGN KEY ("businessId", "wardId")
  REFERENCES "HospitalWard"("businessId", "id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalAdmission"
  ADD CONSTRAINT "HospitalAdmission_businessId_patientId_fkey"
  FOREIGN KEY ("businessId", "patientId")
  REFERENCES "Patient"("businessId", "id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalAdmission"
  ADD CONSTRAINT "HospitalAdmission_businessId_encounterId_fkey"
  FOREIGN KEY ("businessId", "encounterId")
  REFERENCES "HospitalEncounter"("businessId", "id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalBedAllocation"
  ADD CONSTRAINT "HospitalBedAllocation_businessId_admissionId_fkey"
  FOREIGN KEY ("businessId", "admissionId")
  REFERENCES "HospitalAdmission"("businessId", "id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalBedAllocation"
  ADD CONSTRAINT "HospitalBedAllocation_businessId_bedId_fkey"
  FOREIGN KEY ("businessId", "bedId")
  REFERENCES "HospitalBed"("businessId", "id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
