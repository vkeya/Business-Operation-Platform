-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM (
    'MONTHLY',
    'ANNUAL'
);

-- CreateEnum
CREATE TYPE "BillingInvoiceStatus" AS ENUM (
    'DRAFT',
    'OPEN',
    'PAID',
    'PARTIALLY_PAID',
    'VOID',
    'UNCOLLECTIBLE'
);

-- CreateEnum
CREATE TYPE "BillingPaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCEEDED',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);

-- AlterTable
ALTER TABLE "BusinessSubscription"
ADD COLUMN "billingCycle" "BillingCycle",
ADD COLUMN "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN "nextBillingDate" TIMESTAMP(3),
ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BillingInvoice" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "status" "BillingInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "plan" "SubscriptionPlan" NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "currency" TEXT NOT NULL,
    "subtotal" DECIMAL(18,4) NOT NULL,
    "taxAmount" DECIMAL(18,4) NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL,
    "amountPaid" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "amountDue" DECIMAL(18,4) NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(18,4) NOT NULL,
    "taxRate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingInvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPayment" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "BillingPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL,
    "providerReference" TEXT,
    "failureReason" TEXT,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessSubscription_nextBillingDate_idx"
ON "BusinessSubscription"("nextBillingDate");

-- CreateIndex
CREATE UNIQUE INDEX "BillingInvoice_businessId_invoiceNumber_key"
ON "BillingInvoice"("businessId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "BillingInvoice_businessId_idx"
ON "BillingInvoice"("businessId");

-- CreateIndex
CREATE INDEX "BillingInvoice_subscriptionId_idx"
ON "BillingInvoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingInvoice_status_idx"
ON "BillingInvoice"("status");

-- CreateIndex
CREATE INDEX "BillingInvoice_dueAt_idx"
ON "BillingInvoice"("dueAt");

-- CreateIndex
CREATE INDEX "BillingInvoice_createdAt_idx"
ON "BillingInvoice"("createdAt");

-- CreateIndex
CREATE INDEX "BillingInvoiceItem_invoiceId_idx"
ON "BillingInvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "BillingPayment_businessId_idx"
ON "BillingPayment"("businessId");

-- CreateIndex
CREATE INDEX "BillingPayment_invoiceId_idx"
ON "BillingPayment"("invoiceId");

-- CreateIndex
CREATE INDEX "BillingPayment_status_idx"
ON "BillingPayment"("status");

-- CreateIndex
CREATE INDEX "BillingPayment_provider_idx"
ON "BillingPayment"("provider");

-- CreateIndex
CREATE INDEX "BillingPayment_providerReference_idx"
ON "BillingPayment"("providerReference");

-- CreateIndex
CREATE INDEX "BillingPayment_createdAt_idx"
ON "BillingPayment"("createdAt");

-- AddForeignKey
ALTER TABLE "BillingInvoice"
ADD CONSTRAINT "BillingInvoice_businessId_fkey"
FOREIGN KEY ("businessId")
REFERENCES "Business"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice"
ADD CONSTRAINT "BillingInvoice_subscriptionId_fkey"
FOREIGN KEY ("subscriptionId")
REFERENCES "BusinessSubscription"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoiceItem"
ADD CONSTRAINT "BillingInvoiceItem_invoiceId_fkey"
FOREIGN KEY ("invoiceId")
REFERENCES "BillingInvoice"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPayment"
ADD CONSTRAINT "BillingPayment_businessId_fkey"
FOREIGN KEY ("businessId")
REFERENCES "Business"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPayment"
ADD CONSTRAINT "BillingPayment_invoiceId_fkey"
FOREIGN KEY ("invoiceId")
REFERENCES "BillingInvoice"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;