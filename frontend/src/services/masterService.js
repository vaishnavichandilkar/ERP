import axiosInstance from './axiosInstance';

const masterService = {
    // Unit Master APIs
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

    // Group Master APIs
    getAllGroups: async () => {
        const response = await axiosInstance.get('/group-master');
        return response.data;
    },

    getGroupDropdown: async () => {
        const response = await axiosInstance.get('/group-master/dropdown');
        return response.data;
    },

    createSubGroup: async (data) => {
        const response = await axiosInstance.post('/group-master/sub-group', data);
        return response.data;
    },

    updateSubGroup: async (id, data) => {
        const response = await axiosInstance.put(`/group-master/sub-group/${id}`, data);
        return response.data;
    },

    updateSubGroupStatus: async (id, status) => {
        const response = await axiosInstance.patch(`/group-master/sub-group/${id}/status`, { status });
        return response.data;
    },

    updateGroupStatus: async (id, status) => {
        const response = await axiosInstance.patch(`/group-master/${id}/status`, { status });
        return response.data;
    },
};

export default masterService;
