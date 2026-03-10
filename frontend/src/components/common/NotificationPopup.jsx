import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const mockNotifications = [
    {
        id: 1,
        name: 'Mahadev Patil',
        action: 'registered as a new user',
        time: '1 hour ago',
        type: 'New User',
        unread: true,
        avatar: 'https://ui-avatars.com/api/?name=Mahadev+Patil&background=CBD5E1&color=475569'
    },
    {
        id: 2,
        name: 'Adwaita Shinde',
        action: 'mentioned you in complaints',
        time: '1 hour ago',
        type: 'Complaints',
        unread: false,
        message: '@vallabh I am facing few issues with payments and inventory management, pls check this',
        avatar: 'https://ui-avatars.com/api/?name=Adwaita+Shinde&background=EF4444&color=fff'
    },
];

const NotificationPopup = ({ isOpen, activeTrigger, onClose }) => {
    const { t } = useTranslation('dashboard');
    const tabs = [
        { id: 'All', label: t('all_tab') },
        { id: 'New User', label: t('new_user_tab') },
        { id: 'Products', label: t('products_tab') },
        { id: 'Complaints', label: t('complaints_tab') },
        { id: 'Payments', label: t('payments_tab') }
    ];

    const [activeTab, setActiveTab] = useState('All');
    const [isVisible, setIsVisible] = useState(false);
    const popupRef = useRef(null);

    // Handle animations and scroll lock logic
    useEffect(() => {
        const mainEl = document.querySelector('main');

        if (isOpen) {
            setIsVisible(true);
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            if (mainEl) {
                mainEl.style.overflow = 'hidden';
            }
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            if (mainEl) mainEl.style.overflow = '';
            return () => clearTimeout(timer);
        }

        // Cleanup function for unmount
        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            if (mainEl) mainEl.style.overflow = '';
        }
    }, [isOpen]);

    // Close on click outside or ESC
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isVisible && !isOpen) return null;

    const filteredNotifications = mockNotifications.filter(n => activeTab === 'All' || n.type === activeTab);

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-start pt-[72px] md:pt-[76px] px-3 md:px-0 bg-slate-900/20 backdrop-blur-[2px] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            ${activeTrigger === 'search' ? 'md:pr-[90px] lg:pr-[110px]' : activeTrigger === 'notification' ? 'md:pr-[40px] lg:pr-[60px]' : 'md:pr-6 md:justify-end'}`}
            style={{
                justifyContent: window.innerWidth >= 768 ? 'flex-end' : 'center'
            }}
        >
            <div className="relative flex flex-col items-end w-full md:w-auto">
                {/* Visual Tether Arrow */}
                <div
                    className={`absolute -top-1.5 md:-top-2 right-[48px] md:right-6 w-3.5 h-3.5 md:w-4 md:h-4 bg-white transform rotate-45 border-l border-t border-gray-100 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                />

                <div
                    ref={popupRef}
                    className={`bg-white w-full md:w-[600px] flex flex-col rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 ease-in-out transform max-h-[85vh] md:max-h-[520px] origin-top md:origin-top-right ${isOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-4 md:translate-y-0 scale-95 md:scale-90 opacity-0'}`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
                        <h3 className="text-[16px] font-semibold text-gray-800 px-2">{t('notifications')}</h3>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="relative border-b border-gray-100 px-2 shrink-0 overflow-x-auto hide-scrollbar">
                        <div className="flex px-4 min-w-max">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-4 py-3.5 text-[14px] font-medium transition-colors cursor-pointer ${activeTab === tab.id ? 'text-[#166534]' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    {tab.label}
                                    {tab.id === 'New User' && (
                                        <div className="absolute top-3.5 right-1 w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
                                    )}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#166534] rounded-t-sm" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden flex flex-col bg-white">
                        <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex-1 overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                                {filteredNotifications.length > 0 ? (
                                    filteredNotifications.map((notification) => (
                                        <div key={notification.id} className="flex flex-col px-4 py-4 hover:bg-gray-50 rounded-[12px] cursor-pointer transition-colors border-b border-gray-50 last:border-0 hover:border-transparent">
                                            <div className="flex items-start">
                                                <div className="relative shrink-0">
                                                    <img src={notification.avatar} alt={notification.name} className="w-[42px] h-[42px] rounded-full object-cover bg-gray-100" />
                                                    {notification.unread && (
                                                        <span className="absolute top-0 right-[-2px] block h-[12px] w-[12px] rounded-full bg-[#22C55E] ring-[3px] ring-white" />
                                                    )}
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <p className="text-[14px] text-gray-600 leading-relaxed">
                                                        <span className="font-semibold text-gray-800">{notification.name}</span> {notification.action.replace('complaints', '')}
                                                        {notification.action.includes('complaints') && <span className="text-blue-500 font-medium hover:underline">complaints</span>}
                                                    </p>
                                                    <p className="text-[12px] text-gray-400 mt-0.5">{notification.time}</p>

                                                    {notification.message && (
                                                        <div className="mt-3 bg-gray-50/80 rounded-[8px] border border-gray-100 p-3 hover:bg-gray-100/50 transition-colors">
                                                            <p className="text-[13px] text-gray-600 mb-3">{notification.message}</p>
                                                            <input
                                                                type="text"
                                                                placeholder={t('reply')}
                                                                className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] outline-none focus:border-[#166534] focus:ring-1 focus:ring-[#166534] transition-all shadow-sm"
                                                                onClick={e => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-8">
                                        <p className="text-[14px] text-gray-500">{t('no_notifications')}</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 pt-3 bg-white border-t border-gray-50 shrink-0">
                                <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-[14px] font-semibold rounded-[8px] hover:border-[#166534] hover:text-[#166534] hover:bg-green-50 transition-all shadow-sm">
                                    {t('mark_all_read')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPopup;
