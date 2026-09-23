CREATE TYPE "LegalDocumentType" AS ENUM (
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
  'ACCEPTABLE_USE',
  'COOKIE_POLICY',
  'PAYMENT_REFUND',
  'SERVICE_LEVEL',
  'DPA'
);

CREATE TABLE "LegalDocument" (
  "id" TEXT NOT NULL,
  "type" "LegalDocumentType" NOT NULL,
  "version" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "effectiveAt" TIMESTAMP(3) NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegalAcceptance" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "documentVersion" TEXT NOT NULL,
  "accepted" BOOLEAN NOT NULL DEFAULT true,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  "userAgent" TEXT,

  CONSTRAINT "LegalAcceptance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegalDocument_type_version_key"
ON "LegalDocument"("type", "version");

CREATE INDEX "LegalDocument_type_isActive_idx"
ON "LegalDocument"("type", "isActive");

CREATE UNIQUE INDEX "LegalAcceptance_userId_documentId_key"
ON "LegalAcceptance"("userId", "documentId");

CREATE INDEX "LegalAcceptance_userId_idx"
ON "LegalAcceptance"("userId");

CREATE INDEX "LegalAcceptance_documentId_idx"
ON "LegalAcceptance"("documentId");

ALTER TABLE "LegalAcceptance"
ADD CONSTRAINT "LegalAcceptance_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "LegalAcceptance"
ADD CONSTRAINT "LegalAcceptance_documentId_fkey"
FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
