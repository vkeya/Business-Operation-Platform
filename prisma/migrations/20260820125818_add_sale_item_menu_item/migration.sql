-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "menuItemId" TEXT;

-- CreateIndex
CREATE INDEX "SaleItem_menuItemId_idx" ON "SaleItem"("menuItemId");

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "RestaurantMenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
