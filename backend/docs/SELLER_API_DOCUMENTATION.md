# WeighPro: Seller & Onboarding API Specification (Detailed)

This document is the **Single Source of Truth** for the frontend team to integrate with the WeighPro Backend. It covers Authentication, the 6-Step Onboarding process, Document Management, and Security protocols.

---

## 1. STRATEGIC OVERVIEW

*   **API Base URL**: `http://localhost:3000/api/v1`
*   **Protocol**: REST via HTTPS
*   **Format**: JSON (Request & Response)
*   **File Uploads**: `multipart/form-data`
*   **Timezone**: All timestamps are in UTC (ISO 8601).
*   **Currency**: Fixed to INR for all billing modules.

### Authentication Strategy
WeighPro uses a **Session-based JWT Rotation** model. 
*   **Access Token**: 1 hour lifespan (used for API authorization).
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
      "phone": "9876543210"
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
      "phone": "9876543210",
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
        "name": "ritesh honule",
        "username": "9876543210",
        "role": "SELLER",
        "isApproved": true
      }
    }
    ```
*   **Critical Logic (Status Checks)**:
    *   `401 (Unauthorized)` + `"Onboarding incomplete"`: User has verified phone but failed to complete the 6 steps. Redirect to Onboarding Step 2.
    *   `401 (Unauthorized)` + `"Account pending Superadmin approval"`: User finished onboarding but is waiting for admin review. Show "Under Review" screen.
    *   `401 (Unauthorized)` + `"Account blocked"`: Restricted access. Show "Contact Support".

### 2.3 Refresh Token Rotation
Frontend must call this when the `accessToken` expires.
*   **Endpoint**: `/auth/refresh`
*   **Method**: `POST`
*   **Body**:
    ```json
    {
      "refreshToken": "eyJ..."
    }
    ```
*   **Success (201)**: Returns a fresh set of `accessToken` and `refreshToken`.
*   **Note**: The old `refreshToken` is invalidated upon this call.

---

## 3. SELLER ONBOARDING FLOW (STEP-BY-STEP)

All Step 2-6 APIs require: `Authorization: Bearer <InitialAccessToken>` (received after Step 1 verification).

### Step 1: Start Onboarding (Mobile Entry)
*   **Endpoint**: `/onboarding/step1-mobile` | `POST`
*   **Body**: `{ "phone": "8861220023" }`
*   **Logic**: Creates user in DB with `role: "seller"` and `isApproved: false`.

### Step 1b: Verify Onboarding OTP
*   **Endpoint**: `/onboarding/step1-verify` | `POST`
*   **Body**: `{ "phone": "8861220023", "otp": "123456" }`
*   **Response**: Returns tokens. Save these; they are required to "unlock" the next steps.

### Step 2: Personal Profile
*   **Endpoint**: `/onboarding/step2-details` | `PUT`
*   **Body**:
    ```json
    {
      "first_name": "Rohan",
      "last_name": "Verma",
      "email": "rohan@company.com"
    }
    ```

### Step 3: Business Documents (Evidence Upload)
*   **Endpoint**: `/onboarding/step3-business` | `POST`
*   **Headers**: `Content-Type: multipart/form-data`
*   **Form Fields**:
    *   `udyogAadharNumber` (text): e.g. "MH-12-000123"
    *   `gstNumber` (text): e.g. "27AAACR1234A1Z1"
    *   `udyogAadharCertificate` (file): PDF/Image (Max 5MB)
    *   `gstCertificate` (file): PDF/Image (Max 5MB)
    *   `businessProof` (file): Optional PDF/Image

### Step 4: Shop & Physical Location
*   **Endpoint**: `/onboarding/step4-shop` | `POST`
*   **Headers**: `Content-Type: multipart/form-data`
*   **Form Fields**:
    *   `shopName`: Commercial name of the weighbridge.
    *   `address`, `village`, `pinCode`, `state`, `district`: [All Strings]
    *   `shopActLicense` (file): Required PDF.

### Step 5: Banking & Financials
*   **Endpoint**: `/onboarding/step5-bank` | `POST`
*   **Headers**: `Content-Type: multipart/form-data`
*   **Form Fields**:
    *   `holderName`: As per Bank Passbook.
    *   `accountNo`, `ifsc`, `bankName`: [Strings]
    *   `panNumber`: Corporate or Individual PAN.
    *   `cancelledCheque` (file): Required PDF.
    *   `panCard` (file): Required PDF.

### Step 6: Final Submission
*   **Endpoint**: `/onboarding/step6-complete` | `POST`
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
      "location": "Sector 4",
      "address": "Warehouse 12, Terminal A",
      "totalMachines": 1
    }
    ```

### 4.2 Add Staff Member (Operator/Admin)
*   **Endpoint**: `/users/create` | `POST`
*   **Body**:
    ```json
    {
      "name": "Operator Sam",
      "username": "sam_ops",
      "password": "SecurePassword123",
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
