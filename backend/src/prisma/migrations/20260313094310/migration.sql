/*
  Warnings:

  - You are about to drop the column `createdAt` on the `unit_master` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `unit_master` table. All the data in the column will be lost.
  - You are about to drop the column `gstUom` on the `unit_master` table. All the data in the column will be lost.
  - You are about to drop the column `unitName` on the `unit_master` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `unit_master` table. All the data in the column will be lost.
  - You are about to drop the `gst_uqc_master` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,group_id,sub_group_name]` on the table `account_sub_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,gst_uom]` on the table `unit_master` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `account_sub_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name_of_measurement` to the `unit_master` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gst_uom` to the `unit_master` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_name` to the `unit_master` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `unit_master` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `unit_master` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UnitSource" AS ENUM ('SYSTEM', 'USER');

-- DropForeignKey
ALTER TABLE "unit_master" DROP CONSTRAINT "unit_master_gstUom_fkey";

-- DropIndex
DROP INDEX "account_sub_groups_group_id_sub_group_name_key";

-- DropIndex
DROP INDEX "unit_master_unitName_key";

-- AlterTable
ALTER TABLE "account_sub_groups" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "unit_master" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "gstUom",
DROP COLUMN "unitName",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "full_name_of_measurement" TEXT NOT NULL,
ADD COLUMN     "gst_uom" TEXT NOT NULL,
ADD COLUMN     "source" "UnitSource" NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN     "unit_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "gst_uqc_master";

-- CreateTable
CREATE TABLE "system_uom_library" (
    "id" SERIAL NOT NULL,
    "full_name_of_measurement" TEXT NOT NULL,
    "unit_name" TEXT NOT NULL,
    "uom_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_uom_library_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_sub_groups_userId_group_id_sub_group_name_key" ON "account_sub_groups"("userId", "group_id", "sub_group_name");

-- CreateIndex
CREATE UNIQUE INDEX "unit_master_user_id_gst_uom_key" ON "unit_master"("user_id", "gst_uom");

-- AddForeignKey
ALTER TABLE "unit_master" ADD CONSTRAINT "unit_master_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_sub_groups" ADD CONSTRAINT "account_sub_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
