# WeighPro API Testing: Facilities Module

This document provides a comprehensive test suite for the **Facilities** module, covering all endpoints with both success and failure scenarios for use in **Swagger UI** or **Postman**.

**Prerequisites**:
- Successful Seller login (Obtain `accessToken`).
- Authorization: `Bearer <token>`.

---

## 🏗️ API 1: Create Facility
Used by an approved Seller or Superadmin to create a new weighing station.

*   **Endpoint**: `POST /facilities`
*   **Method**: `POST`

### ✅ Success Case
*   **Description**: Create a facility with valid data.
*   **Payload**:
    ```json
    {
      "name": "North Gate Weighing Yard",
      "location": "Industrial Hub - Zone A",
      "address": "Plot 42, Service Road, Sector 5",
      "totalMachines": 3,
      "gstNumber": "22AAAAA0000A1Z5"
    }
    ```
*   **Expected Response (201 Created)**:
    ```json
    {
      "id": "UUID_GENERATED",
      "name": "North Gate Weighing Yard",
      "location": "Industrial Hub - Zone A",
      "address": "Plot 42, Service Road, Sector 5",
      "totalMachines": 3,
      "gstNumber": "22AAAAA0000A1Z5",
      "status": "ACTIVE",
      "isDeleted": false,
      "sellerId": "SELLER_UUID",
      "createdAt": "TIMESTAMP",
      "updatedAt": "TIMESTAMP"
    }
    ```

### ❌ Failure Scenarios
1.  **Missing Required Fields**:
    *   **Payload**: `{"name": "Incomplete"}`
    *   **Response**: `400 Bad Request` (Validation error listing missing fields like `address`, `location`).
2.  **Unauthorized**:
    *   **Header**: Missing Bearer Token.
    *   **Response**: `401 Unauthorized`.
3.  **Forbidden Access**:
    *   **Description**: Trying to create a facility without `facilityManagement_add` permission (for sub-users).
    *   **Response**: `403 Forbidden`.

---

## 📋 API 2: Get All Facilities
Retrieves the list of facilities belonging to the logged-in Seller.

*   **Endpoint**: `GET /facilities`
*   **Method**: `GET`

### ✅ Success Case
*   **Expected Response (200 OK)**:
    ```json
    [
      {
        "id": "...",
        "name": "North Gate Weighing Yard",
        "status": "ACTIVE",
        "totalMachines": 3
      }
    ]
    ```

### ❌ Failure Scenarios
1.  **Unauthorized**:
    *   **Response**: `401 Unauthorized`.
2.  **No Permission**:
    *   **Description**: Logged-in user lacks `facilityManagement_view` permission.
    *   **Response**: `403 Forbidden`.

---

## 🔍 API 3: View Facility (By ID)
Retrieves specific details of a single facility.

*   **Endpoint**: `GET /facilities/:id`
*   **Method**: `GET`

### ✅ Success Case
*   **Target**: Use a valid `id` from the list.
*   **Expected Response (200 OK)**: Full facility object including `address`, `gstNumber`, etc.

### ❌ Failure Scenarios
1.  **Resource Not Found**:
    *   **Target**: Invalid/non-existent UUID.
    *   **Response**: `404 Not Found` - `"Facility not found or access denied"`.
2.  **Ownership Mismatch**:
    *   **Description**: Trying to view a facility owned by a different Seller.
    *   **Response**: `404 Not Found` (Hidden for security).

---

## ✏️ API 4: Update Facility
Modify details of an existing facility.

*   **Endpoint**: `PUT /facilities/:id`
*   **Method**: `PUT`

### ✅ Success Case
*   **Payload**:
    ```json
    {
      "name": "Updated Yard Name",
      "totalMachines": 5
    }
    ```
*   **Expected Response (200 OK)**: Updated object.

### ❌ Failure Scenarios
1.  **Bad Request**: Invalid data types (e.g., `totalMachines: "five"`).
2.  **Not Found**: Updating a non-existent or deleted facility.
3.  **Forbidden**: Missing `facilityManagement_edit` permission.

---

## ⚙️ API 5: Update Status (Activate/Deactivate)
Toggles the active status of a facility.

*   **Endpoint**: `PATCH /facilities/:id/status`
*   **Method**: `PATCH`

### ✅ Success Case
*   **Payload**: `{ "status": "INACTIVE" }`
*   **Expected Response (200 OK)**: Updated status.

### ❌ Failure Scenarios
1.  **Invalid Status**: Payload `{ "status": "PENDING" }`.
    *   **Response**: `400 Bad Request`.

---

## 🗑️ API 6: Delete Facility (Soft Delete)
Marks a facility as deleted without removing from DB.

*   **Endpoint**: `DELETE /facilities/:id`
*   **Method**: `DELETE`

### ✅ Success Case
*   **Expected Response (200 OK)**: Object with `isDeleted: true`.

### ❌ Failure Scenarios
1.  **Already Deleted**: Trying to delete a facility that is already marked as deleted.
    *   **Response**: `404 Not Found`.

---
*Last Updated: February 28, 2026*
