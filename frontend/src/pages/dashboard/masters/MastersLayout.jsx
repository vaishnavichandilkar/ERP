import React from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';

const MastersLayout = () => {
    const location = useLocation();

    // Required Tab Sequence from User:
    // 1. Group Master
    // 2. Account Master
    // 3. Unit Master
    // 4. Category
    // 5. Product Master
    const tabs = [
        { name: 'Group Master', path: '/dashboard/masters/group-master' },
        { name: 'Account Master', path: '/dashboard/masters/account-master' },
        { name: 'Unit Master', path: '/dashboard/masters/unit-master' },
        { name: 'Category', path: '/dashboard/masters/category' },
        { name: 'Product Master', path: '/dashboard/masters/product-master' },
    ];

    // If we are on the base /dashboard/masters route, redirect to the first tab (Group Master)
    if (location.pathname === '/dashboard/masters' || location.pathname === '/dashboard/masters/') {
        return <Navigate to="/dashboard/masters/group-master" replace />;
    }

    return (
        <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-10 font-['Plus_Jakarta_Sans']">
            {/* Header section */}
            <div className="mb-6 md:mb-8 transition-all duration-300 ease-in-out">
                <h1 className="text-[24px] md:text-[32px] font-bold text-[#111827] mb-2 tracking-tight">
                    Masters
                </h1>
                <p className="text-[#6B7280] text-[13px] md:text-[15px] font-medium max-w-[600px] leading-relaxed">
                    Manage and organize core business data used across the system.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-[#E5E7EB] mb-6 overflow-x-auto scrollbar-hide">
                <div className="flex gap-8 md:gap-12 min-w-max">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) =>
                                `relative pb-4 text-[14px] md:text-[16px] font-semibold transition-all duration-300 ease-in-out whitespace-nowrap
                                ${isActive
                                    ? 'text-[#014A36]'
                                    : 'text-[#6B7280] hover:text-[#111827]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {tab.name}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#014A36] rounded-t-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
};

export default MastersLayout;
