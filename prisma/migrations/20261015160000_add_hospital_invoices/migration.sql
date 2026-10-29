CREATE TYPE "HospitalInvoiceStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'PARTIALLY_PAID',
    'PAID',
    'VOID'
);

CREATE TABLE "HospitalInvoice" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "status" "HospitalInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL,
    "subtotal" DECIMAL(18,4) NOT NULL,
    "discountTotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(18,4) NOT NULL,
    "amountPaid" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "issuedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalInvoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HospitalInvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unitPrice" DECIMAL(18,4) NOT NULL,
    "discount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(9,4) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,4) NOT NULL,
    "lineTotal" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalInvoiceItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HospitalInvoice_businessId_invoiceNumber_key"
    ON "HospitalInvoice"("businessId", "invoiceNumber");

CREATE INDEX "HospitalInvoice_businessId_patientId_createdAt_idx"
    ON "HospitalInvoice"("businessId", "patientId", "createdAt");

CREATE INDEX "HospitalInvoice_businessId_status_createdAt_idx"
    ON "HospitalInvoice"("businessId", "status", "createdAt");

CREATE INDEX "HospitalInvoiceItem_invoiceId_idx"
    ON "HospitalInvoiceItem"("invoiceId");

ALTER TABLE "HospitalInvoice"
    ADD CONSTRAINT "HospitalInvoice_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalInvoice"
    ADD CONSTRAINT "HospitalInvoice_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HospitalInvoiceItem"
    ADD CONSTRAINT "HospitalInvoiceItem_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "HospitalInvoice"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalInvoicePayment"
    ADD CONSTRAINT "HospitalInvoicePayment_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "HospitalInvoice"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
