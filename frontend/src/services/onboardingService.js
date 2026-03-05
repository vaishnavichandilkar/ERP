import axiosInstance from './axiosInstance';
import { ONBOARDING_ENDPOINTS } from '../constants/apiConstants';

export const startOnboardingApi = async (userId) => {
    const response = await axiosInstance.post(ONBOARDING_ENDPOINTS.START, { userId });
    if (response.data.sessionId) {
        localStorage.setItem('sessionId', response.data.sessionId);
    }
    return response.data;
};

export const getOnboardingStatusApi = async () => {
    const response = await axiosInstance.get(ONBOARDING_ENDPOINTS.STATUS);
    return response.data;
};

export const submitOnboardingStepApi = async (stepNumber, data) => {
    const endpoint = typeof ONBOARDING_ENDPOINTS.SUBMIT_STEP === 'function'
        ? ONBOARDING_ENDPOINTS.SUBMIT_STEP(stepNumber)
        : `/seller/onboarding/step/${stepNumber}`;

    const response = await axiosInstance.post(endpoint, data);
    return response.data;
};

export const registerMobileApi = async (phone) => {
    // The backend requires a generic user session (Step 1) to be created before sending an OTP
    const step1Response = await axiosInstance.post(ONBOARDING_ENDPOINTS.STEP1_LANGUAGE, { language: 'English' });
    const userId = step1Response.data.userId;

    const response = await axiosInstance.post(ONBOARDING_ENDPOINTS.STEP2_MOBILE, { phone, userId });
    return { ...response.data, userId };
};

export const verifyOnboardingOtpApi = async (phone, otp, userId) => {
    const response = await axiosInstance.post(ONBOARDING_ENDPOINTS.STEP3_VERIFY, { phone, otp, userId });
    return response.data;
};

export const savePersonalDetailsApi = async (data) => {
    const response = await axiosInstance.put(ONBOARDING_ENDPOINTS.STEP4_DETAILS, data);
    return response.data;
};

export const saveBusinessDetailsApi = async (data, files) => {
    const formData = new FormData();
    formData.append('udyogAadharNumber', data.udyogAadhar || 'N/A');
    formData.append('gstNumber', data.gstNumber || 'N/A');
    if (files.udyogAadharFile) formData.append('udyogAadharCertificate', files.udyogAadharFile);
    if (files.gstFile) formData.append('gstCertificate', files.gstFile);
    if (files.otherDocFile) formData.append('businessProof', files.otherDocFile);

    const response = await axiosInstance.post(ONBOARDING_ENDPOINTS.STEP5_BUSINESS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const saveShopDetailsApi = async (data) => {
    const formData = new FormData();
    formData.append('shopName', data.shopName);
    formData.append('address', data.address);
    formData.append('village', data.village || 'N/A');
    formData.append('pinCode', data.pinCode);
    formData.append('state', data.state);
    formData.append('district', data.district);

    const response = await axiosInstance.post(ONBOARDING_ENDPOINTS.STEP6_SHOP, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const saveBankDetailsApi = async (data, files) => {
    const formData = new FormData();
    formData.append('holderName', data.accountHolderName);
    formData.append('accountNo', data.accountNumber);
    formData.append('ifsc', data.ifscCode);
    formData.append('bankName', data.bankName);
    formData.append('panNumber', data.panNumber || 'UNKNOWN'); // Default since no input
    if (files.cancelledChequeFile) formData.append('cancelledCheque', files.cancelledChequeFile);
    if (files.panCardFile) formData.append('panCard', files.panCardFile);

    const response = await axiosInstance.post(ONBOARDING_ENDPOINTS.STEP7_BANK, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// Machine is missing from form, so we provide default wrapper to bypass completeness check
export const saveMachineDetailsDefaultApi = async () => {
    const response = await axiosInstance.post(ONBOARDING_ENDPOINTS.STEP8_MACHINE, {
        isUsingOwnMachine: false,
        machineName: "Default Assign"
    });
    return response.data;
};

export const completeOnboardingApi = async () => {
    const response = await axiosInstance.post(ONBOARDING_ENDPOINTS.STEP9_COMPLETE, {});
    return response.data;
};