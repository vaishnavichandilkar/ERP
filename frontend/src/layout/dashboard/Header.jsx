import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Printer, Wifi, Settings as SettingsIcon, HelpCircle, Search, Bell, User, Globe, ChevronDown, LayoutDashboard, FileBarChart, Database, ShoppingCart, TrendingUp, Activity, Box, Users, Layers, Wrench, DollarSign, FileText, ShieldCheck } from 'lucide-react';
import logo from '../../assets/images/ERP_Logo2.png';
import SearchPopup from '../../components/common/SearchPopup';
import NotificationPopup from '../../components/common/NotificationPopup';
import ProfilePopup from '../../components/common/ProfilePopup';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import PasswordSuccessModal from '../../components/common/PasswordSuccessModal';
import LogoutModal from '../../components/common/LogoutModal';
import StatusPopup from '../../components/common/StatusPopup';

const Header = ({ setSidebarOpen }) => {
    // For visual representation only. Mocking an 'off' / 'on' state.
    const isConnected = false;
    const location = useLocation();
    const navigate = useNavigate();

    // Popup states
    const [activePopupType, setActivePopupType] = useState(null);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isPasswordSuccessOpen, setIsPasswordSuccessOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    // Determine Breadcrumbs dynamically
    const renderBreadcrumbs = () => {
        const path = location.pathname.replace(/\/$/, "");
        const segments = path.split('/').filter(Boolean);

        let IconComponent = LayoutDashboard;
        const pathSegments = segments.filter(seg => seg !== 'seller' && seg !== 'dashboard');

        if (pathSegments.length > 0) {
            switch (pathSegments[0]) {
                case 'reports': IconComponent = FileBarChart; break;
                case 'masters': IconComponent = Database; break;
                case 'purchase': IconComponent = ShoppingCart; break;
                case 'sales': IconComponent = TrendingUp; break;
                case 'settings': IconComponent = SettingsIcon; break;
                default: IconComponent = LayoutDashboard; break;
            }
        }

        let breadcrumbElements = (
            <span className="font-bold text-[#111827]">Dashboard</span>
        );
        
        if (pathSegments.length > 0) {
            const formattedSegments = pathSegments.map(segment => {
                return segment.split(/[_-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            });
            
            breadcrumbElements = formattedSegments.map((segment, index) => {
                const isLast = index === formattedSegments.length - 1;
                return (
                    <span key={index} className="flex items-center">
                        <span className={isLast ? "font-bold text-[#111827]" : "text-[#4B5563]"}>
                            {segment}
                        </span>
                        {!isLast && <span className="mx-1.5 font-normal text-[#4B5563]">&gt;</span>}
                    </span>
                );
            });
        }

        return (
            <div className="flex items-center text-[#4B5563] text-[14px] lg:text-[15px] font-medium uppercase tracking-wide">
                <IconComponent size={18} strokeWidth={2.5} className="mr-[10px] text-[#111827]" />
                {breadcrumbElements}
            </div>
        );
    };

    return (
        <header className="h-[64px] lg:h-[72px] bg-white border-b border-[#E5E7EB] px-3 lg:px-6 flex items-center justify-between shrink-0">
            {/* Left Box: Menu button + Title/Logo */}
            <div className="flex items-center gap-2 lg:gap-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-1 lg:hidden text-[#4B5563] hover:text-[#111827] focus:outline-none"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden lg:flex items-center gap-2 text-[14px] lg:text-[15px] font-medium">
                    {renderBreadcrumbs()}
                </div>
                {/* Mobile Logo */}
                <img src={logo} alt="WeighPro Logo" className="h-[14px] ml-1 lg:hidden block" onError={(e) => { e.target.style.display = 'none' }} />
            </div>

            {/* Right Box: Setup icons */}
            <div className="flex items-center gap-2 lg:gap-5">
                {/* Indicator Group */}
                {(location.pathname !== '/seller/dashboard/facility/add' && location.pathname !== '/seller/dashboard/facility/view' && location.pathname !== '/seller/dashboard/facility/update') && (
                    <div className="hidden lg:flex items-center gap-4 lg:gap-5 border-r border-[#E5E7EB] pr-4 lg:pr-5">
                        <div className="flex items-center gap-1.5">
                            <Printer size={18} className={isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"} />
                            <span className={`text-[14px] font-medium ${isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"}`}>
                                {isConnected ? 'On' : 'Off'}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-[#E5E7EB]"></div>
                        <div className="flex items-center gap-1.5">
                            <Wifi size={18} className={isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"} />
                            <span className={`text-[14px] font-medium ${isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"}`}>
                                {isConnected ? 'On' : 'Off'}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-[#E5E7EB]"></div>
                        <div className="flex items-center gap-1.5">
                            <SettingsIcon size={18} className={isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"} />
                            <span className={`text-[14px] font-medium ${isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"}`}>
                                {isConnected ? 'On' : 'Off'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Rightmost Action icons */}
                <div className="flex items-center gap-3 lg:gap-4 relative">
                    {/* Globe specifically shown on mobile */}
                    <button
                        onClick={() => setActivePopupType('status')}
                        className={`lg:hidden flex items-center transition-colors p-1.5 rounded-full
                            ${activePopupType === 'status'
                                ? 'text-[#166534] bg-[#166534]/10 z-[60] relative shadow-[0_0_15px_rgba(22,101,52,0.4)]'
                                : 'text-[#4B5563] hover:text-[#111827] relative z-10'
                            }`}
                    >
                        <Globe size={18} strokeWidth={1.5} />
                        {activePopupType === 'status' ? (
                            <ChevronDown size={14} strokeWidth={1.5} className="ml-0.5 rotate-180 transition-transform duration-200" />
                        ) : (
                            <ChevronDown size={14} strokeWidth={1.5} className="ml-0.5 transition-transform duration-200" />
                        )}
                    </button>
                    {(location.pathname !== '/seller/dashboard/facility/add' && location.pathname !== '/seller/dashboard/facility/view' && location.pathname !== '/seller/dashboard/facility/update') && (
                        <button className="hidden lg:block text-[#4B5563] hover:text-[#111827] transition-colors">
                            <HelpCircle size={20} strokeWidth={1.5} />
                        </button>
                    )}
                    <button
                        onClick={() => setActivePopupType('search')}
                        className={`p-1.5 rounded-full transition-all duration-200 ease-in-out
                            ${activePopupType === 'search'
                                ? 'text-[#166534] scale-110 shadow-[0_0_15px_rgba(22,101,52,0.4)] bg-[#166534]/10 z-[60] relative'
                                : 'text-[#4B5563] hover:text-[#166534] hover:scale-110 hover:shadow-[0_0_15px_rgba(22,101,52,0.4)] hover:bg-[#166534]/10 relative z-10'
                            }`}
                    >
                        <Search size={18} className="lg:w-[20px] lg:h-[20px]" strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => setActivePopupType('notification')}
                        className={`p-1.5 rounded-full transition-all duration-200 ease-in-out
                            ${activePopupType === 'notification'
                                ? 'text-[#166534] scale-110 shadow-[0_0_15px_rgba(22,101,52,0.4)] bg-[#166534]/10 z-[60] relative'
                                : 'text-[#4B5563] hover:text-[#166534] hover:scale-110 hover:shadow-[0_0_15px_rgba(22,101,52,0.4)] hover:bg-[#166534]/10 relative z-10'
                            }`}
                    >
                        <Bell size={18} className="lg:w-[20px] lg:h-[20px]" strokeWidth={1.5} />
                    </button>

                    <button
                        onClick={() => setActivePopupType('profile')}
                        className={`bg-[#65A30D] text-white w-[28px] h-[28px] lg:w-[38px] lg:h-[38px] rounded-full flex items-center justify-center font-semibold border border-white transition-all duration-200 ease-in-out overflow-hidden
                            ${activePopupType === 'profile'
                                ? 'scale-110 shadow-[0_0_15px_rgba(22,101,52,0.6)] z-[60] relative'
                                : 'shadow-sm hover:bg-[#4D7C0F] hover:scale-110 hover:shadow-[0_0_15px_rgba(22,101,52,0.4)] relative z-10'
                            }`}
                    >
                        <User size={18} className="mt-1 lg:hidden" strokeWidth={1.5} />
                        <User size={22} className="mt-1 hidden lg:block" strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Popups */}
            <StatusPopup isOpen={activePopupType === 'status'} activeTrigger={activePopupType} onClose={() => setActivePopupType(null)} />
            <SearchPopup isOpen={activePopupType === 'search'} activeTrigger={activePopupType} onClose={() => setActivePopupType(null)} />
            <NotificationPopup isOpen={activePopupType === 'notification'} activeTrigger={activePopupType} onClose={() => setActivePopupType(null)} />
            <ProfilePopup
                isOpen={activePopupType === 'profile'}
                activeTrigger={activePopupType}
                onClose={() => setActivePopupType(null)}
                onChangePassword={() => setIsChangePasswordOpen(true)}
                onLogout={() => setIsLogoutOpen(true)}
            />

            {/* Modals */}
            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
                onSuccess={() => {
                    setIsChangePasswordOpen(false);
                    // Slight delay to allow first modal to fade before second pops
                    setTimeout(() => setIsPasswordSuccessOpen(true), 300);
                }}
            />
            <PasswordSuccessModal
                isOpen={isPasswordSuccessOpen}
                onClose={() => setIsPasswordSuccessOpen(false)}
                onGoToSignIn={() => {
                    setIsPasswordSuccessOpen(false);
                    setTimeout(() => setIsLogoutOpen(true), 300);
                }}
            />
            <LogoutModal
                isOpen={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
                onConfirm={() => {
                    setIsLogoutOpen(false);
                    // Clear tokens and user data
                    localStorage.removeItem('token');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    // Redirect to landing page
                    navigate('/');
                }}
            />
        </header>
    );
};

export default Header;
