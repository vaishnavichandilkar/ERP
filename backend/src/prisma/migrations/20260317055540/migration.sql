/*
  Warnings:

  - You are about to drop the column `country` on the `account_master` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `account_master` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `account_master` table. All the data in the column will be lost.
  - You are about to drop the column `msme` on the `account_master` table. All the data in the column will be lost.
  - You are about to drop the column `pan` on the `account_master` table. All the data in the column will be lost.
  - You are about to drop the `account_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `account_sub_groups` table. If the table is not empty, all the data it contains will be lost.
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

-- DropForeignKey
ALTER TABLE "account_sub_groups" DROP CONSTRAINT "account_sub_groups_group_id_fkey";

-- DropForeignKey
ALTER TABLE "account_sub_groups" DROP CONSTRAINT "account_sub_groups_userId_fkey";

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

-- DropTable
DROP TABLE "account_groups";

-- DropTable
DROP TABLE "account_sub_groups";

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "group_name" TEXT NOT NULL,
    "parent_id" INTEGER,
    "userId" INTEGER,
    "is_header" BOOLEAN NOT NULL DEFAULT false,
    "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_groups" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "subgroup_name" TEXT NOT NULL,
    "userId" INTEGER,
    "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_sub_groups" (
    "id" SERIAL NOT NULL,
    "sub_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER,
    "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_sub_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_sub_sub_groups" (
    "id" SERIAL NOT NULL,
    "sub_sub_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER,
    "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_sub_sub_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "name" TEXT NOT NULL,
    "userId" INTEGER,
    "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_master_customerCode_key" ON "account_master"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "account_master_code_key" ON "account_master"("code");

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_groups" ADD CONSTRAINT "sub_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_groups" ADD CONSTRAINT "sub_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_sub_groups" ADD CONSTRAINT "sub_sub_groups_sub_group_id_fkey" FOREIGN KEY ("sub_group_id") REFERENCES "sub_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_sub_groups" ADD CONSTRAINT "sub_sub_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_sub_sub_groups" ADD CONSTRAINT "sub_sub_sub_groups_sub_sub_group_id_fkey" FOREIGN KEY ("sub_sub_group_id") REFERENCES "sub_sub_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_sub_sub_groups" ADD CONSTRAINT "sub_sub_sub_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "user_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
