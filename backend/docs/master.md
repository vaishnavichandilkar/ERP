# Master Data Testing Guidance

This document provides a comprehensive guide for testing the **Master Data** modules, specifically focusing on the **Unit Master** implementation.

---

## 1. Unit Master API Testing

### **API 1 — Get GST UOM List**
- **Endpoint**: `GET /api/masters/gst-uom`
- **Purpose**: Verify that all seeded GST UQC codes are returned.
- **Test Case**:
    - Call the endpoint.
    - Check if the response contains `data` as an array.
    - Verify codes like `BAG`, `KGS`, `PCS`, `NOS` are present.
- **Expected Status**: `200 OK`

### **API 2 — Create Unit**
- **Endpoint**: `POST /api/masters/unit`
- **Payload**:
    ```json
    {
      "unitName": "Kilogram",
      "gstUom": "KGS",
      "description": "Standard weight measurement"
    }
    ```
- **Test Cases**:
    - **Success**: Create a new unique unit.
    - **Duplicate Error**: Try creating the same `unitName` again. (Expected: `409 Conflict`)
    - **Invalid UOM**: Try creating with a `gstUom` that doesn't exist in the GST table. (Expected: `400 Bad Request`)
- **Expected Status**: `201 Created`

### **API 3 — Get Units List**
- **Endpoint**: `GET /api/masters/unit`
- **Features**:
    - **Pagination**: Test `?page=1&limit=5`.
    - **Search**: Test `?search=Kilo`.
    - **Filter**: Test `?status=ACTIVE` or `?gstUom=KGS`.
    - **Sorting**: Test `?sortBy=unitName&sortOrder=asc`.
- **Expected Status**: `200 OK`

### **API 4 — View Unit Detail**
- **Endpoint**: `GET /api/masters/unit/:id`
- **Test Case**:
    - Pass a valid `id`. Check if full details (including `gstUqc` relation) are returned.
    - Pass an invalid `id`. (Expected: `404 Not Found`)
- **Expected Status**: `200 OK`

### **API 5 — Update Unit**
- **Endpoint**: `PUT /api/masters/unit/:id`
- **Payload**:
    ```json
    {
      "unitName": "Kg Updated",
      "status": "INACTIVE"
    }
    ```
- **Test Cases**:
    - Partial update.
    - Update name to a name that already exists in another record. (Expected: `409 Conflict`)
- **Expected Status**: `200 OK`

### **API 6 — Change Unit Status (Patch)**
- **Endpoint**: `PATCH /api/masters/unit/:id/status`
- **Payload**:
    ```json
    {
      "status": "INACTIVE"
    }
    ```
- **Purpose**: Test the soft-update functionality for toggling unit availability.
- **Expected Status**: `200 OK`

---

## 2. Business Rules Checklist

- [ ] **Uniqueness**: `unitName` must be unique across all records.
- [ ] **Reference Validation**: `gstUom` must correspond to a valid `uqcCode` in the `gst_uqc_master` table.
- [ ] **Soft Delete**: Records are not hard-deleted; instead, `status` is toggled to `INACTIVE`.
- [ ] **Search**: The search functionality is case-insensitive for `unitName`.

---

## 3. Database Verification (Prisma Studio)

To manually verify calculations or verify seeding:
1. Run `npx prisma studio` in the `backend` directory.
2. Select the `GstUqcMaster` table to see the 44 default codes.
3. Select the `UnitMaster` table to verify created entries.

---

## 4. Auth Verification

Ensure that the `Authorization` header with a valid **Superadmin/Admin Bearer Token** is included in all requests, as these endpoints are protected by `JwtAuthGuard`.
