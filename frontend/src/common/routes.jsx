import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Auth Pages
import Landing from '../pages/auth/Landing';
import SignIn from '../pages/auth/SignIn';
import VerifyOTP from '../pages/auth/VerifyOTP';
import Success from '../pages/auth/Success';
import SignUp from '../pages/auth/SignUp';
import SelectMachine from '../pages/auth/SelectMachine';
import ApplicationStatus from '../pages/auth/ApplicationStatus';

// Dashboard Pages
import DashboardLayout from '../layout/dashboard/DashboardLayout';
import Home from '../pages/dashboard/home/Home';
import FacilityPage from '../pages/dashboard/facility/FacilityPage';
import AddFacility from '../pages/dashboard/facility/AddFacility';
import ViewFacility from '../pages/dashboard/facility/ViewFacility';
import UpdateFacility from '../pages/dashboard/facility/UpdateFacility';
import Inventory from '../pages/dashboard/inventory/Inventory';

export const ROUTES = {
    LANDING: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    VERIFY_OTP: '/verify-otp',
    SUCCESS: '/success',
    REGISTRATION_FORM: '/registration-form',
    SELECT_MACHINE: '/select-machine',
    APPLICATION_STATUS: '/application-status',
    DASHBOARD: '/dashboard',
};

export const router = createBrowserRouter([
    {
        path: ROUTES.LANDING,
        element: <Landing />,
    },
    {
        path: ROUTES.LOGIN,
        element: <SignIn />,
    },
    {
        path: ROUTES.SIGNUP,
        element: <SignUp />,
    },
    {
        path: ROUTES.VERIFY_OTP,
        element: <VerifyOTP />,
    },
    {
        path: ROUTES.SUCCESS,
        element: <Success />,
    },
    {
        path: ROUTES.SELECT_MACHINE,
        element: <SelectMachine />,
    },
    {
        path: ROUTES.APPLICATION_STATUS,
        element: <ApplicationStatus />,
    },
    {
        path: ROUTES.DASHBOARD,
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'facility',
                element: <FacilityPage />
            },
            {
                path: 'facility/add',
                element: <AddFacility />
            },
            {
                path: 'facility/view',
                element: <ViewFacility />
            },
            {
                path: 'facility/update',
                element: <UpdateFacility />
            },
            {
                path: 'inventory',
                element: <Inventory />,
            }
        ]
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
