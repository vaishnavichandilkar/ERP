import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Wifi, Printer, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StatusPopup = ({ isOpen, activeTrigger, onClose }) => {
    const { t } = useTranslation('common');
    const [isVisible, setIsVisible] = useState(false);
    const popupRef = useRef(null);

    // Mock connection states for now
    const isMachineConnected = true;
    const isWifiConnected = false;
    const isPrinterConnected = true;

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
            if (popupRef.current && !popupRef.current.contains(event.target) && !event.target.closest('[data-status-trigger="true"]')) {
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

    return (
        <div
            className={`fixed inset-0 z-[55] flex justify-center pt-[68px] lg:hidden bg-slate-900/20 backdrop-blur-[2px] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} pr-[28%]`}
            style={{
                alignItems: 'flex-start'
            }}
        >

            <div className="relative flex flex-col items-center w-[200px] z-10">
                {/* Visual Tether Arrow */}
                <div
                    className={`absolute -top-1.5 w-3.5 h-3.5 bg-white transform rotate-45 border-l border-t border-gray-100 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                    style={{ right: '10px' }}
                />

                <div
                    ref={popupRef}
                    className={`bg-white w-full rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-gray-50 overflow-hidden flex flex-col relative transition-all duration-300 ease-in-out transform origin-top ${isOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-2 scale-95 opacity-0'}`}
                >
                    {/* Machine Status */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                        <div className="flex items-center text-gray-700">
                            <Monitor className="w-[18px] h-[18px] text-gray-500 mr-3" strokeWidth={1.5} />
                            <span className="text-[14px] font-medium">{t('machine')}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-[10px] font-medium text-gray-400 mr-1 mt-0.5">{isMachineConnected ? t('connected') : t('disconnected')}</span>
                            {isMachineConnected ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" strokeWidth={2.5} />
                            ) : (
                                <XCircle className="w-3.5 h-3.5 text-[#EF4444]" strokeWidth={2.5} />
                            )}
                        </div>
                    </div>

                    {/* Wifi Status */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                        <div className="flex items-center text-gray-700">
                            <Wifi className="w-[18px] h-[18px] text-gray-500 mr-3" strokeWidth={1.5} />
                            <span className="text-[14px] font-medium">{t('wifi')}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-[10px] font-medium text-gray-400 mr-1 mt-0.5">{isWifiConnected ? t('connected') : t('disconnected')}</span>
                            {isWifiConnected ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" strokeWidth={2.5} />
                            ) : (
                                <XCircle className="w-3.5 h-3.5 text-[#EF4444]" strokeWidth={2.5} />
                            )}
                        </div>
                    </div>

                    {/* Printer Status */}
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center text-gray-700">
                            <Printer className="w-[18px] h-[18px] text-gray-500 mr-3" strokeWidth={1.5} />
                            <span className="text-[14px] font-medium">{t('printer')}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-[10px] font-medium text-gray-400 mr-1 mt-0.5">{isPrinterConnected ? t('connected') : t('disconnected')}</span>
                            {isPrinterConnected ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" strokeWidth={2.5} />
                            ) : (
                                <XCircle className="w-3.5 h-3.5 text-[#EF4444]" strokeWidth={2.5} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusPopup;
