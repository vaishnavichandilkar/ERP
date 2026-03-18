# Account Master API Testing Guide

This document provides a comprehensive guide for testing the **Account Master** module. The Account Master is used to manage Suppliers and Customers, along with their associated details such as GST, PAN, Address, Contact Persons, MSME details (for MSME customers), and Documents.

## Overview
The Account Master module supports multipart/form-data for file uploads, specifically for MSME certificates and other miscellaneous documents. It is protected by JWT authentication.

**Base URL**: `{{API_URL}}/api/v1/account-master`

---

## 1. API Endpoints Detail

### A. Create New Account
- **URL**: `POST /`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Body Options (Form-Data)**:
  - `accountName`: "Acme Corp"
  - `groupName`: '["SUPPLIER", "CUSTOMER"]' *(JSON stringified array)*
  - `gstNo`: "22AAAAA0000A1Z5"
  - `panNo`: "AAAAA0000A"
  - `addressLine1`: "123 Business Street"
  - `addressLine2`: "Suite 100"
  - `pincode`: "400001"
  - `area`: "Fort"
  - `subDistrict`: "Mumbai"
  - `district`: "Mumbai"
  - `state`: "Maharashtra"
  - `country`: "India"
  - `contactPerson`: '{"firstName":"John","lastName":"Doe","email":"john@acme.com","mobileNo":"9876543210","designation":"Manager"}' *(JSON stringified object)*
  - `supplier`: '{"creditDays":30,"creditLimit":100000}' *(JSON stringified object)*
  - `customer`: '{"creditDays":45,"creditLimit":500000}' *(JSON stringified object)*
  - `msmeEnabled`: "true" / "false"
  - `msmeDetails`: '{"msmeRegistrationNo":"UDYAM-XX-00-0000000","registrationType":"MICRO"}' *(JSON stringified object)*
  - `msmeCertificate`: *[File Upload] (Max 1 file)*
  - `otherDocuments`: *[Multiple File Uploads] (Max 5 files)*

### B. Get All Accounts
Fetches all accounts with optional filtering and pagination.
- **URL**: `GET /`
- **Method**: `GET`
- **Query Parameters**:
  - `groupName` (Optional): "SUPPLIER" or "CUSTOMER"
  - `gstNo` (Optional)
  - `panNo` (Optional)
  - `creditDays` (Optional)
  - `status` (Optional): "ACTIVE" or "INACTIVE"
  - `search` (Optional): Search term for account name/email/phone
  - `page` (Optional): Default 1
  - `limit` (Optional): Default 10

### C. Get Single Account details
Fetches full details of a specific account by ID.
- **URL**: `GET /:id`
- **Method**: `GET`

### D. Update Account Details
Updates the details of an existing account.
- **URL**: `PUT /:id`
- **Method**: `PUT`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - Same format as POST `/` (Create New Account).

### E. Toggle Account Status
Changes account status between `ACTIVE` and `INACTIVE`.
- **URL**: `PATCH /:id/status`
- **Method**: `PATCH`
- **Request Body (JSON)**:
  ```json
  {
    "status": "INACTIVE"
  }
  ```

### F. Pincode Details Lookup
Fetches city, district, state, and country details based on a given pincode.
- **URL**: `GET /pincode/:pincode`
- **Method**: `GET`
- **Success Response (200)**: returns an array of matching locations.

### G. Generate Codes
Generates the next sequential alphanumeric identifier.
- **URL (Customer)**: `GET /generate-customer-code`
- **URL (Supplier)**: `GET /generate-supplier-code`

### H. Export Accounts
Exports the filtered list of accounts.
- **URL**: `GET /export`
- **Method**: `GET`
- **Query Parameters**:
  - `format` (Required): "xlsx" or "pdf"
  - Additional filters similar to the GET All Accounts (`groupName`, `gstNo`, `status`, `search`).

---

## 2. API Testing Scenarios (Postman / CURL)

### 1. Account Creation (Multipart Form-Data)
1. **Setup**: In Postman, set method to `POST` and URL to `/api/v1/account-master`.
2. **Body**: Select `form-data`.
3. Add text fields: `accountName`, `groupName` (as `["SUPPLIER"]`), `pincode`, etc.
4. Add JSON text fields: `contactPerson` -> `{"firstName":"Test","mobileNo":"9999999999"}`.
5. Add file field: Change field type to `File`, set key to `otherDocuments`, and select an image/pdf.
6. **Verify**: The server should respond with 201 Created and the exact nested objects built accurately in the response.

### 2. Auto Generate Supplier Code
1. **Setup**: Call `GET /api/v1/account-master/generate-supplier-code`.
2. **Verify**: It should return `{"supplierCode": "S-0001"}` (or subsequent sequence).

### 3. Pincode Auto-Fill
1. **Setup**: Call `GET /api/v1/account-master/pincode/400001`.
2. **Verify**: Gives details containing Fort, Mumbai, Maharashtra etc.

### 4. Updating a File
1. **Setup**: Call `PUT /api/v1/account-master/:id` for an existing account ID.
2. Provide form-data with modified fields and upload a new `msmeCertificate`.
3. **Verify**: Check `GET /api/v1/account-master/:id` to ensure `msmeDetails.certificateUrl` has been updated with the new filename format.

### 5. Fetch Filtered List
1. **Setup**: Add 1 Supplier and 1 Customer.
2. Call `GET /api/v1/account-master?groupName=CUSTOMER&page=1&limit=5`.
3. **Verify**: Only the customer account shows in the data array, and pagination meta is correct.
