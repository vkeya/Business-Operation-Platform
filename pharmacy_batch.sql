-- CreateTable
CREATE TABLE "PharmacyBatch" (
    "id" TEXT NOT NULL,
    "pharmacyProductId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "manufacturingDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "supplierId" TEXT,
    "purchaseId" TEXT,
    "purchaseItemId" TEXT,
    "quantityReceived" DECIMAL(18,4) NOT NULL,
    "quantityRemaining" DECIMAL(18,4) NOT NULL,
    "unitCost" DECIMAL(18,4),
    "isRecalled" BOOLEAN NOT NULL DEFAULT false,
    "recallReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PharmacyBatch_pharmacyProductId_idx" ON "PharmacyBatch"("pharmacyProductId");

-- CreateIndex
CREATE INDEX "PharmacyBatch_batchNumber_idx" ON "PharmacyBatch"("batchNumber");

-- CreateIndex
CREATE INDEX "PharmacyBatch_expiryDate_idx" ON "PharmacyBatch"("expiryDate");

-- CreateIndex
CREATE INDEX "PharmacyBatch_supplierId_idx" ON "PharmacyBatch"("supplierId");

-- CreateIndex
CREATE INDEX "PharmacyBatch_purchaseId_idx" ON "PharmacyBatch"("purchaseId");

-- CreateIndex
CREATE INDEX "PharmacyBatch_isRecalled_idx" ON "PharmacyBatch"("isRecalled");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyBatch_pharmacyProductId_batchNumber_key" ON "PharmacyBatch"("pharmacyProductId", "batchNumber");


-- AddForeignKey
ALTER TABLE "PharmacyBatch" ADD CONSTRAINT "PharmacyBatch_pharmacyProductId_fkey" FOREIGN KEY ("pharmacyProductId") REFERENCES "PharmacyProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyBatch" ADD CONSTRAINT "PharmacyBatch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyBatch" ADD CONSTRAINT "PharmacyBatch_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

