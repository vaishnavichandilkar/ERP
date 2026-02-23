# WeighPro Backend: Seller Onboarding & Authentication Technical Manual

This document provides a comprehensive technical breakdown of the **WeighPro** backend architecture, focusing on the Seller Lifecycle, Authentication, and the multi-step Onboarding flow.

---

## SECTION 1: SYSTEM OVERVIEW

### Purpose
WeighPro is a production-level High Accuracy Weighing Management System. The backend is built using **NestJS**, **PostgreSQL**, and **Prisma ORM**, designed to manage industrial weighing operations across multiple facilities.

### Role Structure
1.  **Superadmin**: The platform owner. Manages and approves/rejects Seller applications.
2.  **Seller**: The business owner. Must complete a 6-step verification flow. Owns facilities and staff.
3.  **Administrator**: A sub-user created by a Seller to manage a specific facility and its operators.
4.  **Operator**: A machine-level user responsible for day-to-day weighing tasks.

### Core Concepts
*   **Seller Onboarding**: A strict verification process where sellers must upload legal evidence (PDFs) before they can access the business dashboard.
*   **JWT Authentication**: A stateless security model supplemented by a `Session` table for refresh token rotation and revocation.
*   **Mobile-First Login**: Traditional passwords are replaced/supplemented by Mobile Number + OTP for all high-privilege actions.

---

## SECTION 2: COMPLETE PROJECT STRUCTURE

```text
src/
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts        # Intercepts requests to check for Bearer tokens
│   │   └── permission.guard.ts      # Enforces Role-Based Access Control (RBAC)
│   └── decorators/
│       └── require-permission.decorator.ts
├── infrastructure/
│   └── prisma/
│       └── prisma.service.ts        # Global database client (Prisma)
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts       # Handles login, logout, and token refresh
│   │   ├── auth.service.ts          # Core logic for OTP and Token generation
│   │   ├── dto/auth.dto.ts          # Validation schemas for login
│   │   └── strategies/
│   │       └── jwt.strategy.ts      # Validates JWT payload and attaches user to Req
│   ├── onboarding/
│   │   ├── onboarding.controller.ts # Orchestrates the 6-step seller flow
│   │   ├── onboarding.service.ts    # Handles complex document uploads and status
│   │   └── dto/onboarding.dto.ts    # Strictly typed step-by-step inputs
│   ├── superadmin/
│   │   ├── superadmin.controller.ts # Seller approval/rejection endpoints
│   │   └── superadmin.service.ts    # Logic for toggling isApproved status
│   └── users/
│       ├── users.controller.ts      # Sub-user creation (Admin/Operator)
│       └── users.service.ts         # User management logic
└── main.ts                          # App entry point with Swagger/Validation config
```

---

## SECTION 3: SELLER REGISTRATION FLOW (STEP 1)

When a new user enters their mobile number to join WeighPro:

1.  **Frontend**: Sends `POST /onboarding/step1-mobile`.
2.  **onboarding.controller.ts**: `registerMobile(dto)` receives the phone number.
3.  **onboarding.service.ts**: 
    *   Generates a 6-digit cryptographic OTP.
    *   Calls `prisma.user.upsert`: If the user doesn't exist, it creates a new record with `role: "seller"`.
    *   Calls `prisma.otp.upsert`: Stores the OTP with a 5-minute expiry.
4.  **Database**: Entry created in the `User` and `otp` tables.
5.  **Response**: Returns success message. (OTP is printed to console in dev mode).

---

## SECTION 4: OTP VERIFICATION & JWT GENERATION

1.  **Incoming**: `POST /onboarding/step1-verify` with `{ phone, otp }`.
2.  **onboarding.controller.ts**: `verifyOtp(dto)` is triggered.
3.  **onboarding.service.ts**:
    *   Queries `prisma.otp` to find a match for the phone.
    *   Checks if `otp === dto.otp` and `expiresAt > now()`.
    *   On success, calls `generateOnboardingTokens(user)`.
4.  **JWT Handling**:
    *   **Access Token**: Signed with `jwt.secret`. Contains `userId`, `phone`, and `role`.
    *   **Refresh Token**: Signed with `jwt.refreshSecret`. 
5.  **Database Persistence**:
    *   The `prisma.session.create` method stores a hash of the refresh token and a unique `jti` (JWT ID).
    *   The OTP record is deleted using `prisma.otp.delete`.
6.  **Response**: Frontend receives the full token pair and user metadata.

---

## SECTION 5: JWT FLOW & CLIENT USAGE

1.  **Storage**: The Frontend (React/Vue) is responsible for storing the **Access Token** in memory or `sessionStorage`.
2.  **Persistence**: The **Refresh Token** is typically stored in an `HttpOnly` cookie or secure storage for session recovery.
3.  **Transmission**: For every subsequent protected request, the Frontend must include:
    `Authorization: Bearer <accessToken>` in the HTTP headers.

---

## SECTION 6: JWT AUTHORIZATION FLOW (INTERNAL)

When a protected API (e.g., `PUT /onboarding/step2-details`) is called:

1.  **Entry**: `onboarding.controller.ts` is guarded by `@UseGuards(JwtAuthGuard)`.
2.  **Guard**: `jwt-auth.guard.ts` extracts the Bearer token. If missing or malformed, it throws `401 Unauthorized`.
3.  **Strategy**: `jwt.strategy.ts`'s `validate(payload)` method is executed.
    *   It takes the `userId` from the JWT payload.
    *   Calls `prisma.user.findUnique` to ensure the user still exists and is not blocked.
4.  **Context**: The strategy returns the user object, which NestJS automatically attaches to the `Request` object as `req.user`.
5.  **Service**: `onboarding.service.ts` receives `req.user.userId` from the controller and performs the database update.

---

## SECTION 7: REFRESH TOKEN ROTATION

When an Access Token expires:

1.  **Request**: `POST /auth/refresh` with the `refreshToken`.
2.  **auth.controller.ts**: Calls `authService.refresh(dto)`.
3.  **auth.service.ts**:
    *   Verifies the refresh token signature.
    *   Checks `prisma.session` to see if the session is still valid (`isRevoked: false`).
    *   Generates a **NEW** Access Token and a **NEW** Refresh Token (Rotation).
4.  **Database**:
    *   The old session is revoked or deleted.
    *   A new session entry is created.
5.  **Response**: Returns the new credentials to the client.

---

## SECTION 8: FULL SELLER ONBOARDING (STEPS 2-6)

### Step 2: Personal Details
*   **Controller**: `onboarding.controller.ts` -> `updatePersonalDetails`
*   **Prisma**: `user.update` (Saves `first_name`, `last_name`, `email`).

### Step 3: Business Documentation
*   **Util**: `multerConfig` processes incoming PDF files from form-data.
*   **Controller**: `saveBusinessDetails` receives files.
*   **Service**: `saveFile` helper is called multiple times.
*   **Prisma**: `sellerDocument.create` (Stores file `url`, `type`, and `category` like `UDYOG_AADHAR_CERT`).

### Step 4: Shop Details
*   **Prisma**: `shopDetail.upsert` (Stores geographic data).
*   **Prisma**: `sellerDocument.create` (Stores `SHOP_ACT_LICENSE` PDF).

### Step 5: Bank Details
*   **Prisma**: `bankDetail.upsert` (Stores Account, IFSC, and `panNumber`).
*   **Prisma**: `sellerDocument.create` (Stores `CANCELLED_CHEQUE` and `PAN_CARD` PDFs).

### Step 6: Completion
*   **Service**: `completeOnboarding`
*   **Prisma**: `user.update` sets `onboarded_at = now()`.
*   **System Action**: User is now locked in `PENDING_APPROVAL` state.

---

## SECTION 9: LOGOUT FLOW

1.  **Request**: `POST /auth/logout` (Auth Header required).
2.  **auth.controller.ts**: passes `req.user.userId` to service.
3.  **auth.service.ts**: 
    *   Calls `prisma.session.updateMany`.
    *   Sets `isRevoked: true` for all active sessions of that user.
4.  **Result**: The user is effectively logged out globally. Their tokens can no longer be refreshed.

---

## SECTION 10: COMPLETE DATABASE FLOW

| Action | Table Involved | Key Fields |
| :--- | :--- | :--- |
| **Mobile Entry** | `User` | `phone`, `role: "seller"` |
| **OTP Sent** | `otp` | `otp`, `expiresAt`, `phone` |
| **OTP Verified** | `sessions` | `jti`, `refreshTokenHash`, `userId` |
| **Profile Fill** | `User` | `first_name`, `last_name`, `email` |
| **Doc Upload** | `SellerDocument` | `url`, `type`, `category`, `uploadedByUserId` |
| **Shop Fill** | `ShopDetail` | `userId`, `shopName`, `village`, `district` |
| **Bank Fill** | `BankDetail` | `userId`, `holderName`, `accountNo`, `panNumber` |
| **Approval** | `User` | `isApproved: true`, `onboarded_at` |

---

## SECTION 11: COMPLETE REQUEST LIFECYCLE

**Standard Write Operation Flow:**
`Frontend Request` → `AuthGuard` → `PermissionGuard` → `Controller` → `Service` → `Prisma Service` → `PostgreSQL` → `Service Response` → `Controller Mapper` → `JSON Response to Frontend`

---

## SECTION 12: JWT INTERNAL WORKING

*   **Header**: Specifies algorithm (HS256).
*   **Payload**: Contains non-sensitive metadata (`sub`, `role`, `jti`).
*   **Signature**: Payload + Secret key. Ensures the token hasn't been tampered with.
*   **Verification**: Done by `passport-jwt` in `jwt.strategy.ts`.
*   **Expiry**: 
    *   **Access Token**: Fast expiry (e.g., 24h) - Forces frequent authorization checks.
    *   **Refresh Token**: Long expiry (e.g., 7d) - Enables "Remember Me" functionality without re-entering OTP.

---

## SECTION 13: STEP-BY-STEP SEQUENCE FLOW (TIMELINE)

1.  **T+0s**: User enters phone. **OTP sent**.
2.  **T+10s**: User enters OTP. **Tokens received**. User role is `SELLER`.
3.  **T+1m**: User completes Personal Details (Step 2).
4.  **T+3m**: User uploads GST/PAN/License (Steps 3-5).
5.  **T+5m**: User clicks "Finish". **Onboarding Complete**.
6.  **T+1h**: **Superadmin** logs in -> Reviews Documents -> Clicks **Approve**.
7.  **T+1h 10s**: Seller logs in again. **Dashboard unlocked**. Business begins.

---

## SECTION 14: SECURITY FLOW

*   **OTP Expiry**: Fixed at 5 minutes. Deleted immediately on use to prevent replay attacks.
*   **JWT Revocation**: Since JWTs are stateless, we use the `Session` table as a "Real-time Blocklist". If `isRevoked` is true, even a non-expired refresh token is rejected.
*   **Role Lockdown**: A seller with `isApproved: false` is blocked by a global check in `AuthService.login` and `JwtStrategy`, even if their token is valid.
*   **Document Isolation**: `SellerDocument` records are strictly linked via `uploadedByUserId`. Sellers can only access their own uploads.
