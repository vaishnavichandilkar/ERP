import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileBarChart,
    Database,
    ShoppingCart,
    TrendingUp,
    Settings,
    X
} from 'lucide-react';
import logo from '../../assets/images/logo2.png';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/reports', label: 'Reports', icon: FileBarChart },
        { path: '/dashboard/masters', label: 'Masters', icon: Database },
        { path: '/dashboard/purchase', label: 'Purchase', icon: ShoppingCart },
        { path: '/dashboard/sales', label: 'Sales', icon: TrendingUp },
        { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-[#E5E7EB] transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Area */}
                <div className="h-[72px] px-6 flex items-center justify-between border-b border-[#E5E7EB] shrink-0">
                    <img src={logo} alt="WeighPro Logo" className="h-[22px]" onError={(e) => { e.target.style.display = 'none' }} />
                    <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-1.5 custom-scrollbar">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');

                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-colors ${isActive
                                    ? 'bg-[#F3F4F6] text-[#111827]'
                                    : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827]'
                                    }`}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#111827]" : "text-[#9CA3AF]"} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
