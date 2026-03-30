# Purchase Invoice Module - API Testing Guide

This document provides request and response examples for testing the updated Purchase Invoice (PI) module.

## Endpoints Summary

| Feature | Method | Endpoint | Description |
|:---|:---:|:---|:---|
| **Suppliers List** | `GET` | `/purchase-invoices/suppliers` | List active suppliers for the dropdown. |
| **Supplier POs** | `GET` | `/purchase-invoices/supplier-pos?supplierName={name}` | Fetch POs for a selected supplier. |
| **Create PI** | `POST` | `/purchase-invoices` | Create a new PI. Supports file upload (Multipart). |
| **List PIs** | `GET` | `/purchase-invoices` | List all internal PIs with totals. |
| **Get PI** | `GET` | `/purchase-invoices/:id` | Get full details including items. |
| **Update PI** | `PATCH` | `/purchase-invoices/:id` | Update PI fields and items. Supports multipart. |
| **Export PIs** | `GET` | `/purchase-invoices/export?format={xlsx\|pdf}` | Export PIs to Excel or PDF report. |
| **Import PIs** | `POST` | `/purchase-invoices/import` | Import PIs from Excel file. |
| **Download Sample** | `GET` | `/purchase-invoices/sample-excel` | Download import template. |
| **Print PI** | `GET` | `/purchase-invoices/:id/print` | Preview PI as PDF in browser. |
| **Download PI PDF** | `GET` | `/purchase-invoices/:id/download` | Download PI as PDF file. |

---

## 1. Create Purchase Invoice
Backend generates an internal `invoiceNumber` (e.g., `INV-0001`).

### Form Data Requirements:
- `supplierInvoiceNumber`: **Required** (The physical number from vendor).
- `supplierInvoiceDate`: **Required** (The date on vendor invoice).
- `bookingDate`: Optional (Defaults to today's date).
- `challanNumber`: Optional (If missing, backend uses `supplierInvoiceNumber`).
- `items`: Required (JSON string: `[{"productCode":"P01","productName":"Item","quantity":5,"rate":100,"uom":"Ton"}]`).

### A. Create with Auto-Challan
- **Request:** `POST /purchase-invoices`
- **Body (JSON example):**
```json
{
  "supplierInvoiceNumber": "ABC-999",
  "supplierInvoiceDate": "2026-03-08",
  "supplierName": "SilverPeak Traders",
  "address": "24 Market Street, Mumbai",
  "creditDays": 30,
  "items": [
    {"productCode":"PD001","productName":"Maize","quantity":5,"rate":200,"uom":"Ton"}
  ]
}
```
*Verification: The created invoice's `challanNumber` will also be "ABC-999".*

---

## 2. Dynamic Selection (Dropdowns)

### Fetch Suppliers for Dropdown
- **Request:** `GET /purchase-invoices/suppliers`
- **Response:** List of suppliers including `accountName`, `addressLine1`, `supplierCreditDays`.

### Fetch POs for a Supplier
- **Request:** `GET /purchase-invoices/supplier-pos?supplierName=SilverPeak%20Traders`
- **Response:** List of PO objects `{id, poNumber}`.

---

## 3. Update Purchase Invoice
Use `PATCH /purchase-invoices/:id` with multipart support.

### Example Update:
- **Request:** `PATCH /purchase-invoices/1`
- **Body (Multipart):**
  - `supplierInvoiceNumber`: `"REV-ABC-999"` (Updated from original)
  - `items`: `[{"productCode":"PD001","productName":"Maize","quantity":10,"rate":210,"uom":"Ton"}]`
  - `file`: (Optionally upload a new scan)

### Verification:
- `grandTotal` will be recalculated based on new `items`.
- `cumulativeBalance` for this record will be adjusted by the difference.
- Old items will be removed and replaced with the new list.

---

## Testing Scenarios Checklist

1. [ ] **Supplier Fetch**: Verify list returns only active `SUNDRY_CREDITORS`.
2. [ ] **PO Selection**: Verify filtering returns correct POs for the selected name.
3. [ ] **Auto-Challan logic**: Leave `challanNumber` empty and verify it matches `supplierInvoiceNumber` in the response.
4. [ ] **Internal Numbering**: Verify the internal system number (e.g., `INV-0004`) is returned alongside the `supplierInvoiceNumber`.
5. [ ] **Mandatory fields**: Verify that missing `supplierInvoiceDate` returns a 400 error.
6. [ ] **Booking Date**: Verify that if `bookingDate` is not sent, the current server date is used.
