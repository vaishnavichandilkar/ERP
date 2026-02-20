import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const DashboardLayout = () => {
    return (
        <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            <Header />
            <div style={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <main style={{ flex: 1, padding: '20px' }}>
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardLayout;
