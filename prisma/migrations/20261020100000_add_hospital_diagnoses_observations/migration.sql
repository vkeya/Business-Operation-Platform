CREATE TABLE "HospitalDiagnosis" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "classification" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HospitalDiagnosis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalObservation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "observationType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "numericValue" DECIMAL(18,4),
    "unit" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HospitalObservation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HospitalDiagnosis_businessId_encounterId_createdAt_idx"
    ON "HospitalDiagnosis"("businessId", "encounterId", "createdAt");

CREATE INDEX "HospitalDiagnosis_businessId_patientId_createdAt_idx"
    ON "HospitalDiagnosis"("businessId", "patientId", "createdAt");

CREATE INDEX "HospitalDiagnosis_businessId_code_idx"
    ON "HospitalDiagnosis"("businessId", "code");

CREATE INDEX "HospitalObservation_businessId_encounterId_observedAt_idx"
    ON "HospitalObservation"("businessId", "encounterId", "observedAt");

CREATE INDEX "HospitalObservation_businessId_patientId_observedAt_idx"
    ON "HospitalObservation"("businessId", "patientId", "observedAt");

CREATE INDEX "HospitalObservation_businessId_observationType_observedAt_idx"
    ON "HospitalObservation"("businessId", "observationType", "observedAt");

ALTER TABLE "HospitalDiagnosis"
    ADD CONSTRAINT "HospitalDiagnosis_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalDiagnosis"
    ADD CONSTRAINT "HospitalDiagnosis_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalDiagnosis"
    ADD CONSTRAINT "HospitalDiagnosis_encounterId_fkey"
    FOREIGN KEY ("encounterId") REFERENCES "HospitalEncounter"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalObservation"
    ADD CONSTRAINT "HospitalObservation_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalObservation"
    ADD CONSTRAINT "HospitalObservation_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalObservation"
    ADD CONSTRAINT "HospitalObservation_encounterId_fkey"
    FOREIGN KEY ("encounterId") REFERENCES "HospitalEncounter"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
