import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routeConstants';

const Sidebar = () => {
    return (
        <aside style={{ width: '250px', background: '#f8f9fa', padding: '20px', borderRight: '1px solid #ccc' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <NavLink to={ROUTES.DASHBOARD.HOME}>Dashboard</NavLink>
                <NavLink to={ROUTES.DASHBOARD.PRODUCTS}>Products</NavLink>
                <NavLink to={ROUTES.DASHBOARD.ORDERS}>Orders</NavLink>
                <NavLink to={ROUTES.DASHBOARD.PAYMENTS}>Payments</NavLink>
                <NavLink to={ROUTES.DASHBOARD.PROFILE}>Profile</NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
