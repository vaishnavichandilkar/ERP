import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Security Gate: Ensure Sellers can only access Dashboard if they are APPROVED.
    // Otherwise, they belong on the ApplicationStatus page.
    if (user.role === 'SELLER' && user.approvalStatus !== 'APPROVED') {
        return <Navigate to="/application-status" replace />;
    }

    return (
        <div className="flex h-screen bg-white font-['Plus_Jakarta_Sans'] overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
