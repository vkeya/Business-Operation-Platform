CREATE TYPE "HospitalAppointmentStatus" AS ENUM (
  'SCHEDULED',
  'CONFIRMED',
  'CHECKED_IN',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
);

CREATE TABLE "HospitalAppointment" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "appointmentNumber" TEXT NOT NULL,
  "clinicianId" TEXT,
  "scheduledStart" TIMESTAMP(3) NOT NULL,
  "scheduledEnd" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "notes" TEXT,
  "status" "HospitalAppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "HospitalAppointment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HospitalAppointment_businessId_appointmentNumber_key"
ON "HospitalAppointment"("businessId", "appointmentNumber");

CREATE INDEX "HospitalAppointment_businessId_scheduledStart_idx"
ON "HospitalAppointment"("businessId", "scheduledStart");

CREATE INDEX "HospitalAppointment_businessId_patientId_scheduledStart_idx"
ON "HospitalAppointment"("businessId", "patientId", "scheduledStart");

CREATE INDEX "HospitalAppointment_businessId_clinicianId_scheduledStart_idx"
ON "HospitalAppointment"("businessId", "clinicianId", "scheduledStart");

CREATE INDEX "HospitalAppointment_businessId_status_scheduledStart_idx"
ON "HospitalAppointment"("businessId", "status", "scheduledStart");

ALTER TABLE "HospitalAppointment"
ADD CONSTRAINT "HospitalAppointment_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalAppointment"
ADD CONSTRAINT "HospitalAppointment_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;