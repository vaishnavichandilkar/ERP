import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Replace with Loader component
    }

    return user ? <Outlet /> : <Navigate to={ROUTES.LOGIN} />;
};

export default PrivateRoute;
