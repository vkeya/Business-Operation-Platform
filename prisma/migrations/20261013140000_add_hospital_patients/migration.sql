CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "patientNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "sex" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactRelationship" TEXT,
    "emergencyContactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Patient_businessId_patientNumber_key"
    ON "Patient"("businessId", "patientNumber");

CREATE INDEX "Patient_businessId_idx"
    ON "Patient"("businessId");

CREATE INDEX "Patient_businessId_lastName_firstName_idx"
    ON "Patient"("businessId", "lastName", "firstName");

CREATE INDEX "Patient_phone_idx"
    ON "Patient"("phone");

CREATE INDEX "Patient_email_idx"
    ON "Patient"("email");

ALTER TABLE "Patient"
ADD CONSTRAINT "Patient_businessId_fkey"
FOREIGN KEY ("businessId")
REFERENCES "Business"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;