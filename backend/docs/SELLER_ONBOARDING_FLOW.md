# WeighPro Backend: Seller Onboarding & Authentication Technical Manual

This document provides a comprehensive technical breakdown of the **WeighPro** backend architecture, focusing on the Seller Lifecycle, Authentication, and the multi-step Onboarding flow.

---

## SECTION 1: SYSTEM OVERVIEW

### Purpose
WeighPro is a production-level High Accuracy Weighing Management System. The backend is built using **NestJS**, **PostgreSQL**, and **Prisma ORM**, designed to manage industrial weighing operations across multiple facilities.

### Role Structure
1.  **Superadmin**: The platform owner. Manages and approves/rejects Seller applications.
2.  **Seller**: The business owner. Must complete a 7-step verification flow. Owns facilities and staff.
3.  **Administrator**: A sub-user created by a Seller to manage a specific facility and its operators.
4.  **Operator**: A machine-level user responsible for day-to-day weighing tasks.

### Core Concepts
*   **Seller Onboarding**: A strict verification process where sellers must upload legal evidence (PDFs) before they can access the business dashboard.
*   **JWT Authentication**: A stateless security model supplemented by a `Session` table for refresh token rotation and revocation.
*   **Mobile-First Login**: Traditional passwords are replaced by Mobile Number + OTP for all high-privilege actions.

---

## SECTION 2: COMPLETE PROJECT STRUCTURE

```text
src/
├── common/
31: │   ├── guards/
32: │   │   ├── jwt-auth.guard.ts        # Intercepts requests to check for Bearer tokens
33: │   │   └── permission.guard.ts      # Enforces Role-Based Access Control (RBAC)
34: │   └── decorators/
35: │       └── require-permission.decorator.ts
36: ├── infrastructure/
37: │   └── prisma/
38: │       └── prisma.service.ts        # Global database client (Prisma)
39: ├── modules/
40: │   ├── auth/
41: │   │   ├── auth.controller.ts       # Handles login, logout, and token refresh
42: │   │   ├── auth.service.ts          # Core logic for OTP and Token generation
43: │   │   ├── dto/auth.dto.ts          # Validation schemas for login
44: │   │   └── strategies/
45: │   │       └── jwt.strategy.ts      # Validates JWT payload and attaches user to Req
46: │   ├── onboarding/
47: │   │   ├── onboarding.controller.ts # Orchestrates the 7-step seller flow
48: │   │   ├── onboarding.service.ts    # Handles uploads and machine config
49: │   │   └── dto/onboarding.dto.ts    # Strictly typed step-by-step inputs
50: │   ├── superadmin/
51: │   │   ├── superadmin.controller.ts # Seller approval/rejection endpoints
52: │   │   └── superadmin.service.ts    # Logic for toggling isApproved status
53: │   └── users/
54: │       ├── users.controller.ts      # Sub-user creation (Admin/Operator)
55: │       └── users.service.ts         # User management logic
56: └── main.ts                          # App entry point with Swagger/Validation config
```

---

## SECTION 3: SELLER REGISTRATION & LANGUAGE (STEP 1)

When a new user starts the onboarding:

1.  **Frontend**: User selects language (English, Hindi, Marathi, Kannada).
2.  **Request**: Sends `POST /onboarding/step1-language`.
3.  **onboarding.service.ts**: 
    *   Creates a temporary `User` record with `selected_language`.
4.  **Database**: Entry created in `User` table with a UUID.
5.  **Response**: Returns `userId`. Frontend must store this ID to maintain session until OTP verification.

---

## SECTION 4: MOBILE REGISTRATION & OTP (STEP 2)

1.  **Frontend**: User enters phone and clicks "Send OTP".
2.  **Request**: Sends `POST /onboarding/step2-mobile` with `{ userId, phone }`.
3.  **onboarding.service.ts**:
    *   Finds temporary record by `userId`.
    *   **Validation**: Checks if `phone` exists in `User` table.
    *   **Uniqueness Check**: If found, throws `409 Conflict` error: "Mobile number already registered. Please login.".
    *   Updates temporary record with `phone`.
    *   Generates and stores `OTP` for the phone.
4.  **Database**: Record updated; `OTP` record created.
5.  **Response**: Returns success message.

---

## SECTION 4.1: OTP VERIFICATION & JWT GENERATION (STEP 3)

1.  **Incoming**: `POST /onboarding/step3-verify` with `{ phone, otp }`.
2.  **onboarding.controller.ts**: `verifyOtp(dto)` is triggered.
3.  **onboarding.service.ts**:
    *   Queries `prisma.otp` to find a match for the phone.
    *   Checks if `otp === dto.otp` and `expiresAt > now()`.
    *   On success, calls `generateOnboardingTokens(user)`.
4.  **JWT Handling**:
    *   **Access Token**: Signed with `jwt.secret`. Contains `userId`, `phone`, and `role`.
    *   **Refresh Token**: Signed with `jwt.refreshSecret`. 
5.  **Database Persistence**:
    *   The `prisma.session.create` method stores a hash of the refresh token and a unique `jti`.
    *   The OTP record is deleted using `prisma.otp.delete`.
6.  **Response**: Frontend receives the full token pair and user metadata.

---

## SECTION 5: JWT FLOW & CLIENT USAGE

1.  **Storage**: The Frontend is responsible for storing the **Access Token** in memory or `sessionStorage`.
2.  **Persistence**: The **Refresh Token** is typically stored in secure storage for session recovery.
3.  **Transmission**: For every subsequent protected request:
    `Authorization: Bearer <accessToken>`

---

## SECTION 6: JWT AUTHORIZATION FLOW (INTERNAL)

When a protected API (e.g., `PUT /onboarding/step4-details`) is called:

1.  **Entry**: `onboarding.controller.ts` is guarded by `@UseGuards(JwtAuthGuard)`.
2.  **Guard**: `jwt-auth.guard.ts` extracts the Bearer token.
3.  **Strategy**: `jwt.strategy.ts`'s `validate(payload)` ensures the user exists and is not blocked.
4.  **Context**: Attaches user to `Request` object as `req.user`.
5.  **Service**: Receives `req.user.userId` from the controller.

---

## SECTION 7: REFRESH TOKEN ROTATION

1.  **Request**: `POST /auth/refresh` with the `refreshToken`.
2.  **auth.service.ts**: Verifies signature, checks `prisma.session`, and generates a **NEW** pair.
3.  **Database**: Revokes old session, creates new one.

---

## SECTION 8: STEP-BY-STEP ONBOARDING PROCESS (STRICT SEQUENCE)

The onboarding follows a strict **7-step sequence**.

### Step 1: Language Selection
**Endpoint**: `POST /onboarding/step1-language`
**Database**: Creates/Updates `User` with `role: seller` and `selected_language`.

### Step 2: Mobile Registration (OTP)
**Endpoint**: `POST /onboarding/step2-mobile`
**Database**: Generates and stores `OTP` for the phone.

### Step 3: Verify OTP
**Endpoint**: `POST /onboarding/step3-verify`
**Database**: Validates OTP. On success, generates JWT session tokens.

### Step 4: Personal Details
**Endpoint**: `PUT /onboarding/step4-details` (Protected)
**Database**: Updates `User` with `first_name`, `last_name`, `email`.

### Step 5: Business Details & Documents
**Endpoint**: `POST /onboarding/step5-business` (Protected, Multipart)
**Database**: Creates entries in `SellerDocument` table for verification.

### Step 6: Shop Details
**Endpoint**: `POST /onboarding/step6-shop` (Protected, Multipart)
**Database**: Verifies `pinCode` against `Pincode` table to auto-fetch `state` and `district`. Updates/Creates `ShopDetail` and stores license PDF.

### Step 7: Final Submission
**Endpoint**: `POST /onboarding/step7-complete` (Protected)
**Database**: Sets `onboarded_at` in the `User` table.
*   **System Action**: User is now locked in `PENDING_APPROVAL` state.

---

## SECTION 9: LOGOUT FLOW

1.  **Request**: `POST /auth/logout`.
2.  **auth.service.ts**: Sets `isRevoked: true` for all active sessions of that user.

---

## SECTION 10: COMPLETE DATABASE FLOW

| Action | Table Involved | Key Fields |
| :--- | :--- | :--- |
| **Language & User Init**| `User` | `phone`, `role`, `selected_language` |
| **OTP Sent** | `otp` | `otp`, `expiresAt` |
| **OTP Verified** | `sessions` | `jti`, `refreshTokenHash` |
| **Profile Fill** | `User` | `first_name`, `last_name`, `email` |
| **Doc Upload** | `SellerDocument` | `url`, `type`, `category` |
| **Approval** | `User` | `isApproved: true`, `onboarded_at` |

---

## SECTION 11: COMPLETE REQUEST LIFECYCLE

**Standard Write Operation Flow:**
`Frontend Request` → `AuthGuard` → `PermissionGuard` → `Controller` → `Service` → `Prisma Service` → `PostgreSQL` → `JSON Response`

---

## SECTION 12: SECURITY FLOW

*   **OTP Expiry**: 5 minutes. Deleted on use.
*   **JWT Revocation**: Real-time revocation via `Session` table.
*   **Role Lockdown**: `isApproved: false` blocks dashboard access.
*   **Document Isolation**: Strict `uploadedByUserId` checks.

---

## SECTION 13: STEP-BY-STEP SEQUENCE FLOW (TIMELINE)

1.  **T+0s**: User selects language. **User Initialized**.
2.  **T+5s**: User enter phone & clicks Send OTP. **OTP sent**.
3.  **T+15s**: User enters OTP. **Tokens received**.
4.  **T+1m**: User completes Personal Details (Step 4).
5.  **T+3m**: User uploads Docs (Steps 5-6).
6.  **T+5m**: User clicks "Finish" (Step 7). **Onboarding Complete**.
8.  **T+1h**: **Superadmin** reviews and **Approves**.
9.  **T+1h 1s**: Seller Dashboard unlocked.

---
*Last Updated: February 28, 2026*
