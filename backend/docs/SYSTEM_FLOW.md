# WeighPro Backend System Flow

This document outlines the end-to-end flow of the WeighPro Backend system, detailing how authentication, role-based access control (RBAC), and module interactions work.

## 1. Architecture Overview

The system is built on **NestJS** following a Domain-Driven Design (DDD) approach.
- **Global Guards/Interceptors**: Handle security (JWT, Permissions) and logging (Audit) centrally.
- **Modules**: Each major feature (Auth, Users, Access) is self-contained.
- **Database**: PostgreSQL managed via Prisma ORM.

## 2. Authentication Flow (The Entry Point)

The system uses a secure **JWT + Refresh Token** strategy with **OTP Verification** for sensitive actions (like registration).

### A. Initial Admin Registration (Public)
1.  **Register**: A new Admin hits `POST /auth/register` with email/password.
    *   *Backend*: Creates user with `isVerified: false`, generates a 6-digit OTP, saves to DB.
    *   *Result*: User created, OTP returned (in dev mode) or sent via Email/SMS.
2.  **Verify OTP**: Admin hits `POST /auth/verify-otp`.
    *   *Backend*: Validates OTP. If correct, sets `isVerified: true`.
    *   *Result*: Returns `accessToken` (short-lived) and `refreshToken` (long-lived).

### B. Login
1.  **Login**: User hits `POST /auth/login`.
    *   *Backend*: Checks email, password hash, and active/verified status.
    *   *Result*: Returns tokens + User Profile (Role & Permissions).

## 3. RBAC & User Management Flow

WeighPro enforces strict Role-Based Access Control. Users are **NOT** created publicly after the initial Admin.

### A. Admin Creates Sub-Users
Only users with `ADMIN` role (or permissions) can create other users.
1.  **Create User**: Admin API `POST /users` creates an `ADMINISTRATOR` or `OPERATOR`.
2.  **Assign Permissions**: Admin selects specific modules (e.g., `DASHBOARD`, `INVENTORY`) and actions (`VIEW`, `EDIT`) for the new user.
3.  **Auto-Verification**: Users created by Admin are auto-verified (`isVerified: true`).

### B. Permission Enforcement (The Guard)
Every protected route is decorated with `@RequirePermission(MODULE, ACTION)`.
1.  **Interceptor**: `JwtStrategy` attaches the user's flat permission list (e.g., `["USERS:ADD", "ACCESS:VIEW"]`) to the Request object.
2.  **Guard**: `PermissionGuard` checks if the required permission exists in the user's list.
    *   *Pass*: Request proceeds.
    *   *Fail*: `403 Forbidden` thrown.
    *   *Superadmin*: Bypasses all checks.

## 4. Access Management Flow

Admins can modify access at any time.
1.  **View Permissions**: `GET /access/users/:id/permissions` shows current access.
2.  **Update Permissions**: `PATCH /access/users/:id/permissions` replaces the permission set.
3.  **Revoke Access**: `PATCH /access/users/:id/status` sets `isActive: false`, instantly blocking login.
4.  **Logout**: `POST /auth/logout` revokes the session in the database.

## 5. Audit & Logging

1.  **Audit Middleware**: Intercepts every HTTP request.
    *   Logs: User ID (if auth), Action (POST/GET), Resource (URL), IP, User Agent.
    *   Storage: Saved to `audit_logs` table in PostgreSQL.

## End-to-End Diagram

```
[Client] -> [Load Balancer/Gateway]
    |
    v
[NestJS API]
    |
    +-> (Global Middleware) -> Audit Logging
    |
    +-> (Global Guards) -> JWT Check -> Permission Check
    |
    +-> [Auth Module]  <--> [OTP Service]
    |
    +-> [Users Module] <--> [Prisma Service] <--> [PostgreSQL]
    |
    +-> [Access Module]
    |
    +-> [Upload Module] -> Local Storage / S3
```

backend/
│
├── dist/
├── docs/
├── node_modules/
│
├── src/
│   │
│   ├── common/
│   │   ├── constants/
│   │   ├── decorators/
│   │   │   └── require-permission.decorator.ts
│   │   ├── dto/
│   │   │   └── global-response.dto.ts
│   │   ├── enums/
│   │   ├── exceptions/
│   │   │   └── global-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── dashboard-access.guard.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── permission.guard.ts
│   │   ├── interceptors/
│   │   ├── interfaces/
│   │   ├── middleware/
│   │   │   └── audit.middleware.ts
│   │   ├── pipes/
│   │   └── utils/
│   │
│   ├── config/
│   │   ├── env.config.ts
│   │   ├── jwt.config.ts
│   │   └── swagger.config.ts
│   │
│   ├── infrastructure/
│   │   ├── logger/
│   │   │   └── logger.service.ts
│   │   ├── mail/
│   │   │   └── mail.service.ts
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   │
│   ├── modules/
│   │   │
│   │   ├── access/
│   │   │   ├── dto/
│   │   │   │   └── access.dto.ts
│   │   │   ├── access.controller.ts
│   │   │   ├── access.module.ts
│   │   │   └── access.service.ts
│   │   │
│   │   ├── administrators/
│   │   │   ├── dto/
│   │   │   │   ├── create-administrator.dto.ts
│   │   │   │   └── update-administrator-status.dto.ts
│   │   │   ├── administrators.controller.ts
│   │   │   ├── administrators.module.ts
│   │   │   └── administrators.service.ts
│   │   │
│   │   ├── audit/
│   │   │   ├── audit.entity.ts
│   │   │   ├── audit.module.ts
│   │   │   └── audit.service.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   │   └── auth.dto.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.service.ts
│   │   │
│   │   ├── business/
│   │   │   ├── dto/
│   │   │   │   └── business.dto.ts
│   │   │   ├── admin-business.controller.ts
│   │   │   ├── business-docs.config.ts
│   │   │   ├── business.controller.ts
│   │   │   ├── business.module.ts
│   │   │   └── business.service.ts
│   │   │
│   │   ├── facilities/
│   │   │   ├── dto/
│   │   │   │   └── facility.dto.ts
│   │   │   ├── facilities.controller.ts
│   │   │   ├── facilities.module.ts
│   │   │   └── facilities.service.ts
│   │   │
│   │   ├── operators/
│   │   │   ├── dto/
│   │   │   │   ├── create-operator.dto.ts
│   │   │   │   └── update-operator-status.dto.ts
│   │   │   ├── operators.controller.ts
│   │   │   ├── operators.module.ts
│   │   │   └── operators.service.ts
│   │   │
│   │   ├── otp/
│   │   │   ├── otp.module.ts
│   │   │   └── otp.service.ts
│   │   │
│   │   ├── superadmin/
│   │   │   ├── dto/
│   │   │   │   └── superadmin.dto.ts
│   │   │   ├── superadmin.controller.ts
│   │   │   ├── superadmin.module.ts
│   │   │   └── superadmin.service.ts
│   │   │
│   │   ├── upload/
│   │   │   ├── multer.config.ts
│   │   │   ├── upload.controller.ts
│   │   │   └── upload.module.ts
│   │   │
│   │   └── users/
│   │       ├── dto/
│   │       │   └── create-user.dto.ts
│   │       ├── users.controller.ts
│   │       ├── users.module.ts
│   │       └── users.service.ts
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── shared/
│   │   └── types/
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── uploads/
│
├── .env
├── .gitignore
├── nest-cli.json
├── package.json
├── package-lock.json
└── tsconfig.json
