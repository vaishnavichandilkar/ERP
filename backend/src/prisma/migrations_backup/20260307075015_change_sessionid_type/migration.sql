/*
  Warnings:

  - The `sessionId` column on the `SellerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SellerProfile" DROP COLUMN "sessionId",
ADD COLUMN     "sessionId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_sessionId_key" ON "SellerProfile"("sessionId");
