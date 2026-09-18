/*
  Warnings:

  - A unique constraint covering the columns `[paymentAttemptId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentAttemptId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentAttemptId_key" ON "Payment"("paymentAttemptId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentAttemptId_fkey" FOREIGN KEY ("paymentAttemptId") REFERENCES "PaymentAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
