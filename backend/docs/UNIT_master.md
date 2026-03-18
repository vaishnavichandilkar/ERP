# Master Data Testing Guidance

This document provides a comprehensive guide for testing the **Master Data** modules, specifically focusing on the updated **Unit Master** implementation.

---

## 1. Unit Master API Testing

### **API 1 — Get System UOM Library**
- **Endpoint**: `GET /api/master/unit-library`
- **Purpose**: Verify that the 54 seeded system UOM library records are returned correctly.
- **Parameters**: 
    - `search` (optional): Filter by name or code.
    - `gstUom` (optional): Filter by specific UOM code.
- **Test Case**:
    - Call the endpoint without parameters.
    - Check if the response contains `data` as an array of 54 items.
    - Verify records like `BAGS | Quantity | BAG` are present.
- **Expected Status**: `200 OK`

### **API 2 — Add Unit (Library Smart Link)**
- **Endpoint**: `POST /api/v1/master/add-unit`
- **Payload**:
    ```json
    {
      "unit_name": "Quantity",
      "gst_uom": "BAG",
      "full_name_of_measurement": "BAGS"
    }
    ```
- **Logic**:
    - **Duplicate Check**: Checks if same `gst_uom` already exists for the logged-in user (`user_id`). (Returns "Unit already added").
    - **Smart Tracking**:
        - If `gst_uom` exists in the system library → Sets `source = SYSTEM`.
        - If `gst_uom` is custom → Sets `source = USER`.
    - **Flexibility**: Multiple different UOMs (e.g., BAG, PCS) are allowed under the same `unit_name` (e.g., Quantity).
- **Expected Status**: `201 Created`

### **API 3 — Get User Units List**
- **Endpoint**: `GET /api/master/units`
- **Purpose**: Fetch units belonging to the logged-in user.
- **Features**:
    - **Pagination**: Test `?page=1&limit=5`.
    - **Search**: Test `?search=BAG`.
    - **Isolation**: Ensure units from other users are NOT returned.
- **Expected Status**: `200 OK`

### **API 4 — View Unit Detail**
- **Endpoint**: `GET /api/master/unit/:id`
- **Test Case**:
    - Pass a valid `id` owned by the user.
    - Pass an `id` owned by another user (Expected: `404 Not Found`).
- **Expected Status**: `200 OK`

### **API 5 — Update Unit**
- **Endpoint**: `PUT /api/master/unit/:id`
- **Payload**:
    ```json
    {
      "unit_name": "Updated Name"
    }
    ```
- **Logic**: If any field update causes the unit to no longer match the library, `source` should toggle to `USER`. If it matches, it should be `SYSTEM`.
- **Expected Status**: `200 OK`

### **API 6 — Change Unit Status (Toggle)**
- **Endpoint**: `PATCH /api/master/unit/:id/status`
- **Payload**:
    ```json
    {
      "status": "INACTIVE"
    }
    ```
- **Purpose**: Toggle the unit between `ACTIVE` and `INACTIVE` status instead of deleting.
- **Expected Status**: `200 OK`

### **API 7 — Get Unit Names (Dropdown 1)**
- **Endpoint**: `GET /api/master/unit-names`
- **Purpose**: Return distinct unit types (e.g., "Quantity", "Mass").
- **Expected Status**: `200 OK`

### **API 8 — Get UOM by Unit Name (Dropdown 2)**
- **Endpoint**: `GET /api/master/uom/:unit_name`
- **Purpose**: Return relevant UOM codes (e.g., "BAG", "KGS") for the selected unit type.
- **Expected Status**: `200 OK`

### **API 9 — Get Measurement by UOM (Auto-fill)**
- **Endpoint**: `GET /api/master/measurement/:uom_code`
- **Purpose**: Return the full name (e.g., "BAGS") for the selected UOM.
- **Expected Status**: `200 OK`

---

## 2. Business Rules Checklist

- [ ] **Uniqueness**: The combination of `user_id` and `gst_uom` must be unique. Multiple units can share the same `unit_name`.
- [ ] **Required Fields**: `unit_name`, `gst_u_om`, and `full_name_of_measurement` are compulsory.
- [ ] **Default Status**: All new units are saved as `ACTIVE` by default.
- [ ] **No Deletion**: Units cannot be deleted; they can only be deactivated.
- [ ] **Source Detection**: 
    - `SYSTEM`: Values match `system_uom_library`.
    - `USER`: Custom values entered by the user.
- [ ] **Read-only Protection**: System library units (source = SYSTEM) cannot be edited.
- [ ] **Dependent Dropdowns**: Frontend uses APIs 7, 8, and 9 to drive the auto-fill logic.
- [ ] **Data Isolation**: Users manage their own units independently.

---

## 3. Database Verification (Prisma Studio)

To manually verify the structure and seeding:
1. Run `npx prisma studio` in the `backend` directory.
2. **`system_uom_library`**: Verify 54 records are present.
3. **`unit_master`**: Verify `user_id`, `source`, and updated field names.

---

## 4. Auth Verification

Ensure that the `Authorization` header with a valid **Bearer Token** is included. The user ID is extracted from the token to isolate unit data.
