import axiosInstance from './axiosInstance';
import { DASHBOARD_ENDPOINTS } from '../constants/apiConstants';

export const fetchDashboardStats = async () => {
    try {
        const response = await axiosInstance.get(DASHBOARD_ENDPOINTS.STATS);
        return response.data;
    } catch (error) {
        throw error;
    }
};
