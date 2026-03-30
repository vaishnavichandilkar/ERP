# Purchase Order Module - API Testing Guide

This document provides request and response examples for testing the Purchase Order (PO) module.

## Endpoints Summary

| Feature | Method | Endpoint | Description |
|:---|:---:|:---|:---|
| **Supplier Details** | `GET` | `/purchase-orders/supplier/:id` | Auto-fetch Address, GST, PAN, and Credit Days from Account Master. |
| **Product Search** | `GET` | `/products?search={term}` | List products for the item selection dropdown. |
| **Create PO** | `POST` | `/purchase-orders` | Create a new PO with automatic PO number (e.g., PO00001). |
| **List POs** | `GET` | `/purchase-orders` | List all POs with filters (expiring, expired). |
| **Get PO** | `GET` | `/purchase-orders/:id` | Get full details including items. |
| **Update PO** | `PATCH` | `/purchase-orders/:id` | Update pending PO details or items. |
| **Delete PO** | `DELETE` | `/purchase-orders/:id` | Soft delete PO (Status: DELETED). |

---

## 1. Auto-fetch Supplier Details
Use this when a user selects a supplier from the dropdown.

- **Request:** `GET /purchase-orders/supplier/1`

- **Response (200 OK):**
```json
{
  "supplierName": "ABC Enterprise",
  "address": "123 industrial area, Phase 2, Mumbai",
  "gstNumber": "27AAACB1234F1Z1",
  "panNumber": "AAACB1234F",
  "creditDays": 30
}
```

## 2. Product Search (Dropdown)
Use this to populate the product selection dropdown in the PO form.

- **Request:** `GET /products?search=weighting&limit=10`

- **Response (200 OK):**
```json
{
  "products": [
    {
      "id": 5,
      "product_name": "Electronic Weighting Scale 100kg",
      "product_code": "PD00005",
      "hsn_code": "8423",
      "tax_rate": 18,
      "uom": { "unit_name": "NOS" }
    }
  ],
  "total": 1,
  "totalPages": 1
}
```

## 3. Create Purchase Order
Automatically generates `poNumber` starting from `PO00001` and `poCreationDate` as the current date.

- **Pre-requisite:** All fields are **required** in the request to ensure complete orders.

- **Request:** `POST /purchase-orders`
```json
{
  "supplierId": 1,
  "creditDays": 45,
  "expiryDate": "2026-04-15",
  "items": [
    {
      "productCode": "PD00005",
      "productName": "Electronic Weighting Scale 100kg",
      "hsnCode": "8423",
      "quantity": 10,
      "rate": 1500,
      "uom": "NOS",
      "discountPercent": 5,
      "taxPercent": 18
    }
  ]
}
```

- **Features:** 
    - `creditDays` can be overridden (e.g., from 30 to 45).
    - `PO Number` generated automatically (e.g., `PO00001`).
    - `poCreationDate` defaults to current date.

## 4. List Purchase Orders with Dashboard Filters
Filter POs based on their lifecycle and expiry status.

- **Pending (Active):** `GET /purchase-orders?filter=pending` (Not expiring within 48h)
- **Expiring Soon:** `GET /purchase-orders?filter=expiring` (Remaining < 48h)
- **Expired:** `GET /purchase-orders?filter=expired` (Expiry date reached)
- **Completed:** `GET /purchase-orders?filter=completed` (Converted to Invoice)
- **Deleted:** `GET /purchase-orders?filter=deleted` (Soft deleted orders)
- **Combined Search:** `GET /purchase-orders?filter=pending&search=PO00001`

## 5. Update PO
Only allowed for POs with status `PENDING`.

- **Request:** `PATCH /purchase-orders/1`
```json
{
  "creditDays": 60,
  "items": [
    {
      "productCode": "PD00005",
      "productName": "Electronic Weighting Scale 100kg",
      "hsnCode": "8423",
      "quantity": 15,
      "rate": 1500,
      "uom": "NOS",
      "discountPercent": 10,
      "taxPercent": 18
    }
  ]
}
```

## 6. Bulk Operations (Export & Import)

### Export Purchase Orders
Download all POs (or filtered ones) in Excel or PDF format.

- **Request (XLSX):** `GET /purchase-orders/export?format=xlsx&filter=pending`
- **Request (PDF):** `GET /purchase-orders/export?format=pdf`

### Download Template
Get the correct Excel layout for importing POs.

- **Request:** `GET /purchase-orders/download-template`

### Import Purchase Orders
Upload a filled XLSX template to create multiple POs at once.

- **Request:** `POST /purchase-orders/import` (Form-data with `file`)

---

## 7. Print & Preview

### Preview Purchase Order (PDF)
Generate a professional, ready-to-print PDF for a specific PO.

- **Request:** `GET /purchase-orders/:id/print`
- **Verification**: The PDF should open in the browser (inline) with company branding, tax breakdown, and total in words.

---

## Testing Scenarios Checklist

1. [ ] **Auto-gen Numbering**: Verify the first PO is `PO00001` and the next is `PO00002`.
2. [ ] **Calculations**: Ensure `totalAmount`, `taxAmount`, and `grandTotal` are calculated correctly by the backend.
3. [ ] **Validation**: Verify that missing any required fields (e.g., `expiryDate`) returns a 400 error.
4. [ ] **Soft Delete**: Verify that after deletion, the PO remains in the DB but status changes to `DELETED`.
5. [ ] **Supplier Fetch**: Verify that selecting a different supplier fetches correct Address and GST details.
6. [ ] **Export Integrity**: Open the exported XLSX and PDF to ensure all columns (PO No, Supplier, Amount, Tax) are populated and formatted correctly.
7. [ ] **Print Accuracy**: Open the Preview PDF and verify that "Amount In Words" matches the Grand Total exactly.
