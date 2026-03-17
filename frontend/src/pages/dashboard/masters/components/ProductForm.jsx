import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '../../../../utils/i18nUtils';

const CustomSelect = ({ label, options, value, onChange, placeholder, isSearchable = false, disabled = false, showAsterisk = false }) => {
    const { t } = useTranslation(['common']);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = isSearchable && searchTerm
        ? options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-1.5 relative w-full" ref={dropdownRef}>
            <label className="text-[13px] font-semibold text-[#4B5563]">
                {label} {showAsterisk && <span className="text-red-500">*</span>}
            </label>
            <div
                className={`w-full h-[44px] flex items-center justify-between px-4 border rounded-[8px] bg-white transition-colors ${disabled ? 'cursor-default border-[#E5E7EB]' : isOpen ? 'border-[#014A36] ring-1 ring-[#014A36]/10 cursor-pointer' : 'border-[#E5E7EB] hover:border-gray-300 cursor-pointer'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {isSearchable && isOpen ? (
                    <input
                        type="text"
                        autoFocus
                        placeholder={value || placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder:text-gray-400"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className={`text-[14px] truncate ${value ? 'text-[#111827]' : 'text-gray-500'}`}>
                        {value ? translateDynamic(value, t) : placeholder}
                    </span>
                )}
                {!disabled && (isOpen ? <ChevronUp size={16} className="text-gray-500 shrink-0" /> : <ChevronDown size={16} className="text-gray-500 shrink-0" />)}
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-[8px] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                                    {translateDynamic(opt, t)}
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
    const [loading, setLoading] = useState(false);

    const getInitialUOM = (uom) => {
        if (!uom) return '';
        if (uom.toUpperCase() === 'KG') return 'KGS';
        return uom;
    };

    const initialFormData = {
        productName: initialData?.name || '',
        productCode: initialData?.code || '',
        uom: getInitialUOM(initialData?.uom),
        productType: initialData?.type || '',
        category: initialData?.category || '',
        subcategory: initialData?.subcategory || '',
        hsnCode: initialData?.hsn || '',
        tax: initialData?.tax || '',
        description: initialData?.name || ''
    };

    const [formData, setFormData] = useState(initialFormData);

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
    const showAsterisk = true;

    const isDirty = mode === 'edit' ? (
        formData.productName !== initialFormData.productName ||
        formData.productCode !== initialFormData.productCode ||
        formData.uom !== initialFormData.uom ||
        formData.productType !== initialFormData.productType ||
        formData.category !== initialFormData.category ||
        formData.subcategory !== initialFormData.subcategory ||
        formData.hsnCode !== initialFormData.hsnCode ||
        formData.tax !== initialFormData.tax ||
        formData.description !== initialFormData.description
    ) : true;

    const isFilled = !!(formData.productName && formData.productCode && formData.uom && formData.productType && formData.category);

    const renderInput = (label, field, placeholder) => (
        <div className="flex flex-col gap-2 w-full">
            <label className="text-[14px] font-medium text-[#4B5563]">
                {label} {showAsterisk && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                placeholder={placeholder}
                disabled={isView}
                className={`w-full h-[46px] border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] text-[#111827] outline-none transition-all bg-white 
                    ${isView ? 'cursor-default' : 'focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10'}`}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
            />
        </div>
    );

    const renderViewMode = () => (
        <div className="flex flex-col w-full bg-white border border-[#E5E7EB] rounded-[16px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-in fade-in duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#F3F4F6] bg-white flex items-center justify-between">
                <div>
                    <h3 className="text-[20px] font-bold text-[#111827]">{t('modules:view_product')}</h3>
                </div>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] text-[14px] font-bold hover:bg-gray-50 transition-all bg-white shadow-sm"
                >
                    {t('common:back')}
                </button>
            </div>

            {/* Detailed Info Table */}
            <div className="flex flex-col">
                {[
                    { label: t('modules:product_name'), value: formData.productName },
                    { label: t('modules:product_code'), value: formData.productCode },
                    { label: t('modules:uom'), value: formData.uom },
                    { label: t('modules:product_type'), value: formData.productType },
                    { label: t('modules:category'), value: formData.category },
                    { label: t('modules:sub_category'), value: formData.subcategory },
                    { label: t('modules:hsn_code'), value: formData.hsnCode },
                    { label: t('modules:tax_percent'), value: formData.tax },
                    { label: t('modules:product_desc'), value: formData.description || '-' }
                ].map((item, idx) => (
                    <div key={idx} className="flex border-b border-[#F3F4F6] min-h-[56px] last:border-b-0 group">
                        <div className="w-[240px] bg-[#F9FAFB] px-8 py-4 flex items-center border-r border-[#F3F4F6]">
                            <span className="text-[14px] font-bold text-gray-500 uppercase tracking-tight">{item.label}:</span>
                        </div>
                        <div className="flex-1 px-8 py-4 flex items-center bg-white group-hover:bg-[#F9FAFB]/50 transition-colors">
                            <span className="text-[16px] font-bold text-[#111827]">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Buttons */}
            <div className="px-8 py-6 bg-[#F9FAFB]/50 flex justify-end gap-3 border-t border-[#F3F4F6]">
                <button
                    onClick={onBack}
                    className="px-8 h-[46px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] text-[14px] font-bold hover:bg-white transition-all bg-white"
                >
                    {t('common:cancel')}
                </button>
                <button
                    onClick={() => onBack()}
                    className="px-8 h-[46px] bg-[#073318] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#04200f] transition-all shadow-sm flex items-center justify-center min-w-[140px]"
                >
                    {t('modules:update_product')}
                </button>
            </div>
        </div>
    );

    if (isView) {
        return (
            <div className="flex flex-col w-full h-full p-2">
                {renderViewMode()}
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full animate-in fade-in duration-300">
            {/* Top Action Bar */}
            <div className="flex justify-start mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 h-[44px] bg-white border border-[#E5E7EB] text-[#4B5563] rounded-[10px] text-[14px] font-bold hover:bg-gray-50 transition-all shadow-sm"
                >
                    {t('common:back')}
                </button>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col w-full mb-12">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#F3F4F6] bg-white">
                    <h2 className="text-[24px] font-bold text-[#111827] tracking-tight">
                        {mode === 'add' ? t('modules:add_product') : mode === 'edit' ? t('modules:update_product') : t('modules:view_product')}
                    </h2>
                    <p className="text-[15px] text-gray-500 mt-1">
                        {mode === 'add' ? 'Please fill in the information below to create a new product.' : 'Make changes to the product details below.'}
                    </p>
                </div>

                {/* Form Body */}
                <div className="p-8 md:p-10 flex flex-col gap-8 w-full">
                    <div className="grid grid-cols-1 gap-8 w-full">
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
                        {renderInput(t('modules:product_desc'), 'description', t('modules:enter_product_desc'))}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-8 py-6 border-t border-[#F3F4F6] flex items-center justify-end gap-4 bg-[#F9FAFB]/30">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={loading}
                        className="px-8 h-[48px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] text-[15px] font-bold hover:bg-gray-50 transition-all bg-white"
                    >
                        {t('common:cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={() => !loading && isFilled && isDirty && onBack()}
                        disabled={loading || !isFilled || (mode === 'edit' && !isDirty)}
                        className={`px-10 h-[48px] text-white rounded-[10px] text-[15px] font-bold transition-all shadow-md flex items-center justify-center min-w-[180px] ${loading || !isFilled || (mode === 'edit' && !isDirty) ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#073318] hover:bg-[#04200f]'}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <div className="flex items-center justify-center">
                                {mode === 'add' ? t('modules:add_product') : t('modules:update_product')}
                            </div>
                        )}
                    </button>
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
