# WeighPro API Testing: Administrators Module

This document provides a comprehensive test suite for the **Administrators** module, used by Sellers to manage facility-level managers.

**Prerequisites**:
- Successful Seller login or Superadmin login (obtain `accessToken`).
- A valid `facilityId` belonging to the Seller.
- Authorization: `Bearer <token>`.

---

## 👨‍💼 API 1: Create Administrator
Creates a new facility-level Administrator with specific module-based permissions.

*   **Endpoint**: `/administrators`
*   **Method**: `POST`

### ✅ Success Case
*   **Description**: Create an administrator with valid data and basic permissions.
*   **Payload**:
    ```json
    {
      "name": "Arjun Sharma",
      "username": "arjun_admin",
      "mobile": "9876543210",
      "facilityId": "UUID_OF_FACILITY",
      "permissions": {
        "facilityManagement_view": true,
        "userManagement_add": true,
        "userManagement_view": true,
        "billing_view": true
      }
    }
    ```
*   **Expected Response (201 Created)**:
    ```json
    {
      "id": "UUID_GENERATED",
      "name": "Arjun Sharma",
      "username": "arjun_admin",
      "mobile": "9876543210",
      "facilityId": "UUID_OF_FACILITY",
      "isActive": true,
      "createdAt": "TIMESTAMP",
      "updatedAt": "TIMESTAMP"
    }
    ```

### ❌ Failure Scenarios
1.  **Duplicate Username**:
    *   **Payload**: Using a `username` that already exists (e.g., `fac_admin`).
    *   **Response**: `409 Conflict` - `"Username already exists"`.
2.  **Invalid Facility**:
    *   **Payload**: Using a `facilityId` that belongs to another Seller or doesn't exist.
    *   **Response**: `404 Not Found` - `"Facility not found or access denied"`.
3.  **Forbidden Access**:
    *   **Description**: Trying to create an admin without the `userManagement_add` permission.
    *   **Response**: `403 Forbidden`.

---

## 📋 API 2: List Administrators
Retrieves all administrators owned by the Seller, with optional facility filtering.

*   **Endpoint**: `/administrators`
*   **Method**: `GET`
*   **Query Parameters**: `facilityId` (optional)

### ✅ Success Case
*   **Expected Response (200 OK)**:
    ```json
    [
      {
        "id": "...",
        "name": "Arjun Sharma",
        "username": "arjun_admin",
        "facility": {
          "id": "...",
          "name": "North Gate Weighing Yard"
        }
      }
    ]
    ```

### ❌ Failure Scenarios
1.  **Filter by Invalid Facility**:
    *   **Query**: `?facilityId=invalid-uuid`.
    *   **Response**: Returns an empty array `[]` or filtered results belonging only to the Seller.

---

## 🔍 API 3: Get Administrator Details (By ID)
Retrieves full profile and mapped permissions for a specific administrator.

*   **Endpoint**: `/administrators/:id`
*   **Method**: `GET`

### ✅ Success Case
*   **Expected Response (200 OK)**:
    ```json
    {
      "id": "...",
      "name": "Arjun Sharma",
      "username": "arjun_admin",
      "permissions": {
        "Facilities": { "canView": true, "canCreate": false, "canUpdate": false, "canDelete": false },
        "Users": { "canView": true, "canCreate": true, "canUpdate": false, "canDelete": false },
        "Billing": { "canView": true, "canCreate": false, "canUpdate": false, "canDelete": false }
      }
    }
    ```

### ❌ Failure Scenarios
1.  **Access Denied**:
    *   **Description**: Attempting to view an administrator belonging to another Seller.
    *   **Response**: `404 Not Found` - `"Administrator not found or access denied"`.

---

## 🛡️ API 4: Update Administrator Status
Enable or disable an administrator's account.

*   **Endpoint**: `/administrators/:id/status`
*   **Method**: `PATCH`

### ✅ Success Case
*   **Payload**: `{ "isActive": false }`
*   **Expected Response (200 OK)**: Updated administrator object.

### ❌ Failure Scenarios
1.  **Invalid Payload**:
    *   **Payload**: `{ "isActive": "no" }`
    *   **Response**: `400 Bad Request` (Validation error).

---
*Last Updated: February 28, 2026*
