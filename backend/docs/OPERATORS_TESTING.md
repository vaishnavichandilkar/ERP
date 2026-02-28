# WeighPro API Testing: Operators Module

This document provides a comprehensive test suite for the **Operators** module, focusing on machine-level users who handle day-to-day weighing tasks.

**Prerequisites**:
- Successful Seller login or Superadmin login (obtain `accessToken`).
- A valid `facilityId` belonging to the Seller.
- Authorization: `Bearer <token>`.

---

## 👨‍💻 API 1: Create Operator
Creates a new facility-level Operator with view-only or limited permissions.

*   **Endpoint**: `/operators`
*   **Method**: `POST`

### ✅ Success Case
*   **Description**: Create an operator with valid data and basic view-only access.
*   **Payload**:
    ```json
    {
      "name": "Sameer Khan",
      "username": "sam_ops",
      "mobile": "9988776655",
      "facilityId": "UUID_OF_FACILITY",
      "permissions": {
        "facilityManagement_view": true,
        "productManagement_view": true,
        "billing_view": true,
        "report_view": true
      }
    }
    ```
*   **Expected Response (201 Created)**:
    ```json
    {
      "id": "UUID_GENERATED",
      "name": "Sameer Khan",
      "username": "sam_ops",
      "mobile": "9988776655",
      "facilityId": "UUID_OF_FACILITY",
      "isActive": true,
      "createdAt": "TIMESTAMP",
      "updatedAt": "TIMESTAMP"
    }
    ```

### ❌ Failure Scenarios
1.  **Duplicate Username**:
    *   **Payload**: Using a `username` that already exists (e.g., `opsam`).
    *   **Response**: `409 Conflict` - `"Username already exists"`.
2.  **Missing Facility**:
    *   **Payload**: Omit the `facilityId`.
    *   **Response**: `400 Bad Request` (Validation error).
3.  **Unauthorized**:
    *   **Header**: Missing Bearer Token.
    *   **Response**: `401 Unauthorized`.

---

## 📋 API 2: List Operators
Retrieves all operators owned by the Seller, with optional facility filtering.

*   **Endpoint**: `/operators`
*   **Method**: `GET`
*   **Query Parameters**: `facilityId` (optional)

### ✅ Success Case
*   **Expected Response (200 OK)**:
    ```json
    [
      {
        "id": "...",
        "name": "Sameer Khan",
        "username": "sam_ops",
        "facility": {
          "id": "...",
          "name": "North Gate Weighing Yard"
        }
      }
    ]
    ```

### ❌ Failure Scenarios
1.  **Ownership Check**:
    *   **Description**: Ensures the Seller cannot see operators from facilities they do not own.

---

## 🔍 API 3: Get Operator Details (By ID)
Retrieves full profile and mapped permissions for a specific operator.

*   **Endpoint**: `/operators/:id`
*   **Method**: `GET`

### ✅ Success Case
*   **Expected Response (200 OK)**:
    ```json
    {
      "id": "...",
      "name": "Sameer Khan",
      "username": "sam_ops",
      "permissions": {
        "Facilities": { "canView": true, "canCreate": false, "canUpdate": false, "canDelete": false },
        "Products": { "canView": true, "canCreate": false, "canUpdate": false, "canDelete": false },
        "Reports": { "canView": true, "canCreate": false, "canUpdate": false, "canDelete": false }
      }
    }
    ```

### ❌ Failure Scenarios
1.  **Access Denied**:
    *   **Description**: Attempting to view an operator belonging to another Seller's facility.
    *   **Response**: `404 Not Found` - `"Operator not found or access denied"`.

---

## 🛡️ API 4: Update Operator Status
Enable or disable an operator's account.

*   **Endpoint**: `/operators/:id/status`
*   **Method**: `PATCH`

### ✅ Success Case
*   **Payload**: `{ "isActive": false }`
*   **Expected Response (200 OK)**: Updated operator object.

### ❌ Failure Scenarios
1.  **Invalid Payload**:
    *   **Payload**: `{ "isActive": "no" }`
    *   **Response**: `400 Bad Request`.

---
*Last Updated: February 28, 2026*
