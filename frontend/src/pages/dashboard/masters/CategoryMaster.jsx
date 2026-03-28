import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Download, Upload, Filter, Plus, Minus, FileText, FileSpreadsheet, Maximize2, Minimize2, MoreVertical, CheckCircle2, XCircle, RefreshCw, ChevronDown, X, Eye, ChevronsUpDown, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CategoryForm from './components/CategoryForm';
import ImportModal from './components/ImportModal';
import categoryService from '../../../services/masters/categoryService';
import { translateDynamic } from '../../../utils/i18nUtils';
import toast from 'react-hot-toast';
import SuccessToast from './components/SuccessToast';

const CategoryMaster = () => {
    const { t } = useTranslation(['modules', 'common']);
    const [currentView, setCurrentView] = useState({ type: 'list', data: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({});
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const exportRef = useRef(null);
    const [activeRowDropdown, setActiveRowDropdown] = useState(null);
    const [toastMessage, setToastMessage] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToastMessage({ show: true, message, type });
        setTimeout(() => setToastMessage({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await categoryService.getCategories();
            if (response.success) {
                // Backend returns nested structure: [{id, name, status, items: [{id, name, status}]}]
                setCategories(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories', err);
            showToast(t('common:error_fetching_data'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setIsExportOpen(false);
            }
            if (!event.target.closest('.dropdown-trigger') && !event.target.closest('.dropdown-menu')) {
                setActiveRowDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCategory = (id) => {
        setExpandedCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const isAllExpanded = categories.length > 0 && categories.every(cat => expandedCategories[cat.id]);
    const toggleExpandAll = () => {
        if (isAllExpanded) {
            setExpandedCategories({});
        } else {
            const newExpanded = {};
            categories.forEach(cat => newExpanded[cat.id] = true);
            setExpandedCategories(newExpanded);
        }
    };

    const handleToggleStatus = async (id, currentStatus, type) => {
        const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setActiveRowDropdown(null);
        try {
            let response;
            if (type === 'category') {
                response = await categoryService.toggleCategoryStatus(id, nextStatus);
            } else {
                response = await categoryService.toggleSubCategoryStatus(id, nextStatus);
            }
            
            if (response.success) {
                showToast(`${type === 'category' ? 'Category' : 'Sub-category'} ${nextStatus.toLowerCase()}d successfully`);
                fetchCategories();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleExportPDF = async () => {
        setIsExportOpen(false);
        try {
            const response = await categoryService.exportCategories('pdf');
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `category_master_${new Date().getTime()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) {
            console.error('Export failed', e);
            showToast('Export failed', 'error');
        }
    };

    const handleExportExcel = async () => {
        setIsExportOpen(false);
        try {
            const response = await categoryService.exportCategories('xlsx');
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `category_master_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) {
            console.error('Export failed', e);
            showToast('Export failed', 'error');
        }
    };

    const handleImportExcel = async (formData) => {
        const loadingToast = toast.loading(t('common:importing'), { id: 'import-toast' });
        try {
            await categoryService.importCategories(formData);
            toast.dismiss('import-toast');
            showToast(t('common:import_success'), 'success');
            fetchCategories();
            return Promise.resolve();
        } catch (error) {
            toast.dismiss('import-toast');
            showToast(error?.response?.data?.message || t('common:import_failed'), 'error');
            return Promise.reject(error);
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDeactivate = async () => {
        if (selectedItems.length === 0) return;
        try {
            // Simplified bulk logic - deactivate one by one or bulk endpoint if exists
            // Since we don't have a bulk endpoint in categoryService.js yet, we can't easily do it efficiently
            // For now, let's just show a toast that this feature is coming or use a loop
            showToast('Bulk action not implemented yet', 'info');
        } catch (err) {
            showToast('Bulk deactivation failed', 'error');
        }
    };

    const filteredData = useMemo(() => {
        if (!searchQuery) return categories;
        const q = searchQuery.toLowerCase();
        return categories.filter(cat => {
            const catMatches = cat.name.toLowerCase().includes(q);
            const subMatches = cat.items && cat.items.some(sub => sub.name.toLowerCase().includes(q));
            return catMatches || subMatches;
        }).map(cat => {
            // If searching, auto-expand categories that have matching subcategories
            if (cat.items && cat.items.some(sub => sub.name.toLowerCase().includes(q))) {
                setExpandedCategories(prev => ({ ...prev, [cat.id]: true }));
            }
            return cat;
        });
    }, [categories, searchQuery]);

    const renderRow = (item, type, depth = 0, index = 0, siblingsLength = 0, parentId = null) => {
        const isExpanded = expandedCategories[item.id];
        const hasChildren = type === 'category' && item.items && item.items.length > 0;
        const dropdownId = `${type}-${item.id}`;

        return (
            <React.Fragment key={item.id}>
                <div className={`flex items-center justify-between py-4 border-b border-[#F3F4F6] transition-all duration-200 group-row
                    ${depth === 0 ? 'bg-[#F9FAFB]/50' : 'bg-white'} hover:bg-gray-50`}>
                    
                    <div className="flex items-center flex-1 cursor-pointer select-none gap-3"
                         style={{ paddingLeft: `${depth === 0 ? 36 : 36 + depth * 28}px` }}
                         onClick={() => hasChildren && toggleCategory(item.id)}>
                        
                        <div className="w-6 h-6 flex items-center justify-center">
                            {hasChildren ? (
                                <div className={`p-0.5 rounded transition-colors duration-200 ${isExpanded ? 'bg-red-50 text-red-600' : 'bg-[#073318]/5 text-[#111827]'}`}>
                                    {isExpanded ? <Minus size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                                </div>
                            ) : (
                                <div className="w-1.5 h-1.5 bg-[#4B5563] rounded-full ml-0.5" />
                            )}
                        </div>

                        <div className="flex flex-col">
                            <span className={`text-[14px] transition-colors ${depth === 0 ? 'font-bold text-[#111827]' : 'font-medium text-[#374151]'} ${item.status === 'INACTIVE' ? 'text-gray-400' : ''}`}>
                                {translateDynamic(item.name, t)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-stretch shrink-0">
                        <div className="w-[120px] flex items-center justify-center px-4">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold ${item.status === 'INACTIVE' ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#ECFDF5] text-[#059669]'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'INACTIVE' ? 'bg-[#DC2626]' : 'bg-[#059669]'}`}></span>
                                {item.status === 'INACTIVE' ? t('common:inactive') : t('common:active')}
                            </div>
                        </div>

                        <div className="w-20 flex items-center justify-center px-4 relative">
                            <button
                                data-dropdown-btn="true"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveRowDropdown(activeRowDropdown === dropdownId ? null : dropdownId);
                                }}
                                className={`p-1.5 rounded-md transition-all duration-200 dropdown-trigger
                                    ${activeRowDropdown === dropdownId ? 'bg-gray-100 text-[#111827]' : 'text-gray-400 hover:text-[#073318] hover:bg-white border border-transparent'}`}
                            >
                                <MoreVertical size={18} />
                            </button>

                            {activeRowDropdown === dropdownId && (
                                <div className={`absolute right-[80%] w-max min-w-[200px] bg-white border border-gray-100 rounded-[14px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] z-[110] py-2 animate-in zoom-in-95 duration-200 dropdown-menu text-left
                                    ${index >= siblingsLength - 1 && siblingsLength > 1 ? 'bottom-0 mb-2' : 'top-0 mt-2'}`}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentView({
                                                type: 'form',
                                                mode: 'edit',
                                                data: type === 'category' 
                                                    ? { id: item.id, name: item.name, type: 'category' }
                                                    : { id: item.id, name: item.name, type: 'sub_category', parentCategoryId: parentId }
                                            });
                                            setActiveRowDropdown(null);
                                        }}
                                        className="w-full px-5 py-3 flex items-center gap-3 text-[14px] font-bold text-gray-700 hover:bg-[#F9FAFB] hover:text-[#073318] transition-colors whitespace-nowrap"
                                    >
                                        <Edit size={18} className="text-[#073318]" />
                                        {t('modules:view_and_edit_category')}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(item.id, item.status, type); }}
                                        className="w-full px-5 py-3 flex items-center gap-3 text-[14px] font-bold text-gray-700 hover:bg-[#F9FAFB] hover:text-[#073318] transition-colors whitespace-nowrap"
                                    >
                                        {item.status === 'INACTIVE' ? <CheckCircle2 size={18} className="text-[#073318]" /> : <XCircle size={18} className="text-gray-400" />}
                                        {item.status === 'INACTIVE' ? t('common:active') : t('common:inactive')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        {item.items.map((sub, idx) => renderRow(sub, 'sub_category', depth + 1, idx, item.items.length, item.id))}
                    </div>
                )}
            </React.Fragment>
        );
    };

    if (currentView.type === 'form') {
        return (
            <CategoryForm
                mode={currentView.mode}
                initialData={currentView.data}
                onBack={() => setCurrentView({ type: 'list', data: null })}
                onSuccess={() => {
                    fetchCategories();
                    setCurrentView({ type: 'list', data: null });
                    showToast(currentView.mode === 'add' ? 'Category added successfully' : 'Category updated successfully');
                }}
            />
        );
    }

    return (
        <div className="flex flex-col animate-in fade-in duration-500 relative font-['Plus_Jakarta_Sans']">
            <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">{t('modules:category_master')}</h1>
                    <button
                        onClick={() => setCurrentView({ type: 'form', mode: 'add', data: { type: 'category' } })}
                        className="px-6 h-[44px] bg-[#073318] text-white rounded-[10px] text-[15px] font-bold hover:bg-[#04200f] transition-all shadow-sm flex items-center justify-center"
                    >
                        {t('modules:add_category')}
                    </button>
                </div>
                <p className="text-[#6B7280] text-[15px]">{t('modules:category_master_desc')}</p>
            </div>

            <div className={`master-table-container ${activeRowDropdown ? '!overflow-visible' : ''}`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-[#F3F4F6] bg-white text-[#111827]">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={t('common:search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-[42px] bg-white border border-[#E5E7EB] rounded-[10px] pl-10 pr-10 text-[14px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 transition-all placeholder:text-gray-400 shadow-sm"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={toggleExpandAll}
                            className="flex items-center gap-2 px-4 h-[42px] border border-[#E5E7EB] rounded-[10px] text-[14px] font-bold text-[#4B5563] hover:bg-gray-50 bg-white shadow-sm"
                        >
                            {isAllExpanded ? <Minimize2 size={16} className="text-gray-400" /> : <Maximize2 size={16} className="text-gray-400" />}
                            {isAllExpanded ? t('common:collapse_all') : t('common:expand_all')}
                        </button>
                        <button
                            onClick={() => { fetchCategories(); showToast("Data refreshed successfully"); }}
                            className="flex items-center justify-center w-[42px] h-[42px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] hover:bg-gray-50 bg-white shadow-sm"
                        >
                            <RefreshCw size={18} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="relative flex items-center gap-3" ref={exportRef}>
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 h-[42px] border border-[#E5E7EB] rounded-[10px] text-[14px] font-bold text-[#4B5563] hover:bg-gray-50 bg-white shadow-sm"
                        >
                            <Upload size={18} className="text-gray-400" />
                            {t('common:import')}
                        </button>
                        <ImportModal
                            isOpen={isImportModalOpen}
                            onClose={() => setIsImportModalOpen(false)}
                            onImport={handleImportExcel}
                            sampleFileName="Category_Master_Sample.xlsx"
                            sampleHeaders={['Level', 'Category Name', 'Parent Category', 'Status']}
                        />

                        <button
                            onClick={() => setIsExportOpen(!isExportOpen)}
                            className={`flex items-center justify-center gap-2 px-4 h-[42px] border rounded-[10px] text-[14px] font-bold transition-all bg-white
                                ${isExportOpen ? 'border-[#073318] text-[#073318]' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                        >
                            <Download size={18} className={isExportOpen ? 'text-[#073318]' : 'text-gray-400'} />
                            {t('common:export')}
                        </button>

                        {isExportOpen && (
                            <div className="absolute top-full right-0 mt-2 w-[160px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] z-[50] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button onClick={handleExportPDF} className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#073318]">
                                    <FileText size={18} className="text-red-500" />
                                    {t('common:pdf')}
                                </button>
                                <button onClick={handleExportExcel} className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#073318]">
                                    <FileSpreadsheet size={18} className="text-green-600" />
                                    {t('common:excel')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="min-w-full overflow-x-auto overflow-y-hidden">
                    <div className="flex items-stretch justify-between bg-emerald-900 border-b border-emerald-950 text-[14px] font-bold text-white uppercase tracking-tight">
                        <div className="flex-1 border-r border-white/50 pr-6 py-5 pl-9 flex items-center gap-2">
                            {t('modules:category_master')}
                            <ChevronsUpDown size={14} className="text-gray-300" />
                        </div>
                        <div className="flex items-stretch shrink-0">
                            <div className="w-[120px] border-r border-white/50 flex items-center justify-center px-4 gap-2">
                                {t('common:status')}
                                <ChevronsUpDown size={14} className="text-gray-300" />
                            </div>
                            <div className="w-20 flex items-center justify-center px-4 py-5">{t('common:action')}</div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col divide-y divide-[#F3F4F6]">
                        {isLoading ? (
                            <div className="p-16 text-center">
                                <div className="inline-block w-8 h-8 border-2 border-[#073318] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[#6B7280] text-[14px] font-medium">{t('common:loading')}</p>
                            </div>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((cat, idx) => renderRow(cat, 'category', 0, idx, filteredData.length))
                        ) : (
                            <div className="p-16 text-center">
                                <Search size={40} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 text-[15px] font-medium">{t('common:no_data')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {toastMessage.show && (
                <SuccessToast
                    message={toastMessage.message}
                    type={toastMessage.type}
                    onClose={() => setToastMessage({ ...toastMessage, show: false })}
                />
            )}
        </div>
    );
};

export default CategoryMaster;
