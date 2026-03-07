import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import dashboardReducer from './dashboard/dashboardSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    dashboard: dashboardReducer,
});

export default rootReducer;
