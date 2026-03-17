import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '../../../../utils/i18nUtils';

const AddCategoryModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation(['common', 'modules']);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);

    // Mock categories for "Category Under"
    const categories = [
        'Silage',
        'Animal Feed',
        'Fertilizers',
        'Seeds',
        'Farm Equipment',
        'Agri Chemicals'
    ];

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div
                ref={modalRef}
                className={`bg-white w-full max-w-[440px] rounded-[16px] shadow-2xl transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#F3F4F6]">
                    <h2 className="text-[18px] font-bold text-[#111827] tracking-tight">{t('modules:add_category', 'Add Category')}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#111827] hover:bg-gray-100 rounded-full transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-6">
                    {/* Category Input */}
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:category', 'Category Name')}</label>
                        <input
                            type="text"
                            placeholder={t('common:enter_category_name', 'Enter category name')}
                            className="w-full h-[46px] border border-[#E5E7EB] rounded-[10px] px-4 outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all placeholder:text-gray-400 text-[14px] text-[#111827] bg-[#F9FAFB] hover:bg-white"
                        />
                    </div>

                    {/* Category Under Dropdown */}
                    <div className="space-y-2 pb-2">
                        <label className="text-[14px] font-bold text-[#4B5563]">{t('common:category_under', 'Category Under')}</label>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full h-[46px] border ${isDropdownOpen ? 'border-[#073318] ring-4 ring-[#073318]/5' : 'border-[#E5E7EB] hover:border-gray-300'} rounded-[10px] px-4 flex items-center justify-between cursor-pointer transition-all bg-[#F9FAFB] hover:bg-white`}
                            >
                                <span className={`text-[14px] font-medium ${selectedCategory ? 'text-[#111827]' : 'text-gray-400'}`}>
                                    {selectedCategory ? translateDynamic(selectedCategory, t) : t('common:select_category_under', 'Select category under')}
                                </span>
                                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-[#E5E7EB] rounded-[8px] shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div
                                        onClick={() => {
                                            setSelectedCategory('None');
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`px-3.5 py-2.5 mx-1.5 rounded-[6px] hover:bg-[#F3F4F6] cursor-pointer text-[14px] italic text-gray-500 transition-colors`}
                                    >
                                        {t('common:main_category', 'None (Main Category)')}
                                    </div>
                                    {categories.map((category) => (
                                        <div
                                            key={category}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`px-3.5 py-2.5 mx-1.5 rounded-[8px] hover:bg-gray-50 cursor-pointer text-[14px] transition-colors
                                                ${selectedCategory === category ? 'bg-gray-50 text-[#073318] font-bold' : 'text-[#4B5563] font-medium'}`}
                                        >
                                            {translateDynamic(category, t)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3F4F6]">
                        <button
                            className="px-6 h-[46px] border border-[#E5E7EB] text-[#4B5563] font-bold rounded-[10px] hover:bg-gray-50 hover:text-[#111827] transition-all text-[14px] bg-white shadow-sm"
                            onClick={onClose}
                        >
                            {t('common:cancel', 'Cancel')}
                        </button>
                        <button
                            className="px-10 h-[46px] bg-[#073318] text-white font-bold rounded-[10px] hover:bg-[#04200f] transition-all text-[14px] shadow-md"
                            onClick={onClose}
                        >
                            {t('common:save', 'Save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCategoryModal;
