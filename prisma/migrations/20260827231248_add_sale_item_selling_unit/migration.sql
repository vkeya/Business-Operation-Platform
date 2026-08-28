-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "sellingUnitId" TEXT;

-- CreateIndex
CREATE INDEX "SaleItem_sellingUnitId_idx" ON "SaleItem"("sellingUnitId");

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_sellingUnitId_fkey" FOREIGN KEY ("sellingUnitId") REFERENCES "ProductSellingUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
