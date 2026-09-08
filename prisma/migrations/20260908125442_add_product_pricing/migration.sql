-- CreateEnum
CREATE TYPE "ProductPriceType" AS ENUM ('RETAIL', 'WHOLESALE', 'MINIMUM', 'RATE_1', 'RATE_2', 'RATE_3', 'RATE_4');

-- CreateTable
CREATE TABLE "ProductPrice" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "ProductPriceType" NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductPrice_productId_idx" ON "ProductPrice"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrice_productId_type_key" ON "ProductPrice"("productId", "type");

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
