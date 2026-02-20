import axiosInstance from './axiosInstance';
import { AUTH_ENDPOINTS } from '../constants/apiConstants';

export const loginApi = async (credentials) => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
};

export const registerApi = async (userData) => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, userData);
    return response.data;
};

export const verifyOtpApi = async (data) => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.VERIFY_OTP, data);
    return response.data;
};
