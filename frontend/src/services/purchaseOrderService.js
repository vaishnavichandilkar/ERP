import axiosInstance from './axiosInstance';

const API_PATH = '/purchase-orders';

export const getPurchaseOrders = async (params) => {
    const response = await axiosInstance.get(API_PATH, { params });
    return response.data;
};

export const getPurchaseOrderById = async (id) => {
    const response = await axiosInstance.get(`${API_PATH}/${id}`);
    return response.data;
};

export const createPurchaseOrder = async (data) => {
    const response = await axiosInstance.post(API_PATH, data);
    return response.data;
};

export const updatePurchaseOrder = async (id, data) => {
    const response = await axiosInstance.patch(`${API_PATH}/${id}`, data);
    return response.data;
};

export const deletePurchaseOrder = async (id) => {
    const response = await axiosInstance.delete(`${API_PATH}/${id}`);
    return response.data;
};

export const getNextNumber = async () => {
    const response = await axiosInstance.get(`${API_PATH}/next-number`);
    return response.data;
};

export const getSupplierDetails = async (id) => {
    const response = await axiosInstance.get(`${API_PATH}/supplier/${id}`);
    return response.data;
};

export const exportPurchaseOrders = async (params) => {
    const response = await axiosInstance.get(`${API_PATH}/export`, {
        params,
        responseType: 'blob'
    });
    return response;
};

export const importPurchaseOrders = async (formData) => {
    const response = await axiosInstance.post(`${API_PATH}/import`, formData);
    return response.data;
};

export const downloadSample = async () => {
    const response = await axiosInstance.get(`${API_PATH}/sample-excel`, {
        responseType: 'blob'
    });
    return response;
};

export const printPurchaseOrder = async (id) => {
    const response = await axiosInstance.get(`${API_PATH}/${id}/print`, {
        responseType: 'blob'
    });
    return response;
};

export default {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getNextNumber,
    getSupplierDetails,
    exportPurchaseOrders,
    importPurchaseOrders,
    downloadSample,
    printPurchaseOrder
};
