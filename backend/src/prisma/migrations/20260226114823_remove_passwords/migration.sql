/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `administrators` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `operators` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "refresh_token";

-- AlterTable
ALTER TABLE "administrators" DROP COLUMN "passwordHash";

-- AlterTable
ALTER TABLE "operators" DROP COLUMN "passwordHash";
