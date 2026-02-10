/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `modules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_permissions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ADMINISTRATOR', 'OPERATOR');

-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_roleId_fkey";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
DROP COLUMN "isVerified",
DROP COLUMN "roleId",
ADD COLUMN     "facilityId" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- DropTable
DROP TABLE "modules";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "user_permissions";

-- CreateTable
CREATE TABLE "administrator_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facilityManagement_add" BOOLEAN NOT NULL DEFAULT false,
    "facilityManagement_view" BOOLEAN NOT NULL DEFAULT false,
    "facilityManagement_edit" BOOLEAN NOT NULL DEFAULT false,
    "facilityManagement_delete" BOOLEAN NOT NULL DEFAULT false,
    "facilityManagement_export" BOOLEAN NOT NULL DEFAULT false,
    "facilityManagement_print" BOOLEAN NOT NULL DEFAULT false,
    "userManagement_add" BOOLEAN NOT NULL DEFAULT false,
    "userManagement_view" BOOLEAN NOT NULL DEFAULT false,
    "userManagement_edit" BOOLEAN NOT NULL DEFAULT false,
    "userManagement_delete" BOOLEAN NOT NULL DEFAULT false,
    "userManagement_export" BOOLEAN NOT NULL DEFAULT false,
    "userManagement_print" BOOLEAN NOT NULL DEFAULT false,
    "productManagement_add" BOOLEAN NOT NULL DEFAULT false,
    "productManagement_view" BOOLEAN NOT NULL DEFAULT false,
    "productManagement_edit" BOOLEAN NOT NULL DEFAULT false,
    "productManagement_delete" BOOLEAN NOT NULL DEFAULT false,
    "productManagement_export" BOOLEAN NOT NULL DEFAULT false,
    "productManagement_print" BOOLEAN NOT NULL DEFAULT false,
    "inventoryManagement_add" BOOLEAN NOT NULL DEFAULT false,
    "inventoryManagement_view" BOOLEAN NOT NULL DEFAULT false,
    "inventoryManagement_edit" BOOLEAN NOT NULL DEFAULT false,
    "inventoryManagement_delete" BOOLEAN NOT NULL DEFAULT false,
    "inventoryManagement_export" BOOLEAN NOT NULL DEFAULT false,
    "inventoryManagement_print" BOOLEAN NOT NULL DEFAULT false,
    "billing_add" BOOLEAN NOT NULL DEFAULT false,
    "billing_view" BOOLEAN NOT NULL DEFAULT false,
    "billing_edit" BOOLEAN NOT NULL DEFAULT false,
    "billing_delete" BOOLEAN NOT NULL DEFAULT false,
    "billing_export" BOOLEAN NOT NULL DEFAULT false,
    "billing_print" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "administrator_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facilityManagement_view" BOOLEAN NOT NULL DEFAULT false,
    "productManagement_view" BOOLEAN NOT NULL DEFAULT false,
    "inventoryManagement_view" BOOLEAN NOT NULL DEFAULT false,
    "billing_view" BOOLEAN NOT NULL DEFAULT false,
    "report_view" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "operator_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrator_access_userId_key" ON "administrator_access"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "operator_access_userId_key" ON "operator_access"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "administrator_access" ADD CONSTRAINT "administrator_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_access" ADD CONSTRAINT "operator_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
