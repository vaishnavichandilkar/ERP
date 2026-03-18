import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const SuccessToast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-[#014A36] text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3 min-w-[280px] justify-center relative">
                <CheckCircle2 size={18} className="text-white" />
                <span className="text-[14px] font-bold tracking-tight">{message}</span>
                <button 
                    onClick={onClose}
                    className="ml-2 hover:bg-white/10 rounded-full p-0.5 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default SuccessToast;
