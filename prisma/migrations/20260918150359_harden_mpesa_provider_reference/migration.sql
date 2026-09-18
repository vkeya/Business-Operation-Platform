/*
  Warnings:

  - A unique constraint covering the columns `[businessId,provider,providerReference]` on the table `PaymentAttempt` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PaymentAttempt_provider_providerReference_idx";

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_businessId_provider_providerReference_key" ON "PaymentAttempt"("businessId", "provider", "providerReference");
