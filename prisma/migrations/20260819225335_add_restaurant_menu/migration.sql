-- CreateTable
CREATE TABLE "RestaurantMenu" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantMenuItem" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sellingPrice" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RestaurantMenu_businessId_idx" ON "RestaurantMenu"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantMenu_businessId_name_key" ON "RestaurantMenu"("businessId", "name");

-- CreateIndex
CREATE INDEX "RestaurantMenuItem_businessId_idx" ON "RestaurantMenuItem"("businessId");

-- CreateIndex
CREATE INDEX "RestaurantMenuItem_menuId_idx" ON "RestaurantMenuItem"("menuId");

-- CreateIndex
CREATE INDEX "RestaurantMenuItem_productId_idx" ON "RestaurantMenuItem"("productId");

-- AddForeignKey
ALTER TABLE "RestaurantMenu" ADD CONSTRAINT "RestaurantMenu_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantMenuItem" ADD CONSTRAINT "RestaurantMenuItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantMenuItem" ADD CONSTRAINT "RestaurantMenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "RestaurantMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantMenuItem" ADD CONSTRAINT "RestaurantMenuItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
