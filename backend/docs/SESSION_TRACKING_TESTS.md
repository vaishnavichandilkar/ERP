# Seller Onboarding Session Tracking & State Tests 

This document outlines all possible scenarios and edge cases relating to the newly implemented multi-part Step-Based session tracker for Sellers, alongside precise instructions on how to simulate them using Swagger or Postman.

## Pre-requisites
- Local Server running (`npm run start:dev`)
- Swagger Instance Open: `http://localhost:3000/api/docs`
- A valid `userId` (You can generate one temporarily by hitting the Step 1 POST endpoint or by making up a valid UUID).

---

## 🟢 Scenario 1: Starting a Brand New Session
**Goal:** Verify a new dynamic `sessionId` is generated when beginning the flow.
1. Open up **`POST /seller/onboarding/start`**
2. Click **Try it out**.
3. In the Request Body, enter:
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```
4. **Execute**. 
5. **Expected Result:** A `201 Created` status with `sessionId`, `sellerProfileId`, and `currentStep` tied to 0. *Copy the `sessionId` for the next steps!*

---

## 🚫 Scenario 2: Preventing Duplicate Sessions
**Goal:** Verify that hitting the initialization endpoint twice does not spawn ghost progression lines.
1. Without altering the payload, hit **Execute** on `POST /seller/onboarding/start` again using the identical `userId`.
2. **Expected Result:** A 201 response seamlessly returning the exact same, pre-existing `sessionId` and current checkpoint data—instead of generating new values.

---

## 🗃️ Scenario 3: Persisting Form Data (Mid-Drop off)
**Goal:** Prove the backend is capable of safely stowing half-filled step definitions upon navigation abandonment.
1. Navigate to **`POST /seller/onboarding/step/{stepNumber}`** (Expand it in Swagger).
2. Click **Try it out**.
3. Set `stepNumber` = `1`.
4. Enter your `x-session-id` header securely via the parameter mapping (paste in the `sessionId` retrieved from Scenario 1).
5. In the Request Body, upload mock logic:
```json
{
  "companyName": "Placeholder Enterprise",
  "temporarilySaved": true
}
```
6. **Execute**.
7. **Expected Result:** A `201 Created` returning `{ "success": true, "currentStep": 1, "status": "IN_PROGRESS" }`. The system successfully preserved the JSON block inside step 1's memory tree!

---

## 🔄 Scenario 4: Returning / Resuming the Form Sequence
**Goal:** Assume the user hard-refreshed or returned via email 2 days later. They only carry their explicit `sessionId` header (or generic `userId`).
1. Navigate to **`GET /seller/onboarding/status`**.
2. Click **Try it out**.
3. Enter your pre-generated `sessionId` under the `x-session-id` header parameter.
4. **Execute**.
5. **Expected Result:** A `200 OK` housing a `nextStep: 2` directive. Crucially, verify that the `completedSteps` nested array explicitly contains:
```json
{
  "nextStep": 2,
  "completedSteps": [
    "language_selected"
  ],
  "savedStepData": [
    {
      "step": 1,
      "stepName": "language_selected",
      "status": "PENDING",
      "data": {
        "companyName": "Placeholder Enterprise",
        "temporarilySaved": true
      }
    }
  ]
}
```
The Frontend client is now automatically fully pre-armed with exactly everything it needs to rehydrate bindings and securely bump the seller instantly to page 2.

---

## ⛔ Scenario 5: Validating Linear Progress Control
**Goal:** Ensure users cannot skip obligatory requirements.
1. We are currently tracked at Step 1 (or 2 logically). Let's attempt to force completion of Step 5.
2. Navigate back to **`POST /seller/onboarding/step/{stepNumber}`**.
3. Set `stepNumber` = `5`.
4. Pass your `x-session-id` accurately.
5. Provide `{}` as the Request Body.
6. **Execute**.
7. **Expected Result:** Hard stop `400 Bad Request` throwing: `Cannot skip steps. Allowed step is 2`.

---

## 🔒 Scenario 6: Lockdown of Approved Steps
**Goal:** Prove historically verified data locks cannot be overwritten maliciously.
1. Behind the scenes, we would mock or transition `stepNumber: 1` dynamically to an `"APPROVED"` state. *(The automated test here inherently requires a programmatic trigger or raw DB injection simply declaring `UPDATE "SellerStepReview" SET status = 'APPROVED' WHERE step = 1`)*.
2. Under standard conditions, attempt to execute **`POST /seller/onboarding/step/{stepNumber}`** targeting `stepNumber: 1` again passing fresh JSON overrides.
3. **Execute**.
4. **Expected Result:** Rapid validation block raising `400 Bad Request` reading: `"This step has already been approved and cannot be resubmitted"`.

---

## ✔️ Scenario 7: Full Finalization 
**Goal:** Mark the full form sequence as fully bound.
1. Submit progressive endpoints linearly mapping Step 2 up to Step 9 sequentially.
2. Pass `{ "isFinalStep": true }` into the body mapping of Step 9 (or wait until Step 9 implicitly triggers finalization).
3. Upon final explicit triggering, execute the standard Status call (`GET /seller/onboarding/status`).
4. **Expected Result:** The overarching `status` enumerator transitions reliably into `"SUBMITTED"` explicitly indicating full handoff into super admin authority pending pools.
