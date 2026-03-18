# Group Master API & UI Testing Guide

This document provides a comprehensive guide for testing the **Group Master** module. This module has been updated to support an **enterprise-level hierarchical structure** (similar to Tally/SAP), allowing for unlimited nested levels of account groups while keeping 8 system headers fixed.

## Overview
The Group Master module uses a recursive tree structure. It is protected by JWT authentication.

**Base URL**: `{{API_URL}}/api/v1/group-master`

---

## 1. Core Logic Rules
*   **Fixed Header Groups**: The following 8 groups are seeded by the system and cannot be edited or deactivated:
    *   Direct Expense, Indirect Expense, Purchase, Opening Stock, Direct Sale, Indirect Sale, Sale, Closing Stock.
*   **Hierarchical Levels**: Unlimited nesting (Header -> Group -> Sub-Group -> Sub-Sub-Group...).
*   **Ownership**: 
    *   Header Groups: Global (`userId = NULL`, `is_header = true`).
    *   User Groups: User-specific (`userId` set to the logged-in seller).
*   **Status**: `ACTIVE` or `INACTIVE`.

---

## 2. API Endpoints Detail

### A. Get All Groups (Tree View)
Fetches all groups (Global Headers + Your Subgroups) and returns them in a recursive tree format.
- **URL**: `GET /`
- **Method**: `GET`
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "group_name": "Indirect Expense",
        "parent_id": null,
        "is_header": true,
        "children": [
          {
            "id": 10,
            "group_name": "Utilities",
            "parent_id": 1,
            "children": [
              {
                "id": 11,
                "group_name": "Electricity Bill",
                "parent_id": 10,
                "children": []
              }
            ]
          }
        ]
      }
    ]
  }
  ```

### B. Get Dropdown Groups
Fetches a list of groups available for selection when choosing a "Parent Group".
- **URL**: `GET /dropdown`
- **Method**: `GET`
- **Success Response (200)**: returns a flat list of groups the user has access to.

### C. Create New Group
- **URL**: `POST /`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "group_name": "Electricity Expense",
    "parent_id": 2 // ID of the parent group
  }
  ```

### D. Update Group Name
- **URL**: `PUT /:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "group_name": "Factory Electricity",
    "parent_id": 2
  }
  ```
- **Restriction**: Forbidden for Header Groups.

### E. Toggle Group Status
- **URL**: `PATCH /:id/status`
- **Method**: `PATCH`
- **Request Body**:
  ```json
  {
    "status": "INACTIVE"
  }
  ```
- **Restriction**: Forbidden for Header Groups.

---

## 3. UI Testing Scenarios

### 1. Hierarchical Integrity
1.  **Step**: Add a group "Utilities" under "Indirect Expense".
2.  **Step**: Add a group "Electricity" under "Utilities".
3.  **Step**: Add a group "Factory Load" under "Electricity".
4.  **Verify**: The main list should show a 4-level deep tree with correct indentation.

### 2. Header Group Protection
1.  **Step**: Try to find the "Edit" or "Deactivate" action for "Direct Expense".
2.  **Verify**: Action buttons should be hidden for header groups.
3.  **Step**: Try to call `PATCH /group-master/1/status` (where 1 is a header) via Postman.
4.  **Verify**: Should return `403 Forbidden` with "Header groups cannot be edited".

### 3. Tree Search & Expansion
1.  **Step**: Ensure all groups are collapsed.
2.  **Step**: Search for "Factory Load".
3.  **Verify**: The UI should automatically expand "Indirect Expense" -> "Utilities" -> "Electricity" -> "Factory Load" and highlight the match.

### 4. Recursive Export
1.  **Step**: Click "Export to PDF".
2.  **Verify**: The PDF should list groups with visual indentation reflecting their level in the hierarchy.

### 5. Multi-User Isolation
1.  **Step**: User A creates group "X" under "Purchase".
2.  **Step**: Login as User B.
3.  **Verify**: User B should see "Purchase" (Header) but **not** group "X".

---

## 4. Technical Notes
- **Prisma Model**: `Group` (Self-referencing with `parent_id`).
- **Service Logic**: Uses a recursive function `buildTree` to transform flat database rows into a nested JSON object.
- **Frontend**: Uses `React.Fragment` and recursive component rendering in `GroupMaster.jsx`.
