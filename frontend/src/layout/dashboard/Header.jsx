import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, Globe, ChevronDown, LayoutDashboard, FileBarChart, Database, ShoppingCart, TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import logo from '../../assets/images/ERP_Logo2.png';
import ProfilePopup from '../../components/common/ProfilePopup';
import LogoutModal from '../../components/common/LogoutModal';
import StatusPopup from '../../components/common/StatusPopup';
import EditProfileModal from '../../components/common/EditProfileModal';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { getProfileApi } from '../../services/authService';
import { useTranslation } from 'react-i18next';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const { t } = useTranslation(['dashboard', 'common', 'modules', 'terms']);
    const location = useLocation();
    const navigate = useNavigate();

    // Popup states
    const [activePopupType, setActivePopupType] = useState(null);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

    React.useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const data = await getProfileApi();
                setUserData(data);
                localStorage.setItem('user', JSON.stringify(data));
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        };

        fetchUserProfile();
    }, []);

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
            <span className="font-bold text-[#111827]">{t('terms:dashboard')}</span>
        );

        if (pathSegments.length > 0) {
            const formattedSegments = pathSegments.map(segment => {
                const key = segment.replace(/-/g, '_');
                const translated = t(`modules:${key}`, { defaultValue: '' }) || t(`common:${key}`, { defaultValue: '' });
                if (translated) return translated;
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
            <div className="flex items-center text-[#4B5563] text-[13px] lg:text-[15px] font-medium uppercase tracking-wide">
                {breadcrumbElements}
            </div>
        );
    };

    return (
        <header className="h-[64px] lg:h-[72px] bg-white border-b border-[#E5E7EB] px-3 lg:px-6 flex items-center justify-between shrink-0">
            {/* Left Box: Menu button + Title/Logo */}
            <div className="flex items-center gap-2 lg:gap-4">
                <button
                    onClick={() => setSidebarOpen(prev => !prev)}
                    className="p-1 px-2 text-[#4B5563] hover:text-[#111827] focus:outline-none hover:bg-gray-100/50 rounded-md transition-all active:scale-95"
                >
                    <Menu size={22} strokeWidth={2.5} />
                </button>
                <div className="flex items-center gap-2">
                    {renderBreadcrumbs()}
                </div>
            </div>

            {/* Right Box: Setup icons */}
            <div className="flex items-center gap-2 lg:gap-5">

                {/* Rightmost Action icons */}
                <div className="flex items-center gap-3 lg:gap-4 relative">
                    <LanguageSwitcher />

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

                    <button
                        onClick={() => setActivePopupType('profile')}
                        className={`bg-[#65A30D] text-white w-[28px] h-[28px] lg:w-[38px] lg:h-[38px] rounded-full flex items-center justify-center font-semibold border border-white transition-all duration-200 ease-in-out overflow-hidden
                            ${activePopupType === 'profile'
                                ? 'scale-110 shadow-[0_0_15px_rgba(22,101,52,0.6)] z-[60] relative'
                                : 'shadow-sm hover:bg-[#4D7C0F] hover:scale-110 hover:shadow-[0_0_15px_rgba(22,101,52,0.4)] relative z-10'
                            }`}
                    >
                        {userData?.profileImage ? (
                            <img src={`http://localhost:3000/${userData.profileImage}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <User size={18} className="mt-1 lg:hidden" strokeWidth={1.5} />
                                <User size={22} className="mt-1 hidden lg:block" strokeWidth={1.5} />
                            </>
                        )}
                    </button>
                </div>
            </div>


            {/* Popups */}
            <StatusPopup isOpen={activePopupType === 'status'} activeTrigger={activePopupType} onClose={() => setActivePopupType(null)} />
            <ProfilePopup
                isOpen={activePopupType === 'profile'}
                activeTrigger={activePopupType}
                onClose={() => setActivePopupType(null)}
                user={userData}
                onMyProfile={() => setIsEditProfileOpen(true)}
                onLogout={() => setIsLogoutOpen(true)}
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

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                user={userData}
                onUpdateSuccess={(updatedUser) => setUserData(updatedUser)}
            />
        </header>
    );
};

export default Header;
