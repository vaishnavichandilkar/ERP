# WeighPro Testing Guide

This guide provides a comprehensive step-by-step walkthrough to test the **WeighPro Backend** using **Swagger UI**.

**Prerequisites**:
1.  **Server Running**: `npm run start:dev`
2.  **Database Seeded**: `npx ts-node src/prisma/seed.ts` (Creates default Super Admin: `admin` / `admin123`)
3.  **Swagger URL**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🚀 Phase 1: Admin Onboarding (Strict Flow)

**Goal**: Register a new Admin, verify OTP, complete business profile, and wait for approval. Use the **Response Body** from each step for the next.

### 1. Register New Admin
*   **Endpoint**: `POST /auth/register` (Section: Auth)
*   **Payload**:
    ```json
    {
      "name": "John Business",
      "email": "john@business.com",
      "mobile": "9876543210",
      "password": "password123"
    }
    ```
*   **Result**: Returns `adminId` and `message`. **No Token** is returned. You cannot login yet.
*   **Console**: Check terminal for the **OTP** (e.g., `[OTP] Sent 123456 to 9876543210`)
*   **Status Check (DB)**: `current_status = PENDING_OTP`.

### 2. Verify OTP
*   **Endpoint**: `POST /auth/verify-otp`
*   **Payload**:
    ```json
    {
      "adminId": "UUID_FROM_STEP_1",
      "mobile": "9876543210",
      "otp": "123456" // Use OTP from console
    }
    ```
*   **Result**: Returns `accessToken`.
*   **Note**: This token has limited access (Status: `PENDING_PROFILE`). You can ONLY create a business profile.
*   **Action**: Click **Authorize** button in Swagger and paste this token (`Bearer <token>`).

### 3. Complete Business Profile
*   **Endpoint**: `POST /admin/business-details` (Section: Admin Business)
*   **Type**: `multipart/form-data`
*   **Payload**:
    *   `businessName`: "John Weighing Solutions"
    *   `addressLine`: "123 Market St"
    *   `area`: "Downtown"
    *   `city`: "Metropolis"
    *   `state`: "NY"
    *   `pincode`: "10001"
    *   `proofOfBusiness`: [Upload File] (Required PDF)
    *   `udyogAadhar`: [Upload File] (Optional PDF)
    *   `gstCertificate`: [Upload File] (Optional PDF)
    *   `otherDocument`: [Upload File] (Optional PDF)
*   **Result**: Business details saved with file paths.
*   **Status Check (DB)**: `isProfileCompleted = true`, `isApprovedBySuperAdmin = false`.
*   **Note**: Your access is now paused. You cannot perform further actions until approved.

### 4. Verify Login Restriction
*   **Endpoint**: `POST /auth/login`
*   **Payload**: `username: 9876543210`, `password: password123`.
*   **Result**: Should fail with `401 Unauthorized` and message `Account not active. Status: PENDING_APPROVAL`.

---

## 🛡️ Phase 2: Super Admin Approval

**Goal**: As Super Admin, review and approve the pending Sub-Admin.

### 1. Login as Super Admin
*   **Action**: Logout from Swagger (or clear token).
*   **Endpoint**: `POST /auth/login`
*   **Payload**:
    ```json
    {
      "username": "admin",
      "password": "admin123"
    }
    ```
*   **Result**: Returns Super Admin `accessToken`.
*   **Action**: Authorize in Swagger with this new token.

### 2. List Pending Approvals
*   **Endpoint**: `GET /superadmin/pending-admins` (Section: Super Admin)
*   **Result**: Should list "John Business" with status `PENDING_APPROVAL`. Copy their `id`.

### 3. Approve Admin
*   **Endpoint**: `POST /superadmin/approve-admin`
*   **Payload**:
    ```json
    {
      "adminId": "UUID_FROM_STEP_2"
    }
    ```
*   **Result**: `{ "message": "Admin approved successfully" }`.
*   **Status Check (DB)**: `current_status = ACTIVE `.

---

## 🚀 Phase 3: Active Admin Access

**Goal**: Now that the Admin is active, they can login and manage their facility.

### 1. Login as Approved Admin
*   **Action**: Logout Super Admin.
*   **Endpoint**: `POST /auth/login`
*   **Payload**: `username: 9876543210`, `password: password123`.
*   **Result**: Success! Returns `accessToken`.
*   **Check**: `user.status` in response should be `ACTIVE`.

### 2. Verify Dashboard Access
*   **Endpoint**: `GET /auth/me`
*   **Result**: Returns full profile.

---

## 🏭 Phase 4: User Management (By Admin)

**Goal**: The Active Admin creates sub-users (Administrators/Operators).

### 1. Create a Sub-User
*   **Authorize**: Ensure you are logged in as "John Business" (Step 3.1).
*   **Endpoint**: `POST /users/create`
*   **Payload** (Create an Operator):
    ```json
    {
      "name": "Weighbridge Op 1",
      "username": "op1",
      "mobile": "5555555555",
      "password": "password123",
      "role": "OPERATOR",
      "facilityId": "FACILITY-UUID-IF-EXISTS-OR-NULL", // Note: Logic requires Facility creation first usually
      "permissions": [
         { "module": "Dashboard", "action": "VIEW" }
      ]
    }
    ```
*   **Note**: If `facilityId` is required by logic, you might need to create a facility first (if Facility module is implemented) or pass a mock ID if validation allows. (Current `UsersService` enforces `facilityId` for Operators).

---

## 📂 Phase 5: Utilities

### 1. File Upload
*   **Endpoint**: `POST /upload`
*   **Result**: JSON with file path.

### 2. Audit Logs
*   **Check Database**: `SELECT * FROM audit_logs ORDER BY "createdAt" DESC;`
