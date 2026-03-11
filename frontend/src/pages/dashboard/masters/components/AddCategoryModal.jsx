import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
                <div className="flex items-center justify-between p-5 border-b border-[#F3F4F6]">
                    <h2 className="text-[15px] font-bold text-[#111827]">{t('modules:add_category', 'Add Category')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-6">
                    {/* Category Input */}
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-[#4B5563]">{t('common:category', 'Category Name')}</label>
                        <input
                            type="text"
                            placeholder={t('common:enter_category_name', 'Enter category name')}
                            className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-3.5 outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all placeholder:text-[#9CA3AF] text-[14px] text-[#111827]"
                        />
                    </div>

                    {/* Category Under Dropdown */}
                    <div className="space-y-1.5 pb-2">
                        <label className="text-[13px] font-medium text-[#4B5563]">{t('common:category_under', 'Category Under')}</label>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full h-[44px] border ${isDropdownOpen ? 'border-[#014A36] ring-1 ring-[#014A36]/10' : 'border-[#E5E7EB] hover:border-gray-300'} rounded-[8px] px-3.5 flex items-center justify-between cursor-pointer transition-all bg-white`}
                            >
                                <span className={`text-[14px] ${selectedCategory ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                                    {selectedCategory || t('common:select_category_under', 'Select category under')}
                                </span>
                                <ChevronDown size={18} className={`text-[#6B7280] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
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
                                        None (Main Category)
                                    </div>
                                    {categories.map((category) => (
                                        <div
                                            key={category}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`px-3.5 py-2.5 mx-1.5 rounded-[6px] hover:bg-[#F3F4F6] cursor-pointer text-[14px] transition-colors
                                                ${selectedCategory === category ? 'bg-[#F3F4F6] text-[#014A36] font-medium' : 'text-[#4B5563]'}`}
                                        >
                                            {category}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button
                            className="px-10 h-[44px] bg-[#014A36] text-white font-semibold rounded-[8px] hover:bg-[#013b2b] transition-colors text-[14px]"
                            onClick={onClose}
                        >
                            {t('common:save', 'Save')}
                        </button>
                        <button
                            className="px-6 h-[44px] border border-[#E5E7EB] text-[#4B5563] font-semibold rounded-[8px] hover:bg-gray-50 transition-colors text-[14px]"
                            onClick={onClose}
                        >
                            {t('common:exit', 'Exit')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCategoryModal;
