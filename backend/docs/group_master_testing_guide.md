# Group Master Testing Guide

This document provides instructions for testing the Group Master module after the user-specific sub-group refactoring.

## Overview
The Group Master module consists of 8 fixed **Header Groups** (Global) and dynamic **Sub Groups** (User-Specific). Users can manage their own list of sub-groups under predefined headers.

## Prerequisites
1.  Backend server is running (`npm run start:dev`).
2.  Frontend server is running (`npm run dev`).
3.  Database is seeded with 8 Header Groups (`npx prisma db seed`).
4.  At least two different Seller accounts are registered and approved in the system.

---

## Test Cases

### 1. Global Header Group Visibility
- **Action**: Log in as any Seller and navigate to **Masters > Group Master**.
- **Expected Result**:
    - The table should display all 8 Header Groups:
        1. Direct Expense
        2. Indirect Expense
        3. Purchase
        4. Opening Stock
        5. Direct Sale
        6. Indirect Sale
        7. Sale
        8. Closing Stock
    - Each group should have a `+` icon to expand.

### 2. Creating a Sub-Group
- **Action**: 
    1. Click the **Add Group** button.
    2. Enter a Sub-Group Name (e.g., "Electricity Bill").
    3. Select a Header Group (e.g., "Indirect Expense").
    4. Click **Save**.
- **Expected Result**:
    - Modal closes.
    - Success message or automatic refresh occurs.
    - Expand "Indirect Expense"; "Electricity Bill" should be visible with "Active" status.

### 3. User Isolation (Multi-User Test)
- **Step 1 (User A)**:
    - Log in as **Seller A**.
    - Create a sub-group "Transport Cost" under "Direct Expense".
    - Log out.
- **Step 2 (User B)**:
    - Log in as **Seller B**.
    - Navigate to Group Master.
- **Expected Result**:
    - Seller B should **NOT** see "Transport Cost" under Direct Expense.
    - Seller B should be able to create their own "Transport Cost" without any conflict.

### 4. Duplicate Validation
- **Action**: Attempt to create another sub-group with the **same name** under the **same header group** for the **same user**.
- **Expected Result**:
    - Backend should return a `409 Conflict` error.
    - Frontend should display an error message: "Sub-group already exists under this group".

### 5. Status Management
- **Action**:
    1. Click the vertical dots (`⋮`) next to a sub-group.
    2. Click **Deactivate**.
- **Expected Result**:
    - The status badge should change to red **Inactive**.
    - The sub-group should persist as inactive in the database.
    - Click **Activate** to revert; status should change back to green **Active**.

### 6. Search Functionality
- **Action**: Type a specific sub-group name in the search bar.
- **Expected Result**:
    - Only the Header Group containing that sub-group should remain visible.
    - The Header Group should automatically expand to show the matching item.

### 7. Export Functionality
- **Action**: Click **Export** and select **PDF** or **Excel**.
- **Expected Result**:
    - A file should download containing the correct mapping of Header Groups and the user's Sub-Groups.

---

## Technical Verification (Database)
You can verify the storage logic by running the following SQL query or checking Prisma Studio:
```sql
SELECT "sub_group_name", "group_id", "userId" FROM "account_sub_groups";
```
- **Goal**: Ensure `userId` is NOT NULL and matches the logged-in seller's ID.
