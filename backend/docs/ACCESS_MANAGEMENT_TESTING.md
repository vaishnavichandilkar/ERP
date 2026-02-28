# WeighPro API Testing: Access Management Module

This document provides a comprehensive test suite for the **Access Management** module, used by Sellers or Admins with the `manage_access` permission to oversee and control user roles and permissions across facilities.

**Prerequisites**:
- Successful login with a user possessing `manage_access` permission (e.g., Seller).
- A valid `userId` (uuid) of an existing Administrator or Operator.
- Authorization: `Bearer <token>`.

---

## 👥 API 1: List All Users
Retrieves a list of all sub-users (Administrators and Operators) within the Seller's purview, with optional facility filtering.

*   **Endpoint**: `/access/users`
*   **Method**: `GET`
*   **Query Parameters**: `facilityId` (optional)

### ✅ Success Case
*   **Description**: Get all users belonging to the Seller.
*   **Expected Response (200 OK)**:
    ```json
    [
      {
        "id": "UUID_USER_1",
        "name": "Arjun Sharma",
        "username": "arjun_admin",
        "role": "ADMINISTRATOR",
        "facility": { "name": "North Gate Weighing Yard" }
      },
      {
        "id": "UUID_USER_2",
        "name": "Sameer Khan",
        "username": "sam_ops",
        "role": "OPERATOR",
        "facility": { "name": "North Gate Weighing Yard" }
      }
    ]
    ```

### ❌ Failure Scenarios
1.  **Unauthorized**:
    *   **Header**: Missing Bearer Token.
    *   **Response**: `401 Unauthorized`.
2.  **No Permission**:
    *   **Description**: User lacks `manage_access` permission.
    *   **Response**: `403 Forbidden`.

---

## 🔑 API 2: View User Permissions
Retrieves the specific granular permissions mapped for a given user.

*   **Endpoint**: `/access/users/:id/permissions`
*   **Method**: `GET`

### ✅ Success Case
*   **Target**: Administrator or Operator `id`.
*   **Expected Response (200 OK)**:
    ```json
    {
      "Facilities": { "canView": true, "canCreate": true, "canUpdate": false, "canDelete": false },
      "Users": { "canView": true, "canCreate": true, "canUpdate": false, "canDelete": false },
      "Inventory": { "canView": true, "canCreate": false, "canUpdate": false, "canDelete": false }
    }
    ```

### ❌ Failure Scenarios
1.  **User Not Found**:
    *   **Target**: Invalid/non-existent UUID.
    *   **Response**: `404 Not Found`.

---

## 🛠️ API 3: Update User Permissions
Modifies the permission set for an existing user. Updates are reflected instantly.

*   **Endpoint**: `/access/users/:id/permissions`
*   **Method**: `PATCH`

### ✅ Success Case (Administrator)
*   **Payload**:
    ```json
    {
      "administratorAccess": {
        "facilityManagement_edit": true,
        "billing_print": true
      }
    }
    ```
*   **Expected Response (200 OK)**: Returns the updated permission matrix.

### ✅ Success Case (Operator)
*   **Payload**:
    ```json
    {
      "operatorAccess": {
        "report_view": true
      }
    }
    ```
*   **Expected Response (200 OK)**: Returns the updated permission matrix.

### ❌ Failure Scenarios
1.  **Mismatch Payload**:
    *   **Description**: Sending `operatorAccess` for an Administrator user.
    *   **Response**: `400 Bad Request` or ignored update depending on service logic.

---

## 🚫 API 4: Update User Status (Activate/Deactivate)
Instantly blocks or restores access for a specific user.

*   **Endpoint**: `/access/users/:id/status`
*   **Method**: `PATCH`

### ✅ Success Case
*   **Payload**: `{ "isActive": false }`
*   **Expected Response (200 OK)**:
    ```json
    {
      "id": "UUID_USER_1",
      "isActive": false,
      "message": "Status updated successfully"
    }
    ```

### ❌ Failure Scenarios
1.  **Self-Deactivation**:
    *   **Description**: Trying to deactivate your own account (if protected by service).
    *   **Response**: `400 Bad Request`.

---
*Last Updated: February 28, 2026*
