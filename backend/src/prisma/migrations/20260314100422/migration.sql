/*
  Warnings:

  - You are about to drop the column `isActive` on the `account_master` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerCode]` on the table `account_master` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vendorCode]` on the table `account_master` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "account_master" DROP COLUMN "isActive",
ADD COLUMN     "customerCode" TEXT,
ADD COLUMN     "isCustomer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVendor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "vendorCode" TEXT,
ALTER COLUMN "groupName" DROP NOT NULL,
ALTER COLUMN "code" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "account_master_customerCode_key" ON "account_master"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "account_master_vendorCode_key" ON "account_master"("vendorCode");
