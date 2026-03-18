# Category Master API Testing Guide

## Base URL
`{{baseUrl}}/api/v1/category-master`

---

## 1. Create Category
**Endpoint:** `POST /category`
**Description:** Create a new parent category.

### Request Body
```json
{
  "name": "Seeds",
  "status": "ACTIVE"
}
```

### Response (Success - 201)
```json
{
  "id": 1,
  "name": "Seeds",
  "user_id": 101,
  "status": "ACTIVE",
  "created_at": "2026-03-17T08:00:00.000Z",
  "updated_at": "2026-03-17T08:00:00.000Z"
}
```

---

## 2. Create Sub Category
**Endpoint:** `POST /sub-category`
**Description:** Create a child category linked to a parent category.

### Request Body
```json
{
  "name": "Hybrid Seeds",
  "category_id": 1,
  "status": "ACTIVE"
}
```

### Response (Success - 201)
```json
{
  "id": 10,
  "name": "Hybrid Seeds",
  "category_id": 1,
  "user_id": 101,
  "status": "ACTIVE",
  "created_at": "2026-03-17T08:05:00.000Z",
  "updated_at": "2026-03-17T08:05:00.000Z"
}
```

---

## 3. Get Categories for Dropdown
**Endpoint:** `GET /categories/dropdown`
**Description:** Return only parent categories for selection in sub-category creation.

### Response (Success - 200)
```json
[
  {
    "id": 1,
    "name": "Seeds",
    "status": "ACTIVE"
  }
]
```

---

## 4. Get Category Listing (Nested Structure)
**Endpoint:** `GET /`
**Description:** Returns categories with their sub-categories.

### Response (Success - 200)
```json
[
  {
    "id": 1,
    "name": "Seeds",
    "status": "ACTIVE",
    "sub_categories": [
      {
        "id": 10,
        "name": "Hybrid Seeds",
        "status": "ACTIVE"
      }
    ]
  }
]
```

---

## 5. Update Status (Toggle)
**Endpoints:** 
- `PATCH /category/:id/status`
- `PATCH /sub-category/:id/status`

### Request Body
```json
{
  "status": "INACTIVE"
}
```

---

## Validation Rules Table

| Rule | Description |
|------|-------------|
| Unique Category | Category name must be unique per user. |
| Unique Sub Category | Sub Category name must be unique within same category per user. |
| Integrity | `category_id` must exist and belong to the same user. |
| Status Dependency | A Sub Category cannot be `ACTIVE` if its parent Category is `INACTIVE`. |
| Cascading Inactivation | If a Category is set to `INACTIVE`, all its Sub Categories are automatically set to `INACTIVE`. |
| Creation Guard | Cannot create a Sub Category under an `INACTIVE` Category. |
| Empty Checks | Name cannot be empty or just whitespace. |
| Multi-User | All operations are scoped to the logged-in user (`req.user.userId`). |
| Trimming | Names are trimmed and normalized before saving. |

---

## 6. Status Dependency Test Cases

### Case A: Cascading Inactive
1. Have a Category "Seeds" (ACTIVE) with Sub Category "Hybrid" (ACTIVE).
2. `PATCH /category/:id/status` with `{"status": "INACTIVE"}`.
3. **Verify**: Both Category and Sub Category are now `INACTIVE`.

### Case B: Sub Category Activation Guard
1. Have a Category "Seeds" (INACTIVE).
2. Try `PATCH /sub-category/:subId/status` with `{"status": "ACTIVE"}`.
3. **Expected Result**: `400 Bad Request` with message "Cannot activate Sub Category while parent Category is INACTIVE".

### Case C: Creation under Inactive Category
1. Have a Category "Seeds" (INACTIVE).
2. Try `POST /sub-category` linked to "Seeds".
3. **Expected Result**: `400 Bad Request` with message "Cannot create Sub Category under an INACTIVE Category".
