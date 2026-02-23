# WeighPro Testing Guide

This guide provides a comprehensive step-by-step walkthrough to test the **WeighPro Backend** using **Swagger UI**.

**Prerequisites**:
1.  **Server Running**: `npm run start:dev`
2.  **Database Seeded**: `npx ts-node src/prisma/seed.ts` (Creates default Super Admin with phone: `admin_phone`)
3.  **Swagger URL**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🚀 Phase 1: Seller Onboarding (Strict 6-Step Flow)

**Goal**: Register as a new Seller, provide all business evidence, and wait for Superadmin approval.

### Step 1: Mobile Registration
*   **Endpoint**: `POST /onboarding/step1-mobile`
*   **Payload**:
    ```json
    {
      "phone": "9876543210"
    }
    ```
*   **Result**: Returns `message: OTP sent successfully`.
*   **Console**: Check your server terminal for the **OTP** (e.g., `[ONBOARDING OTP] Sent 123456 to 9876543210`).
*   **DB Status**: User created/updated with role `seller`.

### Step 2: Verify OTP
*   **Endpoint**: `POST /onboarding/step1-verify`
*   **Payload**:
    ```json
    {
      "phone": "9876543210",
      "otp": "123456" 
    }
    ```
*   **Result**: Returns `accessToken`.
*   **Action**: Click **Authorize** in Swagger and paste this token (`Bearer <token>`). This token allows you to complete the next 5 steps.

### Step 3: Personal Details
*   **Endpoint**: `PUT /onboarding/step2-details`
*   **Payload**:
    ```json
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    }
    ```
*   **Result**: Profile updated.

### Step 4: Business Verification (DOC UPLOADS)
*   **Endpoint**: `POST /onboarding/step3-business`
*   **Type**: `multipart/form-data`
*   **Form Data**:
    *   `udyogAadharNumber`: "UDYOG-12345"
    *   `gstNumber`: "22AAAAA0000A1Z5"
    *   `udyogAadharCertificate`: [Upload PDF]
    *   `gstCertificate`: [Upload PDF]
    *   `businessProof`: [Upload PDF] (Optional)
*   **Result**: Evidence documents saved and linked to seller.

### Step 5: Shop Details
*   **Endpoint**: `POST /onboarding/step4-shop`
*   **Type**: `multipart/form-data`
*   **Form Data**:
    *   `shopName`: "Doe Weighing Solutions"
    *   `address`: "123 Industrial Area"
    *   `village`: "Rosewood" (Optional)
    *   `pinCode`: "400001"
    *   `state`: "Maharashtra"
    *   `district`: "Mumbai"
    *   `shopActLicense`: [Upload PDF]
*   **Result**: Shop model updated and license PDF stored.

### Step 6: Bank Details
*   **Endpoint**: `POST /onboarding/step5-bank`
*   **Type**: `multipart/form-data`
*   **Form Data**:
    *   `holderName`: "John Doe"
    *   `accountNo`: "123456789012"
    *   `ifsc`: "IFSC0001234"
    *   `bankName`: "Industrial Bank"
    *   `panNumber`: "ABCDE1234F"
    *   `cancelledCheque`: [Upload PDF]
    *   `panCard`: [Upload PDF]
*   **Result**: Bank records updated and verification documents stored.

### Step 7: Finalize
*   **Endpoint**: `POST /onboarding/step6-complete`
*   **Result**: `{ "message": "Onboarding complete. Your account is pending Superadmin approval." }`.
*   **Status**: `onboarded_at` is set in DB. Login is still restricted until approved.

---

## 🛡️ Phase 2: Super Admin Approval

**Goal**: As Super Admin, review the seller's documentation and approve/reject.

### 1. Super Admin Login (Mobile + OTP)
*   **Action**: Clear current Bearer Token.
*   **Step A**: `POST /auth/send-login-otp` with `{ "phone": "admin_phone" }`.
*   **Step B**: Check console for OTP.
*   **Step C**: `POST /auth/login` with `{ "phone": "admin_phone", "otp": "..." }`.
*   **Step D**: Authorize in Swagger with the Super Admin token.

### 2. Review and Approve
*   **Get Pending**: `GET /superadmin/pending-sellers`. Confirm "John Doe" is in the list. Copy their `id`.
*   **Approve**: `POST /superadmin/approve-seller`
    ```json
    {
      "sellerId": "UUID_FROM_LIST"
    }
    ```
*   **Status**: `isApproved` set to `true` in DB.

---

## � Phase 3: Regular Seller Login

**Goal**: Approved seller logs in to manage their business.

*   **Step 1**: `POST /auth/send-login-otp` with `{ "phone": "9876543210" }`.
*   **Step 2**: `POST /auth/login` with OTP.
*   **Result**: Returns tokens and user object with `role: "SELLER"`.
*   **Action**: Authorize in Swagger.

---

## 🏗️ Phase 4: Business Setup (Facilities & Staff)

**Goal**: Seller sets up their first weighing facility and hires staff.

### 1. Create Facility
*   **Endpoint**: `POST /facilities`
*   **Payload**:
    ```json
    {
      "name": "East Weighbridge",
      "location": "Eastern Port",
      "address": "Gate 4, Port Area",
      "totalMachines": 2
    }
    ```
*   **Copy Result**: Copy the `id` of the new facility.

### 2. Create Staff (Administrator/Operator)
*   **Endpoint**: `POST /users/create`
*   **Payload**:
    ```json
    {
      "name": "Op Sam",
      "username": "opsam",
      "password": "password123",
      "mobile": "5555566666",
      "role": "operator",
      "facilityId": "FACILITY_UUID_FROM_STEP_4.1"
    }
    ```
*   **Validation**: Ensure you are logged in as the Seller who owns the facility.

---

## 👨‍💻 Phase 5: Staff Login (Traditional)

**Goal**: Sub-users (Administrators/Operators) log in via their mobile number.

*   **Note**: Staff members also use the Mobile + OTP flow for maximum security.
*   **Step 1**: `POST /auth/send-login-otp` with `{ "phone": "5555566666" }`.
*   **Step 2**: `POST /auth/login` with OTP.
*   **Result**: Success! Token returned with `role: "OPERATOR"`.
*   **Check**: Facilities list should only show the facility they are assigned to.

---

## 📂 Phase 6: Utilities & Audits

### 1. Profile Check
*   **Endpoint**: `GET /auth/me`
*   **Check**: Verify `req.user` contains correct roles and permissions.

### 2. Audit Logs
*   **Check DB**: `SELECT * FROM audit_logs ORDER BY "createdAt" DESC;`
*   **Verify**: Actions like `approve-seller`, `facility creation`, and `logins` are recorded.
