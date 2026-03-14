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

export const toggleStatus = async (id, isActive) => {
    // Backend expects { isActive: boolean } in the body
    const response = await axiosInstance.patch(`${API_PATH}/${id}/status`, { isActive });
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

export const generateAccountCode = async (groupName) => {
    const response = await axiosInstance.get(`${API_PATH}/generate-code`, { params: { group: groupName } });
    return response.data;
};

export default {
    getAllAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    toggleStatus,
    lookupPincode,
    exportAccounts,
    generateAccountCode
};
