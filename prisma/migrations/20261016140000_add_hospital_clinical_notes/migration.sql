-- CreateTable
CREATE TABLE "HospitalClinicalNote" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'PROGRESS',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalClinicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HospitalClinicalNote_businessId_encounterId_createdAt_idx"
ON "HospitalClinicalNote"("businessId", "encounterId", "createdAt");

-- CreateIndex
CREATE INDEX "HospitalClinicalNote_businessId_patientId_createdAt_idx"
ON "HospitalClinicalNote"("businessId", "patientId", "createdAt");

-- CreateIndex
CREATE INDEX "HospitalClinicalNote_businessId_authorId_createdAt_idx"
ON "HospitalClinicalNote"("businessId", "authorId", "createdAt");

-- AddForeignKey
ALTER TABLE "HospitalClinicalNote"
ADD CONSTRAINT "HospitalClinicalNote_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalClinicalNote"
ADD CONSTRAINT "HospitalClinicalNote_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalClinicalNote"
ADD CONSTRAINT "HospitalClinicalNote_encounterId_fkey"
FOREIGN KEY ("encounterId") REFERENCES "HospitalEncounter"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
