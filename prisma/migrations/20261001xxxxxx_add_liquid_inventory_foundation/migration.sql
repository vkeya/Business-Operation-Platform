-- WS-01: Liquid Inventory Foundation

CREATE TYPE "InventoryMode" AS ENUM (
  'DISCRETE',
  'LIQUID'
);

CREATE TYPE "InventoryContainerType" AS ENUM (
  'BOTTLE',
  'KEG',
  'CAN',
  'JAR',
  'OTHER'
);

CREATE TYPE "InventoryContainerStatus" AS ENUM (
  'SEALED',
  'OPEN',
  'EMPTY',
  'DISPOSED'
);

ALTER TABLE "Product"
ADD COLUMN "inventoryMode" "InventoryMode" NOT NULL DEFAULT 'DISCRETE';

CREATE TABLE "InventoryContainer" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,

  "containerType" "InventoryContainerType" NOT NULL,
  "status" "InventoryContainerStatus" NOT NULL DEFAULT 'SEALED',

  "capacityQuantity" DECIMAL(18,4) NOT NULL,
  "remainingQuantity" DECIMAL(18,4) NOT NULL,
  "unit" TEXT NOT NULL,

  "unitCost" DECIMAL(18,4),

  "referenceType" TEXT,
  "referenceId" TEXT,

  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "openedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),

  "notes" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "InventoryContainer_pkey"
    PRIMARY KEY ("id")
);

CREATE INDEX "InventoryContainer_businessId_idx"
  ON "InventoryContainer"("businessId");

CREATE INDEX "InventoryContainer_productId_idx"
  ON "InventoryContainer"("productId");

CREATE INDEX "InventoryContainer_warehouseId_idx"
  ON "InventoryContainer"("warehouseId");

CREATE INDEX "InventoryContainer_productId_warehouseId_idx"
  ON "InventoryContainer"("productId", "warehouseId");

CREATE INDEX "InventoryContainer_status_idx"
  ON "InventoryContainer"("status");

CREATE INDEX "InventoryContainer_referenceType_referenceId_idx"
  ON "InventoryContainer"("referenceType", "referenceId");

ALTER TABLE "InventoryContainer"
ADD CONSTRAINT "InventoryContainer_businessId_fkey"
FOREIGN KEY ("businessId")
REFERENCES "Business"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "InventoryContainer"
ADD CONSTRAINT "InventoryContainer_productId_fkey"
FOREIGN KEY ("productId")
REFERENCES "Product"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "InventoryContainer"
ADD CONSTRAINT "InventoryContainer_warehouseId_fkey"
FOREIGN KEY ("warehouseId")
REFERENCES "Warehouse"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;