import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowLeft, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '../../../../utils/i18nUtils';

const CustomSelect = ({ label, options, value, onChange, placeholder, isSearchable = false, disabled = false, showAsterisk = false, error = '' }) => {
    const { t } = useTranslation(['common']);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = isSearchable && searchTerm
        ? options.filter(opt => opt?.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="flex flex-col gap-2 relative w-full" ref={dropdownRef}>
            <label className="text-[14px] font-bold text-[#374151]">
                {label} {showAsterisk && <span className="text-red-500">*</span>}
            </label>
            <div
                className={`w-full h-[46px] flex items-center justify-between px-4 border rounded-[10px] bg-white transition-all ${disabled ? 'cursor-default border-[#E5E7EB] bg-[#F9FAFB]' : isOpen ? 'border-[#073318] ring-1 ring-[#073318]/10 cursor-pointer' : 'border-[#E5E7EB] hover:border-gray-300 cursor-pointer'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {isSearchable && isOpen ? (
                    <input
                        type="text"
                        autoFocus
                        placeholder={t('search')}
                        className="w-full h-full outline-none text-[14px] font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className={`text-[14px] font-medium ${value ? 'text-[#111827]' : 'text-gray-400'}`}>
                        {value ? translateDynamic(value, t) : placeholder}
                    </span>
                )}
                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#E5E7EB] rounded-[10px] shadow-xl z-[100] py-2 max-h-[240px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, idx) => (
                            <div
                                key={idx}
                                className={`px-4 py-2.5 text-[14px] font-medium cursor-pointer transition-colors ${value === opt ? 'bg-[#F9FAFB] text-[#073318] font-bold' : 'text-[#4B5563] hover:bg-gray-50'}`}
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
                        <div className="px-4 py-3 text-[14px] text-gray-400 italic text-center">
                            {t('no_results_found')}
                        </div>
                    )}
                </div>
            )}
            {error && <p className="text-red-500 text-[12px] mt-1 font-medium">{error}</p>}
        </div>
    );
};

const CategoryForm = ({ mode = 'add', initialData = null, onBack, onSuccess }) => {
    const { t } = useTranslation(['common', 'modules']);
    const [formData, setFormData] = useState({
        category_name: '',
        category_under: 'None'
    });
    const [errors, setErrors] = useState({});

    // Mock categories for "Category Under"
    const categories = [
        'None',
        'Silage',
        'Animal Feed',
        'Fertilizers',
        'Seeds',
        'Farm Equipment',
        'Agri Chemicals'
    ];

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                category_name: initialData.name || '',
                category_under: initialData.under || 'None'
            });
        }
    }, [mode, initialData]);

    const validate = () => {
        const newErrors = {};
        if (!formData.category_name.trim()) newErrors.category_name = t('modules:category_name_required', 'Category name is required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        // Simulating save
        onSuccess && onSuccess();
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-[#111827]"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
                        {mode === 'add' ? t('modules:add_category') : t('modules:edit_category')}
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-[#6B7280] text-[15px] ml-12">
                    <span>{t('modules:category_master')}</span>
                    <span>/</span>
                    <span className="text-[#111827] font-medium">
                        {mode === 'add' ? t('modules:add_new') : t('modules:edit_details')}
                    </span>
                </div>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm overflow-hidden max-w-[900px]">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* Form Section Header */}
                    <div className="px-8 py-6 border-b border-[#F3F4F6] bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#073318]/5 flex items-center justify-center">
                                <Plus size={18} className="text-[#073318]" />
                            </div>
                            <h2 className="text-[16px] font-bold text-[#111827]">{t('modules:category_information')}</h2>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Two columns layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Category Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-[#374151]">
                                    {t('modules:category_name')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder={t('modules:enter_category_name')}
                                    className={`w-full h-[46px] px-4 border rounded-[10px] outline-none transition-all text-[14px] font-medium placeholder:text-gray-400 group-hover:border-gray-300 ${errors.category_name ? 'border-red-500 bg-red-50/30' : 'border-[#E5E7EB] bg-white focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10'}`}
                                    value={formData.category_name}
                                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                                />
                                {errors.category_name && <p className="text-red-500 text-[12px] font-medium">{errors.category_name}</p>}
                            </div>

                            {/* Category Under */}
                            <CustomSelect
                                label={t('modules:category_under')}
                                options={categories}
                                value={formData.category_under}
                                onChange={(val) => setFormData({ ...formData, category_under: val })}
                                placeholder={t('common:select_category_under')}
                                isSearchable={true}
                                showAsterisk={true}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 py-6 border-t border-[#F3F4F6] bg-gray-50/50 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 h-[46px] border border-[#E5E7EB] text-[#4B5563] font-bold rounded-[10px] hover:bg-white hover:text-[#111827] transition-all text-[14px] bg-[#F9FAFB] shadow-sm"
                        >
                            {t('common:cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-10 h-[46px] bg-[#073318] text-white font-bold rounded-[10px] hover:bg-[#04200f] transition-all text-[14px] shadow-md shadow-[#073318]/20 flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            {mode === 'add' ? t('common:add') : t('common:save_changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;
