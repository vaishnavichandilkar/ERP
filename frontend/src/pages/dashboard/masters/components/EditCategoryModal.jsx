import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import categoryService from '../../../../services/masters/categoryService';

const EditCategoryModal = ({ isOpen, onClose, data, onSuccess }) => {
    const { t } = useTranslation(['common', 'modules']);
    const [categoryName, setCategoryName] = useState('');
    const [parentCategory, setParentCategory] = useState(null);
    const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
    const [dropdownCategories, setDropdownCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const parentDropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen && data) {
            setCategoryName(data.name || '');
            fetchDropdownData();
        }
    }, [isOpen, data]);

    const fetchDropdownData = async () => {
        try {
            const dropdownData = await categoryService.getCategoriesDropdown();
            setDropdownCategories(dropdownData || []);
            
            if (data?.type === 'sub_category' && data.under) {
                const parent = dropdownData?.find(c => c.name === data.under);
                if (parent) setParentCategory(parent);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (parentDropdownRef.current && !parentDropdownRef.current.contains(event.target)) {
                setIsParentDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSave = async () => {
        if (!categoryName.trim()) {
            toast.error(t('modules:category_name_required', 'Category name is required'));
            return;
        }

        if (data?.type === 'sub_category' && !parentCategory) {
            toast.error(t('modules:parent_category_required', 'Parent category is required'));
            return;
        }

        setIsLoading(true);
        try {
            if (data.type === 'category') {
                await categoryService.updateCategory(data.id, { name: categoryName });
                toast.success(t('modules:category_updated_successfully', 'Category updated successfully'));
            } else {
                await categoryService.updateSubCategory(data.id, { 
                    name: categoryName, 
                    category_id: parentCategory.id 
                });
                toast.success(t('modules:sub_category_updated_successfully', 'Sub Category updated successfully'));
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-[440px] overflow-hidden transform transition-all duration-300 ease-in-out animate-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-[#F3F4F6]">
                    <h2 className="text-[18px] font-bold text-[#111827] tracking-tight">{t('modules:edit_category')}</h2>
                    <button 
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    {/* Type Display (Read-only as per reference image design) */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-[#4B5563]">{t('common:type')}</label>
                        <div className="w-full h-[46px] border border-[#E5E7EB] rounded-[10px] flex items-center px-4 bg-[#F9FAFB] cursor-not-allowed">
                            <span className="text-[14px] text-[#111827] font-medium">
                                {data?.type === 'category' ? t('modules:category') : t('modules:sub_category')}
                            </span>
                        </div>
                    </div>

                    {/* Category/Subcategory Name Input */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-[#4B5563]">
                            {data?.type === 'category' ? t('modules:category_name') : t('modules:sub_category_name', 'Sub category name')}
                        </label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder={data?.type === 'category' ? t('modules:enter_category_name') : t('modules:enter_sub_category_name', 'Enter sub category name')}
                            className="w-full h-[46px] border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] font-medium outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Parent Category Dropdown (Only for Sub category) */}
                    {data?.type === 'sub_category' && (
                        <div className="space-y-2 relative" ref={parentDropdownRef}>
                            <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:category_under')}</label>
                            <div 
                                className={`w-full h-[46px] border rounded-[10px] flex items-center justify-between px-4 cursor-pointer transition-all ${isParentDropdownOpen ? 'border-[#073318] ring-4 ring-[#073318]/5' : 'border-[#E5E7EB] hover:border-gray-300 bg-white'}`}
                                onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                            >
                                <span className={`text-[14px] ${parentCategory ? 'text-[#111827] font-medium' : 'text-gray-400'}`}>
                                    {parentCategory ? parentCategory.name : t('modules:select_category', 'Select Category')}
                                </span>
                                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isParentDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isParentDropdownOpen && (
                                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#E5E7EB] rounded-[12px] shadow-xl z-[110] py-2 max-h-[160px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    {dropdownCategories.map((cat) => (
                                        <div 
                                            key={cat.id}
                                            className={`px-4 py-3 text-[14px] cursor-pointer transition-colors ${parentCategory?.id === cat.id ? 'bg-[#F9FAFB] text-[#073318] font-bold' : 'text-[#4B5563] hover:bg-gray-50'}`}
                                            onClick={() => {
                                                setParentCategory(cat);
                                                setIsParentDropdownOpen(false);
                                            }}
                                        >
                                            {cat.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-1 h-[48px] bg-[#073318] text-white rounded-[12px] text-[15px] font-bold hover:bg-[#04200f] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#073318]/20 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : t('common:save')}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-[100px] h-[48px] border border-[#E5E7EB] text-[#4B5563] rounded-[12px] text-[15px] font-bold hover:bg-gray-50 transition-all bg-white"
                        >
                            {t('common:exit', 'Exit')}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-in {
                    animation-duration: 300ms;
                    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    animation-fill-mode: forwards;
                }
                .zoom-in-95 {
                    animation-name: zoomIn;
                }
                .fade-in {
                    animation-name: fadeIn;
                }
                .slide-in-from-top-2 {
                    animation-name: slideInTop;
                }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInTop {
                    from { transform: translateY(-8px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default EditCategoryModal;
