import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Auth Pages
import Landing from '../pages/auth/Landing';
import LanguageSelection from '../pages/auth/LanguageSelection';
import LanguageGuard from '../components/auth/LanguageGuard';
import SignIn from '../pages/auth/SignIn';
import VerifyOTP from '../pages/auth/VerifyOTP';
import Success from '../pages/auth/Success';
import SignUp from '../pages/auth/SignUp';
import SelectMachine from '../pages/auth/SelectMachine';
import ApplicationStatus from '../pages/auth/ApplicationStatus';

// Dashboard Pages
import DashboardLayout from '../layout/dashboard/DashboardLayout';
import Home from '../pages/dashboard/home/Home';

// Masters Pages
import MastersLayout from '../pages/dashboard/masters/MastersLayout';
import GroupMaster from '../pages/dashboard/masters/GroupMaster';
import AccountMaster from '../pages/dashboard/masters/AccountMaster';
import UnitMaster from '../pages/dashboard/masters/UnitMaster';
import CategoryMaster from '../pages/dashboard/masters/CategoryMaster';
import ProductMaster from '../pages/dashboard/masters/ProductMaster';
import SystemSettings from '../features/settings/pages/SystemSettings';

// Placeholder for new modules
const Placeholder = ({ title }) => (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-500">This module is under development.</p>
        </div>
    </div>
);

// Redirect logic
const InitialRedirect = () => {
    const isLanguageSelected = localStorage.getItem('languageConfirmed') === 'true';
    if (isLanguageSelected) {
        return <Navigate to="/landing" replace />;
    }
    return <Navigate to="/language-selection" replace />;
};

export const ROUTES = {
    HOME: '/',
    LANGUAGE_SELECTION: '/language-selection',
    LANDING: '/landing',
    LOGIN: '/login',
    SIGNUP: '/signup',
    VERIFY_OTP: '/verify-otp',
    SUCCESS: '/success',
    REGISTRATION_FORM: '/registration-form',
    SELECT_MACHINE: '/select-machine',
    APPLICATION_STATUS: '/application-status',
    DASHBOARD: '/dashboard',
    REPORTS: '/dashboard/reports',
    MASTERS: '/dashboard/masters',
    PURCHASE: '/dashboard/purchase',
    SALES: '/dashboard/sales',
    SETTINGS: '/dashboard/settings',
};

export const router = createBrowserRouter([
    {
        path: ROUTES.HOME,
        element: <InitialRedirect />,
    },
    {
        path: ROUTES.LANGUAGE_SELECTION,
        element: <LanguageSelection />,
    },
    {
        element: <LanguageGuard />,
        children: [
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
                        path: 'reports',
                        element: <Placeholder title="Reports" />
                    },
                    {
                        path: 'masters',
                        element: <MastersLayout />,
                        children: [
                            {
                                index: true,
                                element: <GroupMaster />
                            },
                            {
                                path: 'group-master',
                                element: <GroupMaster />
                            },
                            {
                                path: 'account-master',
                                element: <AccountMaster />
                            },
                            {
                                path: 'unit-master',
                                element: <UnitMaster />
                            },
                            {
                                path: 'category',
                                element: <CategoryMaster />
                            },
                            {
                                path: 'product-master',
                                element: <ProductMaster />
                            }
                        ]
                    },
                    {
                        path: 'purchase',
                        element: <Placeholder title="Purchase" />
                    },
                    {
                        path: 'sales',
                        element: <Placeholder title="Sales" />
                    },
                    {
                        path: 'settings',
                        element: <SystemSettings />
                    }
                ]
            },
        ]
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
