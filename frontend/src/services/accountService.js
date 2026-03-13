import axiosInstance from './axiosInstance';

const API_PATH = '/account-master';

export const getAllAccounts = async (params) => {
    const response = await axiosInstance.get(API_PATH, { params });
    return response.data;
};

export const getAccountById = async (id) => {
    const response = await axiosInstance.get(`${API_PATH}/${id}`);
    return response.data;
};

export const createAccount = async (data) => {
    const response = await axiosInstance.post(API_PATH, data);
    return response.data;
};

export const updateAccount = async (id, data) => {
    const response = await axiosInstance.put(`${API_PATH}/${id}`, data);
    return response.data;
};

export const toggleStatus = async (id) => {
    // Note: The prompt asked for PATCH /api/v1/account-master/:id/status
    // Assuming backend follows /account-master/:id/status
    const response = await axiosInstance.patch(`${API_PATH}/${id}/status`);
    return response.data;
};

export const lookupPincode = async (pincode) => {
    const response = await axiosInstance.get(`${API_PATH}/pincode/${pincode}`);
    return response.data;
};

export const exportAccounts = async (params) => {
    const response = await axiosInstance.get(`${API_PATH}/export`, { 
        params,
        responseType: 'blob'
    });
    return response;
};

export default {
    getAllAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    toggleStatus,
    lookupPincode,
    exportAccounts
};
