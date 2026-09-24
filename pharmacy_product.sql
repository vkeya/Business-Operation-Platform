-- CreateEnum
CREATE TYPE "PharmacyMedicineType" AS ENUM ('MEDICINE', 'SUPPLEMENT', 'MEDICAL_DEVICE', 'PERSONAL_CARE', 'OTHER');

-- CreateEnum
CREATE TYPE "PharmacyPrescriptionType" AS ENUM ('OTC', 'PRESCRIPTION', 'CONTROLLED');

-- CreateEnum
CREATE TYPE "PharmacyProductStatus" AS ENUM ('ACTIVE', 'DISCONTINUED', 'RECALLED');

-- CreateTable
CREATE TABLE "PharmacyProduct" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "medicineType" "PharmacyMedicineType" NOT NULL,
    "prescriptionType" "PharmacyPrescriptionType" NOT NULL DEFAULT 'OTC',
    "activeIngredient" TEXT,
    "strength" TEXT,
    "dosageForm" TEXT,
    "routeOfAdministration" TEXT,
    "manufacturer" TEXT,
    "registrationNumber" TEXT,
    "packSize" TEXT,
    "status" "PharmacyProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyProduct_productId_key" ON "PharmacyProduct"("productId");

-- CreateIndex
CREATE INDEX "PharmacyProduct_medicineType_idx" ON "PharmacyProduct"("medicineType");

-- CreateIndex
CREATE INDEX "PharmacyProduct_prescriptionType_idx" ON "PharmacyProduct"("prescriptionType");

-- CreateIndex
CREATE INDEX "PharmacyProduct_status_idx" ON "PharmacyProduct"("status");

-- CreateIndex
CREATE INDEX "PharmacyProduct_manufacturer_idx" ON "PharmacyProduct"("manufacturer");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSellingUnit_productId_name_quantity_unit_key" ON "ProductSellingUnit"("productId", "name", "quantity", "unit");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_productId_key" ON "RecipeIngredient"("recipeId", "productId");

-- AddForeignKey
ALTER TABLE "PharmacyProduct" ADD CONSTRAINT "PharmacyProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

