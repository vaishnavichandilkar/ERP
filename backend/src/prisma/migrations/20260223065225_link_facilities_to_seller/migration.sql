-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "sellerId" TEXT NOT NULL DEFAULT 'legacy';

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
