/*
  Warnings:

  - You are about to drop the column `logourl` on the `Business` table. All the data in the column will be lost.

*/

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "logourl",
ADD COLUMN "logoUrl" TEXT;