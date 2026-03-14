import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import dashboardReducer from './dashboard/dashboardSlice';
import accountReducer from './account/accountSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    dashboard: dashboardReducer,
    account: accountReducer,
});

export default rootReducer;
