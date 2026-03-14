-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('PENDING_OTP', 'PENDING_PROFILE', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('buyer', 'seller', 'superadmin', 'administrator', 'operator');

-- CreateEnum
CREATE TYPE "SellerDocumentType" AS ENUM ('PAN', 'GST', 'AADHAR', 'BANK', 'OTHER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FacilityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ContactPrefix" AS ENUM ('Mr', 'Mrs', 'Miss', 'Ms');

-- CreateEnum
CREATE TYPE "MasterStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "UnitSource" AS ENUM ('SYSTEM', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "username" TEXT,
    "selected_language" TEXT,
    "role" "Role" NOT NULL DEFAULT 'buyer',
    "refresh_token" TEXT,
    "onboarded_at" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "isFirstApprovalLogin" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" SERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "profile_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopDetail" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "shopName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "village" TEXT,
    "pinCode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDetail" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "holderName" TEXT NOT NULL,
    "accountNo" TEXT NOT NULL,
    "ifsc" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "panNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerDocument" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER,
    "type" "SellerDocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT,
    "uploadedByUserId" INTEGER,
    "name" TEXT,
    "size" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userType" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "sessionId" SERIAL NOT NULL,
    "addressId" INTEGER,
    "sellerId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "onHoldUntil" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerStepReview" (
    "id" SERIAL NOT NULL,
    "sellerProfileId" INTEGER NOT NULL,
    "step" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "data" JSONB,
    "remark" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerStepReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pincode" (
    "id" SERIAL NOT NULL,
    "pincode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pincode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_master" (
    "id" SERIAL NOT NULL,
    "accountName" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "gstNo" TEXT,
    "panNo" TEXT NOT NULL,
    "creditDays" INTEGER NOT NULL,
    "openingBalance" DECIMAL(65,30) NOT NULL,
    "balanceType" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "pincode" TEXT NOT NULL,
    "area" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "msmeStatus" BOOLEAN NOT NULL DEFAULT false,
    "msmeRegNo" TEXT,
    "regType" TEXT,
    "regUnder" TEXT,
    "accountHolderName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "prefix" "ContactPrefix" NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "emailId" TEXT,
    "mobileNo" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_uom_library" (
    "id" SERIAL NOT NULL,
    "full_name_of_measurement" TEXT NOT NULL,
    "unit_name" TEXT NOT NULL,
    "uom_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_uom_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_master" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "unit_name" TEXT NOT NULL,
    "gst_uom" TEXT NOT NULL,
    "full_name_of_measurement" TEXT NOT NULL,
    "source" "UnitSource" NOT NULL DEFAULT 'SYSTEM',
    "status" "UnitStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_groups" (
    "id" SERIAL NOT NULL,
    "group_name" TEXT NOT NULL,
    "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_sub_groups" (
    "id" SERIAL NOT NULL,
    "sub_group_name" TEXT NOT NULL,
    "group_id" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_sub_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_phone_number_key" ON "user_profiles"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "ShopDetail_userId_key" ON "ShopDetail"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetail_userId_key" ON "BankDetail"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetail_accountNo_key" ON "BankDetail"("accountNo");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_phone_key" ON "Otp"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_jti_key" ON "sessions"("jti");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_userId_key" ON "SellerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_sessionId_key" ON "SellerProfile"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerStepReview_sellerProfileId_step_key" ON "SellerStepReview"("sellerProfileId", "step");

-- CreateIndex
CREATE UNIQUE INDEX "Pincode_pincode_key" ON "Pincode"("pincode");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "account_master_code_key" ON "account_master"("code");

-- CreateIndex
CREATE UNIQUE INDEX "unit_master_user_id_gst_uom_key" ON "unit_master"("user_id", "gst_uom");

-- CreateIndex
CREATE UNIQUE INDEX "account_groups_group_name_key" ON "account_groups"("group_name");

-- CreateIndex
CREATE UNIQUE INDEX "account_sub_groups_userId_group_id_sub_group_name_key" ON "account_sub_groups"("userId", "group_id", "sub_group_name");

-- AddForeignKey
ALTER TABLE "ShopDetail" ADD CONSTRAINT "ShopDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetail" ADD CONSTRAINT "BankDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerDocument" ADD CONSTRAINT "SellerDocument_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerDocument" ADD CONSTRAINT "SellerDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerStepReview" ADD CONSTRAINT "SellerStepReview_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_master" ADD CONSTRAINT "unit_master_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_sub_groups" ADD CONSTRAINT "account_sub_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "account_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_sub_groups" ADD CONSTRAINT "account_sub_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
