/*
  Warnings:

  - You are about to drop the `user_groups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_groups" DROP CONSTRAINT "user_groups_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "user_groups" DROP CONSTRAINT "user_groups_userId_fkey";

-- DropTable
DROP TABLE "user_groups";
