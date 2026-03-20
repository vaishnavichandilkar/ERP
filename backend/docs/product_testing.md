# Product Master Module - Testing Guide

This document outlines the detailed testing scenarios for the `Product Master` module to ensure that all business logic, relationships, validations, and API contracts perform as expected.

## 1. Prerequisites and Setup

Before testing `Product` entities, ensure the following mock data is seeded or correctly exists in the database.
- **System UOM Library:** At least one valid UOM (e.g., `id: 1, uom_code: "KG"`).
- **Categories:** At least one active category (e.g., `id: 1, name: "Electronics"`).
- **Sub Categories:** Linked to the above category (e.g., `id: 1, category_id: 1, name: "Mobiles"`).
- **HSN Master:** Valid HSN code existing in the master (e.g., `hsn_code: "8517"`, `gst_rate: 18.0`).
- **Authorization Token:** Bearer token belonging to either a master admin or standard authorized user.

---

## 2. API Endpoints Testing

### 2.1 Create Product (`POST /products`)

| Scenario | Payload Details | Expected Output | Status Code | Notes |
|----------|----------------|-----------------|-------------|-------|
| ✅ **Successful Creation** | Valid `product_name`, `uom_id`, `product_type`, `category_id`, `sub_category_id`, and `hsn_code`. | Returns complete product object including relationship entities (UOM, Category, HSN). | `201 Created` | Verify `tax_rate` is populated using the provided `hsn_code`. Verify `product_code` is auto-generated in `PD00001` format. |
| ❌ **Missing Required Fields** | Payload omit one or more of required fields e.g., `product_name`. | Throws validation error message specifying the missing field. | `400 Bad Request` | Test for `uom_id`, `product_type`, `hsn_code`, `category_id`, `sub_category_id`. |
| ❌ **Invalid UOM ID** | Valid payload but `uom_id` does not exist in the database. | `Invalid UOM ID` | `400 Bad Request` | |
| ❌ **Invalid Category/Sub Category Relation** | `sub_category_id` exists, but its linked `category_id` does not match the passed `category_id`. | `Invalid Sub Category ID or it does not belong to the selected Category` | `400 Bad Request` | Ensure structural relations are respected. |
| ❌ **Unknown HSN Code** | Complete payload but `hsn_code` does not exist against `hsn_master`. | `HSN Code not found in master` | `400 Bad Request` | Verifies HSN probing functionality. |
| ❌ **Frontend Injecting Constraints** | Payload attempts to hijack auto-generations by passing `product_code`, `tax_rate` explicitly. | The explicitly passed payload should be dropped/ignored. | `201 Created` | API must force calculate tax via HSN ignoring passed params. |

---

### 2.2 Get Product List (`GET /products`)

| Scenario | Query Parameters | Expected Output | Status Code | Notes |
|----------|------------------|-----------------|-------------|-------|
| ✅ **List All Records** | `?page=1&limit=10` | Returns `{ products: [...], total: X, totalPages: Y }`. | `200 OK` | `is_deleted` records should NOT be part of this output. |
| ✅ **Search by Name** | `?search=Samsung` | Returns products matching `product_name` dynamically. | `200 OK` | Search should be case-insensitive. |
| ✅ **Search by Product Code** | `?search=PD000` | Returns products containing matching PRD code sequence. | `200 OK` | |
| ✅ **Search by HSN** | `?search=8517` | Returns products strictly tied to targeted `hsn_code`. | `200 OK` | |
| ✅ **Filter by UOM** | `?uom_id=1` | Returns only products having exactly matching `uom_id`. | `200 OK` | |
| ✅ **Filter by Status** | `?status=active` | Returns active products (where `is_active` is true). | `200 OK` | Try `status=inactive`. |
| ✅ **Filter by Product Type**| `?product_type=GOODS`| Returns records with specified type only. | `200 OK` | Supported ENUMs: `GOODS`, `SERVICES`. |

---

### 2.3 Get Single Product (`GET /products/:id`)

| Scenario | Path Parameter (`id`) | Expected Output | Status Code | Notes |
|----------|-----------------------|-----------------|-------------|-------|
| ✅ **Valid Product Fetch** | Valid Existing ID | Complete record returned along with included models (`Category`, `uom`). | `200 OK` | |
| ❌ **Fetch Invalid ID** | ID that does not exist | `Product not found` | `404 Not Found` | |
| ❌ **Fetch Soft-Deleted ID** | ID of deleted product | `Product not found` | `404 Not Found` | Soft deletion ensures fetched record isn't presented. |

---

### 2.4 Update Product (`PUT /products/:id`)

| Scenario | Payload Details | Expected Output | Status Code | Notes |
|----------|----------------|-----------------|-------------|-------|
| ✅ **Update Basic Info** | `{ "description": "Updated detail" }` | Updates only partial fields mentioned. | `200 OK` | |
| ✅ **Update HSN Effect** | `{ "hsn_code": "newValidCode" }` | Triggers fetching new `gst_rate` updating the `tax_rate` directly. | `200 OK` | Double check that `tax_rate` changes in the response payload. |
| ❌ **Update Invalid Relation** | `{ "sub_category_id": 999 }` | Fails because Sub Category 999 isn't under the existing Category | `400 Bad Request` | The relational validation logic should execute consistently on PUT APIs. |

---

### 2.5 Toggle Product Status (`PATCH /products/:id/status`)

| Scenario | Payload Details | Expected Output | Status Code | Notes |
|----------|----------------|-----------------|-------------|-------|
| ✅ **Turn Inactive** | `{ "is_active": false }` | Sets flag `is_active: false` gracefully. | `200 OK` | Confirmed disabled product |
| ✅ **Turn Active** | `{ "is_active": true }` | Resets `is_active` to `true`. | `200 OK` | |

---

### 2.6 Delete Product (`DELETE /products/:id`)

| Scenario | Path Parameter (`id`) | Expected Output | Status Code | Notes |
|----------|-----------------------|-----------------|-------------|-------|
| ✅ **Soft Deletion** | Valid Active Product ID | Marks `is_deleted` as true (Soft Deletion). | `200 OK` | Verify by running GET `/products/:id` receiving a `404 Not Found` even if data natively persists on Database table. |

---

## 3. Core Business Logic Audit

- **Product Generation Sequence Tracker:**
  - Create the 1st Product: Output -> `PD00001`
  - Create the 2nd Product: Output -> `PD00002`
  - Test scenario where Database holds `PD00015` as the latest ID. Creation should automatically yield -> `PD00016`.
- **Taxation Flow Rules:**
  - HSN input decides Taxation mapping inside Database records natively. The Product Table shouldn't have taxation logic directly dependent on the frontend sending manual floats. Tests MUST confirm injection immunity of taxes parameter payload.
