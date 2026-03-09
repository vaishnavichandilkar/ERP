-- CreateEnum
CREATE TYPE "ContactPrefix" AS ENUM ('Mr', 'Mrs', 'Miss', 'Ms');

-- CreateTable
CREATE TABLE "account_master" (
    "id" SERIAL NOT NULL,
    "accountName" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "vendorCode" TEXT NOT NULL,
    "msme" TEXT,
    "pan" TEXT NOT NULL,
    "gstNo" TEXT,
    "openingBalance" DECIMAL(65,30) DEFAULT 0,
    "creditDays" INTEGER,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "area" TEXT,
    "pincode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "prefix" "ContactPrefix",
    "contactPersonName" TEXT,
    "emailId" TEXT,
    "mobileNo" TEXT,
    "accountHolderName" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_master_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_master_vendorCode_key" ON "account_master"("vendorCode");
