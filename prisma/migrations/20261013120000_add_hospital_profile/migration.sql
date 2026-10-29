-- Create HospitalProfile table
CREATE TABLE "HospitalProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "facilityName" TEXT,
    "facilityType" TEXT,
    "registrationNumber" TEXT,
    "licenseNumber" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Kenya',
    "county" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalProfile_pkey" PRIMARY KEY ("id")
);

-- Ensure one hospital profile per business
CREATE UNIQUE INDEX "HospitalProfile_businessId_key"
ON "HospitalProfile"("businessId");

-- Add indexes for common filters
CREATE INDEX "HospitalProfile_country_idx"
ON "HospitalProfile"("country");

CREATE INDEX "HospitalProfile_county_idx"
ON "HospitalProfile"("county");

CREATE INDEX "HospitalProfile_isActive_idx"
ON "HospitalProfile"("isActive");

-- Link the profile to its business
ALTER TABLE "HospitalProfile"
ADD CONSTRAINT "HospitalProfile_businessId_fkey"
FOREIGN KEY ("businessId")
REFERENCES "Business"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;