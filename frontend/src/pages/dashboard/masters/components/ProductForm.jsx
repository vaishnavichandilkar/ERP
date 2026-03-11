import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CustomSelect = ({ label, options, value, onChange, placeholder, isSearchable = false, disabled = false, showAsterisk = false }) => {
    const { t } = useTranslation('common');
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = isSearchable && searchTerm
        ? options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    return (
        <div className="flex flex-col gap-1.5 relative w-full" ref={dropdownRef}>
            <label className="text-[13px] font-semibold text-[#4B5563]">
                {label} {showAsterisk && <span className="text-red-500">*</span>}
            </label>
            <div
                className={`w-full h-[44px] flex items-center justify-between px-4 border rounded-[8px] bg-white transition-colors ${disabled ? 'cursor-default border-[#E5E7EB]' : isOpen ? 'border-[#014A36] ring-1 ring-[#014A36]/10 cursor-pointer' : 'border-[#E5E7EB] hover:border-gray-300 cursor-pointer'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`text-[14px] truncate ${value ? 'text-[#111827]' : 'text-gray-500'}`}>
                    {value || placeholder}
                </span>
                {!disabled && (isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />)}
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-[8px] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {isSearchable && (
                        <div className="p-2 border-b border-gray-100">
                            <input
                                type="text"
                                placeholder={t('search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-[36px] px-3 text-[14px] border border-gray-200 rounded-[6px] outline-none focus:border-[#014A36]"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <div className="max-h-[240px] overflow-y-auto w-full py-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${value === opt ? 'bg-[#F9FAFB] text-[#014A36] font-medium' : 'text-[#4B5563] hover:bg-gray-50'}`}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    {opt}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-[14px] text-gray-500 text-center">{t('no_options_found')}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProductForm = ({ mode = 'add', initialData = null, onBack }) => {
    const { t } = useTranslation(['modules', 'common']);
    // Mode can be 'add', 'edit', 'view'

    // Format UOM to match the full name style if needed, or stick to provided list. 
    // In our list it is 'TON' instead of 'Ton', but for simplicity using the list precisely.
    const getInitialUOM = (uom) => {
        if (!uom) return '';
        if (uom.toUpperCase() === 'KG') return 'KGS';
        return uom;
    };

    const [formData, setFormData] = useState({
        productName: initialData?.name || '',
        productCode: initialData?.code || '',
        uom: getInitialUOM(initialData?.uom),
        productType: initialData?.type || '',
        category: initialData?.category || '',
        subcategory: initialData?.subcategory || '',
        hsnCode: initialData?.hsn || '',
        tax: initialData?.tax || '',
        description: initialData?.name || ''
    });

    const UOM_LIST = [
        'BAG', 'BAL', 'BDL', 'BKL', 'BOU', 'BOX', 'BTL', 'BUN', 'CAN', 'CBM',
        'CCM', 'CMS', 'CTN', 'DOZ', 'DRM', 'GGR', 'GMS', 'GRS', 'GYD', 'KGS',
        'KLR', 'KME', 'MLT', 'MTR', 'MTS', 'NOS', 'PAC', 'PCS', 'PRS', 'QTL',
        'ROL', 'SET', 'SQF', 'SQM', 'SQY', 'TBS', 'TGM', 'THD', 'TON', 'TUB',
        'UGC', 'UNT', 'YDS', 'OTHER'
    ];

    const PRODUCT_TYPES = [t('modules:goods'), t('modules:service')];
    const CATEGORIES = [
        t('modules:cattle_feed'),
        t('modules:fertilizers'),
        t('modules:weighing_equipment'),
        t('modules:agricultural_inputs'),
        t('modules:silage'),
        t('modules:animal_feed'),
        t('modules:seeds')
    ];
    const SUBCATEGORIES = [
        t('modules:maize_silage'),
        t('modules:cattle_feed'),
        t('modules:wheat_seeds'),
        t('modules:organic_fertilizers'),
        t('modules:digital_indicator'),
        t('modules:crop_nutrients')
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isView = mode === 'view';
    const showAsterisk = mode === 'add';

    const renderInput = (label, field, placeholder) => (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-semibold text-[#4B5563]">
                {label} {showAsterisk && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                placeholder={placeholder}
                disabled={isView}
                className={`w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none transition-all bg-white 
                    ${isView ? 'cursor-default' : 'focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
            />
        </div>
    );

    return (
        <div className="flex flex-col w-full h-full animate-in fade-in duration-300">
            {/* Top Action Bar */}
            {mode !== 'view' && (
                <div className="flex justify-end mb-6">
                    <button
                        onClick={onBack}
                        className="px-6 h-[44px] bg-white border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        {t('common:back')}
                    </button>
                </div>
            )}

            {/* Form Container */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col w-full">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#E5E7EB]">
                    <h2 className="text-[18px] font-bold text-[#111827]">
                        {mode === 'add' ? t('modules:add_product') : mode === 'edit' ? t('modules:update_product') : t('modules:view_product')}
                    </h2>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {renderInput(t('modules:product_name'), 'productName', t('modules:enter_product_name'))}
                        {renderInput(t('modules:product_code'), 'productCode', t('modules:product_code_auto'))}

                        <CustomSelect
                            label={t('modules:uom')}
                            placeholder={t('common:select') + ' ' + t('modules:uom')}
                            options={UOM_LIST}
                            value={formData.uom}
                            onChange={(val) => handleInputChange('uom', val)}
                            isSearchable={true}
                            disabled={isView}
                            showAsterisk={showAsterisk}
                        />

                        <CustomSelect
                            label={t('modules:product_type')}
                            placeholder={t('common:select') + ' ' + t('modules:product_type')}
                            options={PRODUCT_TYPES}
                            value={formData.productType}
                            onChange={(val) => handleInputChange('productType', val)}
                            disabled={isView}
                            showAsterisk={showAsterisk}
                        />

                        <CustomSelect
                            label={t('modules:category')}
                            placeholder={t('common:select') + ' ' + t('modules:category')}
                            options={CATEGORIES}
                            value={formData.category}
                            onChange={(val) => handleInputChange('category', val)}
                            disabled={isView}
                            showAsterisk={showAsterisk}
                        />

                        <CustomSelect
                            label={t('modules:sub_category')}
                            placeholder={t('common:select') + ' ' + t('modules:sub_category')}
                            options={SUBCATEGORIES}
                            value={formData.subcategory}
                            onChange={(val) => handleInputChange('subcategory', val)}
                            disabled={isView}
                            showAsterisk={showAsterisk}
                        />

                        {renderInput(t('modules:hsn_code'), 'hsnCode', t('common:enter') + ' ' + t('modules:hsn_code'))}
                        {renderInput(t('modules:tax_percent'), 'tax', t('modules:tax_auto'))}
                    </div>

                    {renderInput(t('modules:product_desc'), 'description', t('modules:enter_product_desc'))}
                </div>

                {/* Footer Buttons */}
                <div className={`px-6 py-5 border-t border-[#E5E7EB] flex items-center bg-white/50 rounded-b-[12px] ${mode === 'view' ? 'justify-end' : 'justify-end gap-4'}`}>
                    {mode === 'view' ? (
                        <button
                            onClick={onBack}
                            className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white"
                        >
                            {t('common:back')}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onBack}
                                className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white"
                            >
                                {t('common:cancel')}
                            </button>
                            <button
                                onClick={onBack}
                                className="px-8 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-colors shadow-sm opacity-90 hover:opacity-100"
                            >
                                {mode === 'add' ? t('modules:add_product') : t('modules:update_product')}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #E5E7EB;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #D1D5DB;
                }
            `}</style>
        </div>
    );
};

export default ProductForm;
