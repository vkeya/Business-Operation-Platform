-- CreateEnum
CREATE TYPE "BusinessReferenceType" AS ENUM ('PRODUCT_SKU', 'SALE', 'PURCHASE', 'PAYMENT', 'EXPENSE', 'JOURNAL_ENTRY', 'INVENTORY_MOVEMENT');

-- CreateTable
CREATE TABLE "BusinessReferenceCounter" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "referenceType" "BusinessReferenceType" NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessReferenceCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessReferenceCounter_businessId_idx" ON "BusinessReferenceCounter"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessReferenceCounter_businessId_referenceType_key" ON "BusinessReferenceCounter"("businessId", "referenceType");

-- AddForeignKey
ALTER TABLE "BusinessReferenceCounter" ADD CONSTRAINT "BusinessReferenceCounter_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
