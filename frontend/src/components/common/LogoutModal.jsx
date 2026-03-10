import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useTranslation('dashboard');
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef(null);

    // Handle animations and scroll lock logic
    useEffect(() => {
        const mainEl = document.querySelector('main');

        if (isOpen) {
            setIsVisible(true);
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            if (mainEl) {
                if (!mainEl.dataset.originalOverflow) {
                    mainEl.dataset.originalOverflow = mainEl.style.overflow || '';
                }
                mainEl.style.overflow = 'hidden';
            }
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            if (mainEl) mainEl.style.overflow = mainEl.dataset.originalOverflow || '';
            return () => clearTimeout(timer);
        }

        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            if (mainEl) mainEl.style.overflow = mainEl.dataset.originalOverflow || '';
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-slate-900/30 backdrop-blur-[2px] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div
                ref={modalRef}
                className={`bg-white w-full max-w-[380px] flex flex-col rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300 ease-in-out transform origin-center p-7 ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`}
            >
                {/* Header layout from reference */}
                <div className="flex items-start mb-8">
                    <div className="w-[42px] h-[42px] rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0 ring-[6px] ring-[#FFF5F5] mt-1">
                        <AlertCircle className="w-5 h-5 text-[#DC2626]" strokeWidth={2.5} />
                    </div>
                    <div className="ml-5">
                        <h2 className="text-[18px] font-bold text-gray-900 mb-1">{t('logout_title')}</h2>
                        <p className="text-[14px] text-gray-500 leading-relaxed font-medium pb-1 pr-2">
                            {t('logout_confirm')}
                        </p>
                    </div>
                </div>

                {/* Stacked Action Buttons */}
                <div className="flex flex-col space-y-3">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-[#DE352B] hover:bg-[#B91C1C] text-white font-semibold py-3 rounded-[10px] transition-colors shadow-sm text-[15px]"
                    >
                        {t('logout_btn')}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-3 rounded-[10px] transition-colors shadow-sm text-[15px]"
                    >
                        {t('stay_btn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
