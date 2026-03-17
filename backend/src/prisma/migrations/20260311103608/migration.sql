/*
  Warnings:

  - A unique constraint covering the columns `[gstUom]` on the table `unit_master` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "unit_master_unitName_key";

-- CreateIndex
CREATE UNIQUE INDEX "unit_master_gstUom_key" ON "unit_master"("gstUom");
