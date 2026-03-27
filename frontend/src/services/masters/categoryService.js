import axiosInstance from '../axiosInstance';

const categoryService = {
    getCategories: async () => {
        const response = await axiosInstance.get('/category-master');
        return response.data;
    },
    getCategoriesDropdown: async () => {
        const response = await axiosInstance.get('/category-master/categories/dropdown');
        return response.data;
    },
    importCategories: async (formData) => {
        const response = await axiosInstance.post('/category-master/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    createCategory: async (data) => {
        const response = await axiosInstance.post('/category-master/category', data);
        return response.data;
    },
    createSubCategory: async (data) => {
        const response = await axiosInstance.post('/category-master/sub-category', data);
        return response.data;
    },
    updateCategory: async (id, data) => {
        const response = await axiosInstance.patch(`/category-master/category/${id}`, data);
        return response.data;
    },
    updateSubCategory: async (id, data) => {
        const response = await axiosInstance.patch(`/category-master/sub-category/${id}`, data);
        return response.data;
    },
    toggleCategoryStatus: async (id, status) => {
        const response = await axiosInstance.patch(`/category-master/category/${id}/status`, { status });
        return response.data;
    },
    toggleSubCategoryStatus: async (id, status) => {
        const response = await axiosInstance.patch(`/category-master/sub-category/${id}/status`, { status });
        return response.data;
    }
};

export default categoryService;
