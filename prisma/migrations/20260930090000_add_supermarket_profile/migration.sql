-- CreateTable
CREATE TABLE "SupermarketProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "storeType" TEXT NOT NULL DEFAULT 'SUPERMARKET',
    "weightedProductsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "batchTrackingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "expiryTrackingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "loyaltyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promotionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoReplenishmentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupermarketProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupermarketProfile_businessId_key"
ON "SupermarketProfile"("businessId");

-- CreateIndex
CREATE INDEX "SupermarketProfile_businessId_idx"
ON "SupermarketProfile"("businessId");

-- AddForeignKey
ALTER TABLE "SupermarketProfile"
ADD CONSTRAINT "SupermarketProfile_businessId_fkey"
FOREIGN KEY ("businessId")
REFERENCES "Business"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;