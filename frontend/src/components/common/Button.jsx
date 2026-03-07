import React from 'react';

const Button = ({ variant = 'primary', disabled, onClick, children, type = 'button', className = '', startIcon, endIcon, sx, ...props }) => {
    // Determine the base styles
    const baseClass = "flex items-center justify-center font-semibold rounded-lg transition-colors duration-200 focus:outline-none w-full shadow-none disabled:opacity-50 disabled:cursor-not-allowed";

    let customStyle = {};
    if (sx) {
        customStyle = { ...sx };
    }

    // Apply variants
    let variantClass = "";
    if (variant === 'contained' || variant === 'primary') {
        variantClass = "bg-[#0B3D2E] text-white hover:bg-[#092E22] py-3";
    } else if (variant === 'outlined' || variant === 'secondary') {
        variantClass = "border border-[#0B3D2E] text-[#0B3D2E] hover:bg-gray-50 py-3";
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseClass} ${variantClass} ${className}`}
            style={customStyle}
            {...props}
        >
            {startIcon && <span className="mr-2 flex items-center">{startIcon}</span>}
            <span className="flex-1 truncate inline-flex justify-center">{children}</span>
            {endIcon && <span className="ml-2 flex items-center">{endIcon}</span>}
        </button>
    );
};

export default Button;
