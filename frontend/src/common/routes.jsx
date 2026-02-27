import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Auth Pages
import Landing from '../pages/auth/Landing';
import SignIn from '../pages/auth/SignIn';
import VerifyOTP from '../pages/auth/VerifyOTP';
import Success from '../pages/auth/Success';
import SignUp from '../pages/auth/SignUp';
import SelectMachine from '../pages/auth/SelectMachine';

// Dashboard Pages
import DashboardLayout from '../layout/dashboard/DashboardLayout';
import Home from '../pages/dashboard/home/Home';

export const ROUTES = {
    LANDING: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    VERIFY_OTP: '/verify-otp',
    SUCCESS: '/success',
    REGISTRATION_FORM: '/registration-form',
    SELECT_MACHINE: '/select-machine',
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
        path: ROUTES.DASHBOARD,
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: <Home />,
            }
        ]
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
