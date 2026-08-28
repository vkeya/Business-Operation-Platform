-- CreateTable
CREATE TABLE "ProductSellingUnit" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "sellingPrice" DECIMAL(18,4) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSellingUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSellingUnit_productId_idx" ON "ProductSellingUnit"("productId");

-- AddForeignKey
ALTER TABLE "ProductSellingUnit" ADD CONSTRAINT "ProductSellingUnit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
