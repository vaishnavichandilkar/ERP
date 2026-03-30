import React from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PurchaseLayout = () => {
    const { t } = useTranslation(['modules', 'common']);
    const location = useLocation();

    const tabs = [
        { name: 'Purchase Order', path: '/seller/purchase/order' },
        { name: 'Purchase Invoice', path: '/seller/purchase/invoice' },
    ];

    // If we are on the base /seller/purchase route, redirect to the first tab (Purchase Order)
    if (location.pathname === '/seller/purchase' || location.pathname === '/seller/purchase/') {
        return <Navigate to="/seller/purchase/order" replace />;
    }

    return (
        <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-10 font-['Plus_Jakarta_Sans'] transition-all duration-300">
            {/* Header section */}
            <div className="mb-0">
                <h1 className="text-[28px] md:text-[32px] font-bold text-[#111827] mb-2 tracking-tight">
                    Purchase
                </h1>
                <p className="text-[#6B7280] text-[15px] font-medium max-w-[800px] leading-relaxed mb-8">
                    Create and monitor purchase orders, supplier invoices, and stock procurement activities.
                </p>
            </div>

            {/* Tab Navigation Level (Pill Style as per Master Design) */}
            <div className="border-b border-[#E5E7EB] mb-8 overflow-x-auto scrollbar-hide">
                <div className="flex gap-8 md:gap-12 min-w-max">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) =>
                                `relative text-[14px] md:text-[16px] font-semibold transition-all duration-300 ease-in-out whitespace-nowrap
                                ${isActive
                                    ? 'text-[#073318] bg-[#073318]/5 border border-[#073318] px-4 py-2 rounded-lg'
                                    : 'text-[#6B7280] hover:text-[#111827] px-4 py-2'
                                }`
                            }
                        >
                            {tab.name}
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

export default PurchaseLayout;
