-- CreateEnum
CREATE TYPE "BillingInvoiceType" AS ENUM (
    'SUBSCRIPTION_PURCHASE',
    'SUBSCRIPTION_RENEWAL'
);

-- AlterTable
ALTER TABLE "BillingInvoice"
ADD COLUMN "type" "BillingInvoiceType" NOT NULL;
