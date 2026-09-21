-- CreateTable
CREATE TABLE "OperationRequest" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "entityType" TEXT,
    "entityId" TEXT,
    "response" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationRequest_businessId_operation_idx" ON "OperationRequest"("businessId", "operation");

-- CreateIndex
CREATE INDEX "OperationRequest_businessId_entityType_entityId_idx" ON "OperationRequest"("businessId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationRequest_businessId_operationId_key" ON "OperationRequest"("businessId", "operationId");

-- AddForeignKey
ALTER TABLE "OperationRequest" ADD CONSTRAINT "OperationRequest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
