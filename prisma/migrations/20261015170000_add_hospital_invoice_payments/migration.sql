CREATE TABLE IF NOT EXISTS "HospitalInvoicePayment" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HospitalInvoicePayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "HospitalInvoicePayment_businessId_reference_key"
    ON "HospitalInvoicePayment"("businessId", "reference");

CREATE INDEX IF NOT EXISTS "HospitalInvoicePayment_businessId_invoiceId_createdAt_idx"
    ON "HospitalInvoicePayment"("businessId", "invoiceId", "createdAt");

CREATE INDEX IF NOT EXISTS "HospitalInvoicePayment_invoiceId_idx"
    ON "HospitalInvoicePayment"("invoiceId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'HospitalInvoicePayment_businessId_fkey'
          AND conrelid = '"HospitalInvoicePayment"'::regclass
    ) THEN
        ALTER TABLE "HospitalInvoicePayment"
            ADD CONSTRAINT "HospitalInvoicePayment_businessId_fkey"
            FOREIGN KEY ("businessId")
            REFERENCES "Business"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;