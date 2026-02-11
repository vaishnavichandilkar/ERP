/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mobile]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT,
ADD COLUMN     "isApprovedBySuperAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOtpVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isProfileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobile" TEXT;

-- CreateTable
CREATE TABLE "admin_business_details" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "proofOfBusiness" TEXT NOT NULL,
    "udyogAadhar" TEXT,
    "gstCertificate" TEXT,
    "otherDocument" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_business_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_business_details_adminId_key" ON "admin_business_details"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- AddForeignKey
ALTER TABLE "admin_business_details" ADD CONSTRAINT "admin_business_details_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
