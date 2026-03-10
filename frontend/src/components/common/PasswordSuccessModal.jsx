import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PasswordSuccessModal = ({ isOpen, onClose, onGoToSignIn }) => {
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

    // Close on ESC
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-slate-900/30 backdrop-blur-[2px] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div
                ref={modalRef}
                className={`bg-white w-full max-w-[420px] flex flex-col rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300 ease-in-out transform origin-center p-8 ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`}
            >
                <div className="flex flex-col">
                    {/* Circle Icon */}
                    <div className="w-12 h-12 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-6 ring-[6px] ring-[#F2FBF7]">
                        <Check className="w-6 h-6 text-[#059669]" strokeWidth={3} />
                    </div>

                    <h2 className="text-[20px] font-semibold text-gray-900 mb-3 tracking-snug">
                        {t('pwd_changed_title')}
                    </h2>

                    <p className="text-[14px] text-gray-500 mb-8 leading-relaxed font-medium">
                        {t('pwd_changed_desc')}
                    </p>

                    <button
                        onClick={onGoToSignIn}
                        className="w-full bg-[#052e16] hover:bg-[#02180a] text-white font-semibold py-3.5 rounded-[10px] transition-colors shadow-lg text-[14px]"
                    >
                        {t('goto_signin')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordSuccessModal;
