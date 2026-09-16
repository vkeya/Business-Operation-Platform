-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "taxName" TEXT,
ADD COLUMN     "taxPricingMode" "TaxPricingMode",
ADD COLUMN     "taxRate" DECIMAL(8,4);
