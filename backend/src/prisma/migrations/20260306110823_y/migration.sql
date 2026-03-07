-- AlterTable
ALTER TABLE "SellerDocument" ALTER COLUMN "profileId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "SellerDocument" ADD CONSTRAINT "SellerDocument_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
