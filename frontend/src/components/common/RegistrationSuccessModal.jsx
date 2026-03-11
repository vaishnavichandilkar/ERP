import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RegistrationSuccessModal = ({ isOpen, onContinue }) => {
    const { t } = useTranslation(['auth', 'common']);
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
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-[4px] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div
                ref={modalRef}
                className={`bg-white w-full max-w-[420px] flex flex-col rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-300 ease-in-out transform origin-center p-8 ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`}
            >
                <div className="flex flex-col items-center text-center">
                    {/* Circle Icon */}
                    <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-6 ring-[8px] ring-[#F2FBF7]">
                        <Check className="w-8 h-8 text-[#059669]" strokeWidth={3} />
                    </div>

                    <h2 className="text-[24px] font-bold text-gray-900 mb-3 tracking-tight font-['Geist_Sans']">
                        {t('auth:registration_successful')}
                    </h2>

                    <p className="text-[15px] text-gray-500 mb-8 leading-relaxed font-medium font-['Plus_Jakarta_Sans']">
                        {t('auth:registration_completed_desc')}
                    </p>

                    <button
                        onClick={onContinue}
                        className="w-full bg-[#0F3D2E] hover:bg-[#0a291f] text-white font-bold py-4 rounded-[12px] transition-all duration-200 shadow-lg text-[16px] font-['Plus_Jakarta_Sans']"
                    >
                        {t('common:continue')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccessModal;
