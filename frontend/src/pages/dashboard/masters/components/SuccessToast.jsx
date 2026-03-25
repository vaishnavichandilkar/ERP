import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const SuccessToast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isError = type === 'error';

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
            <div className={`
                px-6 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center gap-3 min-w-[280px] justify-center transition-all pointer-events-auto
                ${isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#073318] text-white'}
            `}>
                {isError ? (
                    <XCircle size={18} className="shrink-0" />
                ) : (
                    <CheckCircle2 size={18} className="shrink-0" />
                )}
                <span className="text-[14px] font-bold tracking-tight whitespace-nowrap">{message}</span>
                <button 
                    onClick={onClose}
                    className={`ml-2 rounded-full p-1 transition-colors ${isError ? 'hover:bg-red-100' : 'hover:bg-white/10'}`}
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default SuccessToast;
