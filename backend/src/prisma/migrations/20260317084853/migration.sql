/*
  Warnings:

  - The `status` column on the `account_groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `country` on the `account_master` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `account_master` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `account_master` table. All the data in the column will be lost.
  - You are about to drop the column `msme` on the `account_master` table. All the data in the column will be lost.
  - You are about to drop the column `pan` on the `account_master` table. All the data in the column will be lost.
  - The `status` column on the `account_sub_groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[customerCode]` on the table `account_master` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `account_master` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `balanceType` to the `account_master` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panNo` to the `account_master` table without a default value. This is not possible if the table is not empty.
  - Made the column `openingBalance` on table `account_master` required. This step will fail if there are existing NULL values in that column.
  - Made the column `creditDays` on table `account_master` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prefix` on table `account_master` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contactPersonName` on table `account_master` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mobileNo` on table `account_master` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accountHolderName` on table `account_master` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bankName` on table `account_master` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accountNumber` on table `account_master` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ifscCode` on table `account_master` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MasterStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "account_groups" DROP COLUMN "status",
ADD COLUMN     "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "account_master" DROP COLUMN "country",
DROP COLUMN "group",
DROP COLUMN "isActive",
DROP COLUMN "msme",
DROP COLUMN "pan",
ADD COLUMN     "balanceType" TEXT NOT NULL,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "customerCode" TEXT,
ADD COLUMN     "groupName" TEXT,
ADD COLUMN     "isCustomer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVendor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "msmeRegNo" TEXT,
ADD COLUMN     "msmeStatus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "panNo" TEXT NOT NULL,
ADD COLUMN     "regType" TEXT,
ADD COLUMN     "regUnder" TEXT,
ADD COLUMN     "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "vendorCode" DROP NOT NULL,
ALTER COLUMN "openingBalance" SET NOT NULL,
ALTER COLUMN "openingBalance" DROP DEFAULT,
ALTER COLUMN "creditDays" SET NOT NULL,
ALTER COLUMN "prefix" SET NOT NULL,
ALTER COLUMN "contactPersonName" SET NOT NULL,
ALTER COLUMN "mobileNo" SET NOT NULL,
ALTER COLUMN "accountHolderName" SET NOT NULL,
ALTER COLUMN "bankName" SET NOT NULL,
ALTER COLUMN "accountNumber" SET NOT NULL,
ALTER COLUMN "ifscCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "account_sub_groups" DROP COLUMN "status",
ADD COLUMN     "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "account_master_customerCode_key" ON "account_master"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "account_master_code_key" ON "account_master"("code");
