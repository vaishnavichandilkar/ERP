import React from 'react';

const Card = ({ children, className = '', hoverable = false, onClick, ...props }) => {
    const baseClass = "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ease-in-out";
    const hoverClass = hoverable ? "hover:shadow-lg hover:-translate-y-1 hover:border-[#0B3D2E]/20 cursor-pointer" : "";

    return (
        <div
            className={`${baseClass} ${hoverClass} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
    <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 ${className}`}>
        <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end ${className}`}>
        {children}
    </div>
);

export default Card;
