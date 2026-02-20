import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Auth Pages
import Landing from '../pages/auth/Landing';
import SignIn from '../pages/auth/SignIn';
import VerifyOTP from '../pages/auth/VerifyOTP';
import Success from '../pages/auth/Success';
import SignUp from '../pages/auth/SignUp';
import RegistrationForm from '../pages/auth/RegistrationForm';

export const ROUTES = {
    LANDING: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    VERIFY_OTP: '/verify-otp',
    SUCCESS: '/success',
    REGISTRATION_FORM: '/registration-form',
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
        path: ROUTES.REGISTRATION_FORM,
        element: <RegistrationForm />,
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
