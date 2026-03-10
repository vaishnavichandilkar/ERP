# WeighPro: Seller & Onboarding API Specification (Detailed)

This document is the **Single Source of Truth** for the frontend team to integrate with the WeighPro Backend. It covers Authentication, the 7-Step Onboarding process, Document Management, and Security protocols.

---

## 1. STRATEGIC OVERVIEW

*   **API Base URL**: `http://localhost:3000/api/v1`
*   **Protocol**: REST via HTTPS
*   **Format**: JSON (Request & Response)
*   **File Uploads**: `multipart/form-data` (Max 5MB per file, PDF preferred)
*   **Timezone**: All timestamps are in UTC (ISO 8601).
*   **Currency**: INR for all billing and transaction modules.

### Authentication Strategy
WeighPro uses a **Session-based JWT Rotation** model. 
*   **Access Token**: 1 hour lifespan (passed in `Authorization: Bearer <token>` header).
*   **Refresh Token**: 7 days lifespan (used to get new access tokens).
*   **Revocation**: If a user logs out, the session is invalidated in the database, rendering all associated tokens useless.

---

## 2. AUTHENTICATION & SESSION APIs

### 2.1 Send Login OTP
Sends a verification code to the registered mobile number. Use this for both Signup and Login.
*   **Endpoint**: `/auth/send-login-otp`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "phone": "1111111111"
    }
    ```
*   **Success (201 Created)**:
    ```json
    {
      "message": "OTP sent successfully"
    }
    ```
*   **Errors**:
    *   `400`: Invalid phone format.
    *   `404`: No user associated with this phone.

### 2.2 Verify & Login
The primary login gateway. 
*   **Endpoint**: `/auth/login`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "phone": "1111111111",
      "otp": "123456"
    }
    ```
*   **Success (201 Created)**:
    ```json
    {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG...",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Ritesh Honule",
        "username": "1111111111",
        "role": "SELLER",
        "isApproved": true
      }
    }
    ```
*   **Critical Logic (Status Checks)**:
    *   `401 (Unauthorized)` + `"Onboarding incomplete"`: User has verified phone but failed to complete the 7 steps. Redirect to Onboarding Step 2.
    *   `401 (Unauthorized)` + `"Account pending Superadmin approval"`: User finished onboarding but is waiting for admin review. Show "Under Review" screen.
    *   `401 (Unauthorized)` + `"Account blocked"`: Restricted access. Show "Contact Support".

### ONBOARDING FLOW (STRICT 7-STEP)

| Step | API Path | Method | Description |
| :--- | :--- | :--- | :--- |
| **Step 1** | `/onboarding/step1-language` | `POST` | Select language (Initializes User) |
| **Step 2** | `/onboarding/step2-mobile` | `POST` | Register mobile and receive OTP |
| **Step 3** | `/onboarding/step3-verify` | `POST` | Verify OTP and receive JWT |
| **Step 4** | `/onboarding/step4-details` | `PUT` | Update personal profile |
| **Step 5** | `/onboarding/step5-business` | `POST` | Upload business docs |
| **Step 6** | `/onboarding/step6-shop` | `POST` | Shop detail config |
| **Step 7** | `/onboarding/step7-complete` | `POST` | Final submit for approval |

---

## 🛠️ ENDPOINT SPECIFICATIONS

### 1. Language Selection
*   **Path**: `POST /onboarding/step1-language`
*   **Payload**:
    ```json
    {
      "language": "English"
    }
    ```
*   **Success (201)**: Returns `userId`. This ID acts as your temporary onboarding session.

### 2. Mobile Entry (Send OTP)
*   **Path**: `POST /onboarding/step2-mobile`
*   **Payload**:
    ```json
    {
      "userId": "UUID_FROM_STEP_1",
      "phone": "9876543210"
    }
    ```
*   **Success (201)**: Returns success message. Backend automatically links the previously selected language to this phone number.
*   **Failure (409 Conflict)**: If the mobile number already exists, returns `message: "Mobile number already registered. Please login."`.

### 3. Verify OTP
*   **Path**: `POST /onboarding/step3-verify`
*   **Payload**:
    ```json
    {
      "phone": "9876543210",
      "otp": "123456"
    }
    ```
*   **Success (200)**: Returns `accessToken`, `refreshToken`, and `user` profile data.

### 4. Personal Details
*   **Path**: `PUT /onboarding/step4-details`
*   **Headers**: `Authorization: Bearer <token>`
*   **Payload**:
    ```json
    {
      "first_name": "...",
      "last_name": "...",
      "email": "..."
    }
    ```

### Step 4: Business Documents (Evidence Upload)
*   **Endpoint**: `/onboarding/step4-business` | `POST`
*   **Headers**: `Content-Type: multipart/form-data`
*   **Form Fields**:
    *   `udyogAadharNumber` (text): e.g. "MH-12-UDYOG789"
    *   `gstNumber` (text): e.g. "27AAACR1234A1Z1"
    *   `udyogAadharCertificate` (file): PDF/Image (Max 5MB)
    *   `gstCertificate` (file): PDF/Image (Max 5MB)
    *   `businessProof` (file): Optional PDF/Image

### Step 5: Shop & Physical Location
*   **Endpoint**: `/onboarding/step5-shop` | `POST`
*   **Headers**: `Content-Type: multipart/form-data`
*   **Form Fields**:
    *   `shopName`: "Ritesh Weighing Solutions"
    *   `address`: "123, Weighing Lane, Industrial Area"
    *   `village`: "Koramangala"
    *   `pinCode`: "560034"
    *   `state`: "Karnataka"
    *   `district`: "Bengaluru"
    *   `shopActLicense` (file): Required PDF.

### Step 7: Final Submission
*   **Endpoint**: `/onboarding/step7-complete` | `POST`
*   **Effect**: Sets `onboarded_at` timestamp. User is moved to "Pending Superadmin Review" queue.

---

## 4. BUSINESS MANAGEMENT APIs (FOR APPROVED SELLERS)

Once approved (`isApproved: true`), the seller can manage their business.

### 4.1 Create Facility (Weighbridge Station)
*   **Endpoint**: `/facilities` | `POST`
*   **Body**:
    ```json
    {
      "name": "Main Yard Bridge",
      "location": "Koramangala",
      "address": "4th Block, 80ft Road",
      "totalMachines": 2,
      "gstNumber": "27AAACR1234A1Z1"
    }
    ```

### 4.2 Add Staff Member (Operator/Admin)
*   **Endpoint**: `/users/create` | `POST`
*   **Body**:
    ```json
    {
      "name": "Operator Sam",
      "username": "sam_ops",
      "mobile": "9988776655",
      "role": "operator",
      "facilityId": "UUID_OF_FACILITY"
    }
    ```
*   **Security**: The backend automatically verifies that the `facilityId` belongs to the logged-in Seller.

---

## 5. DEVELOPER INTEGRATION GUIDE (FRONTEND)

### Axios Auto-Refresh Interceptor
This snippet handles 401 errors by attempting a refresh automatically.

```javascript
import axios from 'axios';

const api = axios.create({ baseURL: 'https://api.weighpro.com' });

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      try {
        const { data } = await axios.post('/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login'; // Refresh token failed
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 6. COMPLETE ERROR CODE MAPPING

| HTTP | Error Code | Frontend Strategy |
| :--- | :--- | :--- |
| **400** | `Invalid OTP` | Shake input field + "Incorrect code". |
| **400** | `OTP expired` | Show "Resend OTP" link. |
| **401** | `Unauthorized` | Delete tokens and redirect to Login. |
| **401** | `Onboarding incomplete` | Force redirect to `/onboarding/step2`. |
| **403** | `Forbidden` | User lacks permission for this specific module. |
| **404** | `Facility not found` | The linked weighbridge does not exist. |
| **409** | `Username already exists` | Validation error on staff creation. |

---

## 7. DOCUMENTATION NOTES
1.  **PDF Rules**: All certificate uploads MUST be PDF or Image (JPEG/PNG). File size limit is **5MB** per file.
2.  **Versioning**: Use the `v1` prefix in URLs to ensure future compatibility.
3.  **State Management**: Store the `role` and `isApproved` flag in a global state (Redux/Zustand) to hide/show protected UI features instantly.
4.  **BigInt Handling**: Note that file `size` fields are returned as strings (e.g. `"5048576"`) to avoid JSON serialization errors.

---
*Last Updated: February 28, 2026*
