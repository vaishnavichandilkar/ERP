import React from 'react';

const IconWrapper = ({ children, position }) => (
    <div className={`absolute flex items-center justify-center pointer-events-none text-gray-500 ${position === 'start' ? 'left-3' : 'right-3'}`}>
        {children}
    </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, name, required, startIcon, endIcon, select, children, prefix, invalid, ...props }) => {
    const isSelect = select;
    const baseInputClass = `w-full min-h-[44px] px-3 py-2 border rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none transition-colors ${invalid ? 'border-red-500 focus:ring-1 focus:ring-red-500/20' : 'border-gray-300 focus:ring-1 focus:ring-[#0B3D2E] focus:border-[#0B3D2E]'}`;

    // Remove unused MUI props
    delete props.SelectProps;

    const wrapperClass = "flex relative items-center w-full";

    return (
        <div className="w-full flex justify-start flex-col">
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 shrink-0 text-left">
                    {label}{required && ' *'}
                </label>
            )}
            {prefix ? (
                <div className={`relative flex items-center w-full min-h-[44px] border rounded-[8px] bg-white transition-all duration-300 overflow-hidden ${invalid ? 'border-red-500 focus-within:ring-1 focus-within:ring-red-500/20' : 'border-gray-300 focus-within:border-[#0B3D2E] focus-within:ring-1 focus-within:ring-[#0B3D2E]'}`}>
                    <div className="pl-4 pr-3 flex items-center h-full text-gray-900 border-r border-[#E5E7EB] shrink-0">
                        {prefix}
                    </div>
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        className="flex-1 w-full h-full min-h-[42px] placeholder-gray-400 outline-none bg-transparent px-3"
                        {...props}
                    />
                    {endIcon && <IconWrapper position="end">{endIcon}</IconWrapper>}
                </div>
            ) : (
                <div className={wrapperClass}>
                    {startIcon && <IconWrapper position="start">{startIcon}</IconWrapper>}

                    {isSelect ? (
                        <select
                            id={name}
                            name={name}
                            value={value}
                            onChange={onChange}
                            required={required}
                            className={`${baseInputClass} ${startIcon ? 'pl-10' : ''} ${endIcon ? 'pr-10' : ''} ${!value ? 'text-gray-400' : ''} appearance-none cursor-pointer`}
                            {...props}
                        >
                            {children}
                        </select>
                    ) : (
                        <input
                            id={name}
                            name={name}
                            type={type}
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}
                            required={required}
                            className={`${baseInputClass} ${startIcon ? 'pl-12' : ''} ${endIcon ? 'pr-10' : ''}`}
                            {...props}
                        />
                    )}

                    {endIcon && <IconWrapper position="end">{endIcon}</IconWrapper>}
                </div>
            )}
        </div>
    );
};

export default Input;
