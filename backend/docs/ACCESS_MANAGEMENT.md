# Access Management Module Guide

## Overview
This module implements a granular Role-Based Access Control (RBAC) system using a **Facility-Centric** and **Module-Based** permission model. The generic `User` table is now reserved for System Admins, while `Administrator` and `Operator` roles have dedicated tables linked to Facilities.

## Roles
- **System Admin (`ADMIN`)**: Superuser with global access. Bypasses all permission checks. Managed in `users` table.
- **Administrator (`ADMINISTRATOR`)**: Facility-level manager. Managed in `administrators` table. Permissions defined in `administrator_permissions` (CRUD per module).
- **Operator (`OPERATOR`)**: Facility-level operator. Managed in `operators` table. Permissions defined in `operator_permissions` (View/Restricted per module).

## Database Structure
- **Facilities**: Central entity linking admins and operators.
- **Modules**: Dynamic list of system modules (e.g., `Facilities`, `Users`, `Products`, `Inventory`, `Billing`, `Reports`, `Access`, `Settings`).
- **Permissions tables**: Join tables (`administrator_permissions`, `operator_permissions`) linking Users to Modules with flags (`canView`, `canCreate`, `canUpdate`, `canDelete`).

## APIs

### 1. Create User (Admin Only)
**Endpoint**: `POST /api/v1/users/create`
**Header**: `Authorization: Bearer <token>`
**Body**:
```json
{
  "name": "Fac Admin",
  "username": "fac_admin",
  "password": "password123",
  "role": "ADMINISTRATOR", 
  "facilityId": "uuid-facility-id",
  "administratorAccess": {
    "facilityManagement_view": true,
    "facilityManagement_add": true
  }
}
```
*Note: Permissions are mapped from legacy keys (e.g., `facilityManagement_add`) to Module permissions (`Facilities.canCreate`).*

### 2. View User Permissions
**Endpoint**: `GET /api/v1/access/users/:id/permissions`
**Response**: Returns mapped permission object:
```json
{
  "Facilities": { "canView": true, "canCreate": true, "canUpdate": false, "canDelete": false },
  "Users": { ... }
}
```

### 3. Update Permissions
**Endpoint**: `PATCH /api/v1/access/users/:id/permissions`
**Body**:
```json
{
  "administratorAccess": {
    "facilityManagement_delete": true
  }
}
```
*Updates are applied to the granular permission rows.*

### 4. Facility APIs
*   `POST /api/v1/facilities` - Create Facility
*   `GET /api/v1/facilities` - List Active Facilities
*   `PATCH /api/v1/facilities/:id/status` - Activate/Deactivate
*   `DELETE /api/v1/facilities/:id` - Soft Delete

## Security
- `JwtAuthGuard`: Validates Token (supports User, Administrator, Operator).
- `PermissionGuard`: 
  - Resolves User Permissions from Token/DB.
  - Maps legacy decorator keys (e.g. `@RequirePermission('facilityManagement_add')`) to Module+Action (`Facilities.canCreate`).
- **Admin Bypass**: `ADMIN` role bypasses all checks.
