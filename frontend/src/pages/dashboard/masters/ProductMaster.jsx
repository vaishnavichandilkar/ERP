import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, Filter, MoreVertical, X, FileText, FileSpreadsheet, Eye, FileEdit, ArrowLeft, ArrowRight, ChevronsUpDown, CheckCircle2, XCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductForm from './components/ProductForm';
import ViewProduct from './components/ViewProduct';
import { translateDynamic } from '../../../utils/i18nUtils';
import SuccessToast from './components/SuccessToast';
import productService from '../../../services/productService';
import toast from 'react-hot-toast';

const ProductMaster = () => {
    const { t } = useTranslation(['modules', 'common']);
    const defaultFilters = { uom: '', status: '', productType: '' };
    const [searchQuery, setSearchQuery] = useState('');
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [filterInputs, setFilterInputs] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const isFilterApplied = Object.values(appliedFilters).some(val => val !== '');
    const [currentView, setCurrentView] = useState({ type: 'list', data: null });
    const [showSuccessToast, setShowSuccessToast] = useState({ show: false, message: '' });
    const exportRef = useRef(null);
    const dropdownRef = useRef(null);

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [uomOptions, setUomOptions] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Handle click outside for export and action dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setIsExportOpen(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: searchQuery || undefined,
                uom_id: appliedFilters.uom || undefined,
                product_type: appliedFilters.productType || undefined,
                status: appliedFilters.status || undefined
            };
            const response = await productService.getProducts(params);
            setTableData(response.products || []);
            setTotalItems(response.total || 0);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error(t('common:error_fetching_data'));
        } finally {
            setLoading(false);
        }
    };

    const fetchUoms = async () => {
        try {
            const data = await productService.getUomsDropdown();
            setUomOptions(data);
        } catch (error) {
            console.error('Error fetching UOMs:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, itemsPerPage, searchQuery, appliedFilters]);

    useEffect(() => {
        fetchUoms();
    }, []);

    const toggleDropdown = (id, e) => {
        e.stopPropagation();
        setActiveDropdown(activeDropdown === id ? null : id);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        setLoading(true);
        try {
            const newStatus = currentStatus.toUpperCase() === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await productService.toggleStatus(id, newStatus);
            toast.success(t('common:status_updated'));
            fetchProducts();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error(t('common:error_updating_status'));
        } finally {
            setLoading(false);
            setActiveDropdown(null);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm(t('common:confirm_delete'))) return;
        setLoading(true);
        try {
            await productService.deleteProduct(id);
            toast.success(t('common:deleted_successfully'));
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error(t('common:error_deleting_data'));
        } finally {
            setLoading(false);
            setActiveDropdown(null);
        }
    };

    const handleApplyFilter = () => {
        setAppliedFilters(filterInputs);
        setIsFilterOpen(false);
        setCurrentPage(1);
    };

    const handleClearFilter = () => {
        setFilterInputs(defaultFilters);
        setAppliedFilters(defaultFilters);
        setIsFilterOpen(false);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentData = tableData;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleRefresh = async () => {
        fetchProducts();
    };

    // Calculate which page numbers to show in the pagination bar (up to 4 pages as requested)
    const getVisiblePages = () => {
        const maxVisible = 4;
        let startPage = Math.max(1, currentPage - 1);
        let endPage = startPage + maxVisible - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            if (i >= 1 && i <= totalPages) {
                pages.push(i);
            }
        }
        return pages;
    };

    const handleExportPDF = async () => {
        setIsExportOpen(false);
        try {
            const params = { format: 'pdf', search: searchQuery || undefined, ...appliedFilters };
            const response = await productService.exportProducts(params);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product-master.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) {
            console.error('Export failed', e);
            toast.error(t('common:export_failed'));
        }
    };

    const handleExportExcel = async () => {
        setIsExportOpen(false);
        try {
            const params = { format: 'xlsx', search: searchQuery || undefined, ...appliedFilters };
            const response = await productService.exportProducts(params);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product-master.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) {
            console.error('Export failed', e);
            toast.error(t('common:export_failed'));
        }
    };


    return (
        <div className="flex flex-col relative w-full h-full">
            {showSuccessToast.show && (
                <SuccessToast
                    message={showSuccessToast.message}
                    onClose={() => setShowSuccessToast({ show: false, message: '' })}
                />
            )}
            {/* Conditional Content: Table or Form */}
            {currentView.type === 'list' ? (
                <>
                    <div className="flex flex-col gap-1 mb-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">{t('modules:product_master')}</h1>
                            <button
                                onClick={() => setCurrentView({ type: 'add', data: null })}
                                className="w-full sm:w-auto px-8 h-[44px] bg-[#073318] text-white rounded-[10px] text-[15px] font-bold hover:bg-[#04200f] transition-all shadow-sm flex items-center justify-center"
                            >
                                {t('modules:add_product')}
                            </button>
                        </div>
                        <p className="text-[#6B7280] text-[15px]">{t('modules:product_master_desc')}</p>
                    </div>

                    {/* Table Area */}
                    <div className="flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full overflow-hidden mb-8">
                        {/* Table Header Section */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-[#F3F4F6]">
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-[320px]">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search By Anything..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full h-[42px] bg-white border border-[#E5E7EB] rounded-[10px] pl-10 pr-10 text-[14px] text-[#111827] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 transition-all placeholder:text-gray-400 shadow-sm"
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => {
                                                setSearchQuery('');
                                                setCurrentPage(1);
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => isFilterApplied ? handleClearFilter() : setIsFilterOpen(true)}
                                    className={`flex items-center gap-2 px-4 h-[42px] border rounded-[10px] text-[14px] font-bold transition-all shadow-sm
                                        ${isFilterApplied 
                                            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                                            : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                                >
                                    <Filter size={18} className={isFilterApplied ? 'text-red-500' : 'text-gray-400'} />
                                    {isFilterApplied ? t('common:clear') : t('common:filter')}
                                </button>
                                <button
                                    className="flex items-center justify-center w-[42px] h-[42px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] hover:bg-gray-50 transition-colors bg-white shadow-sm"
                                    title="Refresh Data"
                                    onClick={handleRefresh}
                                >
                                    <RefreshCw size={18} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="relative flex items-center gap-3" ref={exportRef}>
                                <button
                                    onClick={() => setIsExportOpen(!isExportOpen)}
                                    className={`flex items-center justify-center gap-2 px-4 h-[42px] border rounded-[10px] text-[14px] font-bold transition-all duration-200 bg-white
                                                        ${isExportOpen ? 'border-[#073318] text-[#073318]' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                        >
                            <Download size={18} className={isExportOpen ? 'text-[#073318]' : 'text-gray-400'} />
                            {t('common:export')}
                        </button>

                                {isExportOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-[160px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] z-[50] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button onClick={handleExportPDF} className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622] transition-colors">
                                            <FileText size={18} className="text-red-500" />
                                            {t('common:pdf')}
                                        </button>
                                        <button onClick={handleExportExcel} className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622] transition-colors">
                                            <FileSpreadsheet size={18} className="text-green-600" />
                                            {t('common:excel')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto w-full min-h-[400px]">
                            <table className="w-full min-w-[1200px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-emerald-900 border-b border-emerald-950 text-[14px] font-bold text-white">
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('product_code')} <ChevronsUpDown size={14} className="text-emerald-200/50" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('product_name')} <ChevronsUpDown size={14} className="text-emerald-200/50" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('uom')} <ChevronsUpDown size={14} className="text-emerald-200/50" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('product_type')} <ChevronsUpDown size={14} className="text-emerald-200/50" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('category')} <ChevronsUpDown size={14} className="text-emerald-200/50" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('sub_category')} <ChevronsUpDown size={14} className="text-emerald-200/50" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('hsn_code')} <ChevronsUpDown size={14} className="text-emerald-200/50" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('tax_percent')} <ChevronsUpDown size={14} className="text-emerald-200/50" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('common:status')} <ChevronsUpDown size={14} className="text-emerald-200/50" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap text-center uppercase tracking-tight">{t('common:action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[14px] text-[#111827]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="10" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-10 h-10 border-4 border-[#073318]/10 border-t-[#073318] rounded-full animate-spin"></div>
                                                    <span className="text-gray-400 font-medium">{t('common:loading')}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentData.length > 0 ? currentData.map((row, index) => (
                                        <tr key={row.id} className="border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F9FAFB] transition-all group">
                                            <td className="px-6 py-5 font-bold text-[#111827] border-r border-[#F3F4F6]">{row.product_code}</td>
                                            <td className="px-6 py-5 font-bold text-[#111827] border-r border-[#F3F4F6]">{translateDynamic(row.product_name, t)}</td>
                                            <td className="px-6 py-5 font-medium text-[#4B5563] border-r border-[#F3F4F6]">{translateDynamic(row.uom?.unit_name, t)}</td>
                                            <td className="px-6 py-5 font-medium text-[#4B5563] border-r border-[#F3F4F6]">{translateDynamic(row.product_type, t)}</td>
                                            <td className="px-6 py-5 font-medium text-[#4B5563] border-r border-[#F3F4F6]">{translateDynamic(row.category?.name, t)}</td>
                                            <td className="px-6 py-5 font-medium text-[#4B5563] border-r border-[#F3F4F6]">{translateDynamic(row.sub_category?.name, t)}</td>
                                            <td className="px-6 py-5 text-[#6B7280] border-r border-[#F3F4F6]">{row.hsn_code}</td>
                                            <td className="px-6 py-5 text-[#6B7280] border-r border-[#F3F4F6]">{row.tax_rate}%</td>
                                            <td className="px-6 py-5 border-r border-[#F3F4F6]">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold ${row.status.toUpperCase() === 'ACTIVE' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${row.status.toUpperCase() === 'ACTIVE' ? 'bg-[#059669]' : 'bg-[#DC2626]'}`}></span>
                                                    {row.status.toUpperCase() === 'ACTIVE' ? t('common:active') : t('common:inactive')}
                                                </div>
                                            </td>
                                            <td className={`px-6 py-5 text-center relative ${activeDropdown === row.id ? 'z-50' : ''}`}>
                                                <button
                                                    onClick={(e) => toggleDropdown(row.id, e)}
                                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {activeDropdown === row.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className={`absolute right-6 w-max min-w-[190px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-[100] py-2 animate-in fade-in duration-200 text-left ${index >= currentData.length - 2 && currentData.length > 2
                                                            ? 'bottom-[80%] mb-1 slide-in-from-bottom-2'
                                                            : 'top-[80%] mt-1 slide-in-from-top-2'
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCurrentView({ type: 'view', data: row });
                                                                setActiveDropdown(null);
                                                            }}
                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622] transition-colors whitespace-nowrap font-bold"
                                                        >
                                                            <Eye size={16} className="text-gray-400" />
                                                            {t('modules:view_and_edit_product')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(row.id, row.status)}
                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622] transition-colors whitespace-nowrap font-bold border-t border-gray-100"
                                                        >
                                                            <CheckCircle2 size={16} className={row.status.toUpperCase() === 'ACTIVE' ? "text-gray-400" : "text-[#0A3622]"} />
                                                            {row.status.toUpperCase() === 'ACTIVE' ? t('common:inactive') : t('common:active')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(row.id)}
                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-red-600 hover:bg-[#FEF2F2] transition-colors whitespace-nowrap font-bold border-t border-gray-100"
                                                        >
                                                            <XCircle size={16} className="text-red-400" />
                                                            {t('common:delete') || 'Delete'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="10" className="px-6 py-20 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <span className="font-medium">{t('no_products_found')}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t border-[#F3F4F6] bg-white gap-4">
                            <div className="flex items-center gap-3 text-[14px] text-[#6B7280] font-medium">
                                <span>{t('common:show')}</span>
                                <div className="relative group">
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="appearance-none border border-[#E5E7EB] rounded-[8px] pl-3 pr-8 py-1.5 outline-none focus:border-[#073318] text-[#111827] bg-[#F9FAFB] cursor-pointer font-bold transition-all hover:bg-white"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-[#073318]" />
                                </div>
                                <span>{t('common:per_page')}</span>
                            </div>

                            <div className="flex items-center gap-6">
                                <span className="text-[#6B7280] text-[14px] font-medium">
                                    {totalItems > 0 ? `${startIndex + 1}–${endIndex} of ${totalItems}` : `0-0 of 0`}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-[10px]"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                        {getVisiblePages().map((page, index) => (
                                            <button
                                                key={index}
                                                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                                                className={`w-10 h-10 rounded-[10px] flex items-center justify-center transition-all text-[14px] font-bold
                                                    ${currentPage === page
                                                        ? 'bg-[#F9FAFB] text-[#111827] shadow-sm'
                                                        : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-[10px]"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Sidebar Overlay */}
                    {isFilterOpen && (
                        <div
                            className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-[2px] transition-all duration-300 ease-in-out"
                            onClick={() => setIsFilterOpen(false)}
                        />
                    )}

                    {/* Filter Sidebar Offcanvas */}
                    <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
                            <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">{t('apply_filters')}</h2>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#111827] hover:bg-gray-100 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 px-6 py-6 overflow-y-auto space-y-6">
                            {/* UOM Filter */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-[#4B5563]">{t('uom')}</label>
                                <div className="relative">
                                    <select
                                        value={filterInputs.uom}
                                        onChange={(e) => setFilterInputs({ ...filterInputs, uom: e.target.value })}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] pl-4 pr-10 text-[14px] text-[#111827] outline-none focus:border-[#073318] appearance-none bg-white"
                                    >
                                        <option value="">{t('common:all')}</option>
                                        {uomOptions.map(uom => (
                                            <option key={uom.id} value={uom.id}>{translateDynamic(uom.unit_name, t)}</option>
                                        ))}
                                    </select>
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronsUpDown size={14} />
                                    </div>
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-[#4B5563]">{t('common:status')}</label>
                                <div className="relative">
                                    <select
                                        value={filterInputs.status}
                                        onChange={(e) => setFilterInputs({ ...filterInputs, status: e.target.value })}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] pl-4 pr-10 text-[14px] text-[#111827] outline-none focus:border-[#073318] appearance-none bg-white"
                                    >
                                        <option value="">{t('common:all')}</option>
                                        <option value="ACTIVE">{t('common:active')}</option>
                                        <option value="INACTIVE">{t('common:inactive')}</option>
                                    </select>
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronsUpDown size={14} />
                                    </div>
                                </div>
                            </div>

                            {/* Product Type Filter */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-[#4B5563]">{t('product_type')}</label>
                                    <select
                                        value={filterInputs.productType}
                                        onChange={(e) => setFilterInputs({ ...filterInputs, productType: e.target.value })}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] pl-4 pr-10 text-[14px] text-[#111827] outline-none focus:border-[#073318] appearance-none bg-white"
                                    >
                                        <option value="">{t('common:all')}</option>
                                        <option value="GOODS">{t('modules:goods') || 'Goods'}</option>
                                        <option value="SERVICES">{t('modules:services') || 'Services'}</option>
                                    </select>
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronsUpDown size={14} />
                                    </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-8 py-6 border-t border-[#E5E7EB] flex items-center gap-4 bg-white">
                            <button
                                onClick={handleClearFilter}
                                className="flex-1 h-[48px] border border-[#E5E7EB] rounded-[10px] text-[15px] font-bold text-[#4B5563] hover:bg-gray-50 hover:text-[#111827] transition-all bg-white"
                            >
                                {t('common:clear_filter')}
                            </button>
                            <button
                                onClick={handleApplyFilter}
                                className="flex-1 h-[48px] bg-[#073318] text-white rounded-[10px] text-[15px] font-bold hover:bg-[#04200f] transition-all shadow-md"
                            >
                                {t('common:apply_filter') || 'Apply Filter'}
                            </button>
                        </div>
                    </div>
                </>
            ) : currentView.type === 'view' ? (
                <ViewProduct
                    initialData={currentView.data}
                    onBack={() => setCurrentView({ type: 'list', data: null })}
                    onEdit={(data) => setCurrentView({ type: 'edit', data })}
                />
            ) : (
                <ProductForm
                    mode={currentView.type}
                    initialData={currentView.data}
                    onBack={() => setCurrentView({ type: 'list', data: null })}
                    onEdit={(data) => setCurrentView({ type: 'edit', data })}
                    onSuccess={() => {
                        const msg = currentView.type === 'add' ? 'Product added successfully' : 'Product updated successfully';
                        setShowSuccessToast({ show: true, message: msg });
                        setCurrentView({ type: 'list', data: null });
                        fetchProducts();
                    }}
                />
            )}
        </div>
    );
};

export default ProductMaster;
