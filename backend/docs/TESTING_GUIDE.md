# WeighPro Testing Guide

This guide provides a comprehensive step-by-step walkthrough to test the **WeighPro Backend** using **Swagger UI**.

**Prerequisites**:
1.  **Server Running**: `npm run start:dev`
2.  **Database Seeded**: `npx ts-node src/prisma/seed.ts` (Creates default Super Admin with phone: `1111111111`)
3.  **Swagger URL**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🚀 Phase 1: Seller Onboarding (Strict 9-Step Flow)

**Goal**: Select language, register mobile, provide all business evidence, and wait for Superadmin approval.

### 🌟 New: Session Management (Resume Form Flow)
You can test the backend's ability to save partially filled data and resume sessions before following the sequential steps below:
1.  **Start Onboarding**: `POST /seller/onboarding/start` with `{ "userId": "YOUR_UUID" }`. Returns a `sessionId` and `currentStep`.
2.  **Submit Step Status**: `POST /seller/onboarding/step/1` with header `x-session-id: <sessionId>` and body containing your form data.
3.  **Resume Drop-off**: `GET /seller/onboarding/status` with header `x-session-id: <sessionId>`. Returns `completedSteps` arrays containing all your saved form state and the specific `nextStep` required.

---

### Step 1: Language Selection
*   **Endpoint**: `POST /onboarding/step1-language`
*   **Payload**:
    ```json
    {
      "language": "English"
    }
    ```
*   **Result**: Returns `userId` (e.g., `"550e8400-e29b-..."`). **SAVE THIS ID.**

### Step 2: Mobile Registration (Send OTP)
*   **Endpoint**: `POST /onboarding/step2-mobile`
*   **Payload**:
    ```json
    {
      "userId": "PASTE_ID_FROM_STEP_1",
      "phone": "9876543210"
    }
    ```
*   **Success (201)**: Returns `message: OTP sent successfully`.
*   **Failure (409)**: If the phone number is already in use, returns `"message": "Mobile number already registered. Please login."`.
*   **Console**: Check your server terminal for the **OTP** (e.g., `[ONBOARDING OTP] Sent 123456 to 9876543210`).

### Step 3: Verify OTP
*   **Endpoint**: `POST /onboarding/step3-verify`
*   **Payload**:
    ```json
    {
      "phone": "9876543210",
      "otp": "123456" 
    }
    ```
*   **Result**: Returns `accessToken`.
*   **Action**: Click **Authorize** in Swagger and paste this token (`Bearer <token>`). This token allows you to complete the remaining steps.

### Step 4: Personal Details
*   **Endpoint**: `PUT /onboarding/step4-details`
*   **Payload**:
    ```json
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    }
    ```
*   **Result**: Profile updated.

### Step 5: Business Verification (DOC UPLOADS)
*   **Endpoint**: `POST /onboarding/step5-business`
*   **Type**: `multipart/form-data`
*   **Form Data**:
    *   `udyogAadharNumber`: "UDYOG-12345"
    *   `gstNumber`: "22AAAAA0000A1Z5"
    *   `udyogAadharCertificate`: [Upload PDF]
    *   `gstCertificate`: [Upload PDF]
    *   `businessProof`: [Upload PDF] (Optional)
*   **Result**: Business evidence documents saved and linked to seller.

### Step 6: Shop Details
*   **Endpoint**: `POST /onboarding/step6-shop`
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

### Step 7: Bank Details
*   **Endpoint**: `POST /onboarding/step7-bank`
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

### Step 8: Finalize
*   **Endpoint**: `POST /onboarding/step9-complete`
*   **Result**: `{ "message": "Onboarding complete. Your account is pending Superadmin approval." }`.
*   **Status**: `onboarded_at` is set in DB. Login is restricted until approved.

---

## 🛡️ Phase 2: Super Admin Approval

**Goal**: As Super Admin, review the seller's documentation and approve/reject.

### 1. Super Admin Login (Mobile + OTP)
*   **Action**: Clear current Bearer Token.
*   **Step A**: `POST /auth/send-login-otp` with `{ "phone": "1111111111" }`.
*   **Step B**: Check console for OTP.
*   **Step C**: `POST /auth/login` with `{ "phone": "1111111111", "otp": "..." }`.
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

## 🔑 Phase 3: Regular Seller Login

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
      "name": "Operator Sam",
      "username": "opsam",
      "mobile": "5555566666",
      "role": "operator",
      "facilityId": "FACILITY_UUID_FROM_STEP_4.1"
    }
    ```
*   **Note**: Passwords have been removed from the system. All sub-users log in using their mobile number.

---

## 👨‍💻 Phase 5: Staff Login (OTP Based)

**Goal**: Sub-users (Administrators/Operators) log in via their registered mobile number.

*   **Logic**: Every user in the system (Superadmin, Seller, Admin, Operator) uses the Mobile + OTP flow for maximum security.
*   **Step 1**: `POST /auth/send-login-otp` with `{ "phone": "5555566666" }`.
*   **Step 2**: `POST /auth/login` with OTP.
*   **Result**: Returns tokens and user object with `role: "OPERATOR"`.
*   **Check**: Facilities list should only show the facility they are assigned to.

---

## 📂 Phase 6: Utilities & Audits

### 1. Profile Check
*   **Endpoint**: `GET /auth/me`
*   **Check**: Verify `req.user` contains correct roles and permissions.

### 2. Audit Logs
*   **Check DB**: `SELECT * FROM audit_logs ORDER BY "createdAt" DESC;`
*   **Verify**: Actions like `approve-seller`, `facility creation`, and `logins` are automatically recorded.

---
*Last Updated: February 28, 2026*
