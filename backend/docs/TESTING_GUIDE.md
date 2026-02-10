# WeighPro Testing Guide

This guide provides a comprehensive walkthrough to test the **WeighPro Backend** using **Swagger UI**.

**Prerequisites**:
1.  **Server Running**: `npm run start:dev`
2.  **Database Seeded**: `npx prisma db seed` (Creates default Super Admin: `admin` / `admin123`)
3.  **Swagger URL**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🚀 Phase 1: Admin Registration Flow (Business Onboarding)

**Goal**: Register a new Business Admin, verify OTP, complete profile, and get approval from Super Admin.

### 1. Register New Admin
*   **Endpoint**: `POST /auth/register-admin`
*   **Payload**:
    ```json
    {
      "name": "John Business",
      "email": "john@business.com",
      "mobile": "9876543210",
      "password": "password123"
    }
    ```
*   **Response**: Returns `adminId` and a temporary `accessToken`. Check server console for the **OTP**.

### 2. Verify OTP
*   **Endpoint**: `POST /auth/verify-otp`
*   **Payload**:
    ```json
    {
      "adminId": "UUID_FROM_STEP_1",
      "mobile": "9876543210",
      "otp": "123456" // Check server console
    }
    ```
*   **Result**: Status `201 Created`. User `isOtpVerified` = true.

### 3. Complete Business Profile
*   **Auth**: Click **Authorize** -> Enter the `accessToken` from Step 1.
*   **Endpoint**: `POST /admin/business-details`
*   **Payload**:
    ```json
    {
      "businessName": "John Weighing Solutions",
      "addressLine": "123 Market St",
      "area": "Downtown",
      "city": "Metropolis",
      "state": "NY",
      "pincode": "10001",
      "proofOfBusiness": "license.pdf"
    }
    ```
*   **Result**: Business details saved. User status: `PENDING_SUPERADMIN_APPROVAL`.

### 4. login as Admin (Restricted)
*   **Endpoint**: `POST /auth/login`
*   **Payload**: `mobile: 9876543210`, `password: password123`.
*   **Check**: Call `GET /auth/me`. You will see `isApprovedBySuperAdmin: false`.
*   **Try Dashboard**: Attempting to access protected resources (e.g., `GET /facilities`) may be forbidden based on guard rules.

---

## 🛡️ Phase 2: Super Admin Approval

**Goal**: Approve the pending Business Admin.

### 1. Login as Super Admin
*   **Endpoint**: `POST /auth/login`
*   **Payload**:
    ```json
    {
      "username": "admin",
      "password": "admin123"
    }
    ```
*   **Response**: Copy the `accessToken`.
*   **Auth**: **Logout** in Swagger, then **Authorize** with this Super Admin token.

### 2. List Pending Approvals
*   **Endpoint**: `GET /superadmin/pending-admins`
*   **Result**: Should list "John Business" (from Phase 1).

### 3. Approve Admin
*   **Endpoint**: `POST /superadmin/approve-admin`
*   **Payload**:
    ```json
    {
      "adminId": "UUID_OF_JOHN_BUSINESS"
    }
    ```
*   **Result**: Admin is now approved (`isApprovedBySuperAdmin: true`).

---

## 🏭 Phase 3: Facility & User Management (By Business Admin)

**Goal**: The now-approved Admin creates facilities and sub-users (Administrators/Operators).

### 1. Login as Business Admin
*   **Action**: Login again as `john@business.com` (or mobile) to get a full-access token.
*   **Auth**: Update Swagger Authorization.

### 2. Create a Facility
*   **Endpoint**: `POST /facilities`
*   **Payload**:
    ```json
    {
      "name": "Main Warehouse",
      "location": "Sector 5",
      "address": "123 Industrial Area",
      "totalMachines": 5
    }
    ```
*   **Result**: Copy the `id` (Facility ID).

### 3. Create a Sub-Administrator (Manager)
*   **Endpoint**: `POST /administrators`
*   **Payload**:
    ```json
    {
      "name": "Site Manager",
      "username": "manager1",
      "password": "password123",
      "facilityId": "FACILITY_UUID",
      "permissions": {
        "facilityManagement_view": true,
        "facilityManagement_edit": true,
        "userManagement_add": true,
        "userManagement_view": true
      }
    }
    ```

### 4. Create an Operator
*   **Endpoint**: `POST /operators`
*   **Payload**:
    ```json
    {
      "name": "Weighbridge Op 1",
      "username": "op1",
      "password": "password123",
      "facilityId": "FACILITY_UUID",
      "permissions": {
        "facilityManagement_view": true,
        "inventoryManagement_view": true
      }
    }
    ```

---

## 🔐 Phase 4: RBAC Verification

**Goal**: Verify permissions for different roles.

### 1. Test Administrator Access
*   **Login**: as `manager1`.
*   **Test**:
    *   `GET /facilities` -> **Success** (Has view permission).
    *   `POST /operators` -> **Success** (Has user add permission).
    *   `DELETE /facilities/{id}` -> **Forbidden** (No delete permission).

### 2. Test Operator Access
*   **Login**: as `op1`.
*   **Test**:
    *   `GET /facilities` -> **Success** (Has view permission).
    *   `POST /administrators` -> **Forbidden** (Operators cannot manage users).

---

## 📂 Phase 5: Utilities

### 1. File Upload
*   **Endpoint**: `POST /upload`
*   **Type**: `multipart/form-data`.
*   **Result**: JSON with file path.

### 2. Audit Logs
*   **Check Database**: `SELECT * FROM audit_logs ORDER BY "createdAt" DESC;`
*   **Verify**: All login, create, and update actions should be logged with `userId` and `action`.
