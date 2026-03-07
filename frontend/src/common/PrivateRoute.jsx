import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routeConstants';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Replace with Loader component
    }

    return user ? <Outlet /> : <Navigate to={ROUTES.AUTH.SIGN_IN} />;
};

export default PrivateRoute;
