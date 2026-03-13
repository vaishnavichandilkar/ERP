import axiosInstance from '../axiosInstance';

const unitService = {
    getUnits: async (params) => {
        const response = await axiosInstance.get('/masters/unit', { params });
        return response.data;
    },

    getUnitById: async (id) => {
        const response = await axiosInstance.get(`/masters/unit/${id}`);
        return response.data;
    },

    createUnit: async (data) => {
        const response = await axiosInstance.post('/masters/unit', data);
        return response.data;
    },

    updateUnit: async (id, data) => {
        const response = await axiosInstance.put(`/masters/unit/${id}`, data);
        return response.data;
    },

    deleteUnit: async (id) => {
        const response = await axiosInstance.delete(`/masters/unit/${id}`);
        return response.data;
    },

    updateUnitStatus: async (id, status) => {
        const response = await axiosInstance.patch(`/masters/unit/${id}/status`, { status });
        return response.data;
    },

    getGstUomList: async () => {
        const response = await axiosInstance.get('/masters/gst-uom');
        return response.data;
    },
};

export default unitService;
