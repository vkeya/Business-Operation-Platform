-- CreateEnum
CREATE TYPE "MpesaMerchantType" AS ENUM ('TILL', 'PAYBILL');

-- CreateEnum
CREATE TYPE "MpesaEnvironment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateTable
CREATE TABLE "MpesaConfiguration" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "merchantType" "MpesaMerchantType" NOT NULL,
    "shortcode" TEXT NOT NULL,
    "environment" "MpesaEnvironment" NOT NULL DEFAULT 'SANDBOX',
    "consumerKey" TEXT NOT NULL,
    "encryptedConsumerSecret" TEXT NOT NULL,
    "encryptedPasskey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MpesaConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MpesaConfiguration_businessId_key" ON "MpesaConfiguration"("businessId");

-- CreateIndex
CREATE INDEX "MpesaConfiguration_businessId_idx" ON "MpesaConfiguration"("businessId");

-- CreateIndex
CREATE INDEX "MpesaConfiguration_shortcode_idx" ON "MpesaConfiguration"("shortcode");

-- AddForeignKey
ALTER TABLE "MpesaConfiguration" ADD CONSTRAINT "MpesaConfiguration_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
