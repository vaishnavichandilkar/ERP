import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    stats: {},
    loading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        fetchStatsRequest: (state) => {
            state.loading = true;
        },
        fetchStatsSuccess: (state, action) => {
            state.loading = false;
            state.stats = action.payload;
        },
        fetchStatsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const { fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure } = dashboardSlice.actions;
export default dashboardSlice.reducer;
