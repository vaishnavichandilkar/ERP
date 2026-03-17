import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, Filter, MoreVertical, X, FileText, FileSpreadsheet, Eye, FileEdit, ArrowLeft, ArrowRight, ChevronsUpDown, CheckCircle2, XCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductForm from './components/ProductForm';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import { translateDynamic } from '../../../utils/i18nUtils';

const ProductMaster = () => {
    const { t } = useTranslation(['modules', 'common']);
    const defaultFilters = { uom: '', status: '', productType: '' };
    const [searchQuery, setSearchQuery] = useState('');
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [filterInputs, setFilterInputs] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [currentView, setCurrentView] = useState({ type: 'list', data: null });
    const exportRef = useRef(null);
    const dropdownRef = useRef(null);

    // Generate 100 items for testing pagination (gives 20 pages at 5/page)
    const generateInitialData = () => {
        const data = [];
        for (let i = 1; i <= 100; i++) {
            data.push({
                id: i,
                code: `PRD${i.toString().padStart(3, '0')}`,
                name: i % 2 === 0 ? `Premium Maize Silage ${i}` : `Dairy Cattle Feed ${i}`,
                uom: i % 3 === 0 ? 'Pieces' : 'KG',
                type: 'Goods',
                category: i % 2 === 0 ? 'Silage' : 'Animal Feed',
                subcategory: i % 2 === 0 ? 'Maize Silage' : 'Cattle Feed',
                hsn: `230990${i.toString().padStart(2, '0')}`,
                tax: '5%',
                status: i % 4 === 0 ? 'Inactive' : 'Active'
            });
        }
        return data;
    };
    const [tableData, setTableData] = useState(generateInitialData());

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

    const toggleDropdown = (id, e) => {
        e.stopPropagation();
        setActiveDropdown(activeDropdown === id ? null : id);
    };

    const handleToggleStatus = (id) => {
        setTableData(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' };
            }
            return item;
        }));
        setActiveDropdown(null);
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

    const filteredData = tableData.filter(row => {
        const searchString = `${row.code} ${row.name} ${row.uom} ${row.type} ${row.category} ${row.subcategory} ${row.hsn} ${row.tax} ${row.status}`.toLowerCase();
        const matchesSearch = searchString.includes(searchQuery.toLowerCase());

        const matchesUOM = appliedFilters.uom ? row.uom.toLowerCase() === appliedFilters.uom.toLowerCase() : true;
        const matchesStatus = appliedFilters.status ? row.status.toLowerCase() === appliedFilters.status.toLowerCase() : true;
        const matchesType = appliedFilters.productType ? row.type.toLowerCase() === appliedFilters.productType.toLowerCase() : true;

        return matchesSearch && matchesUOM && matchesStatus && matchesType;
    });

    // Pagination Calculations
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentData = filteredData.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
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

    const handleExportPDF = () => {
        const tableRows = filteredData.map((row, index) => [
            index + 1,
            row.code,
            translateDynamic(row.name, t),
            translateDynamic(row.uom, t),
            translateDynamic(row.type, t),
            translateDynamic(row.category, t),
            row.hsn,
            row.tax,
            row.status.toUpperCase() === 'ACTIVE' ? t('common:active') : t('common:inactive')
        ]);

        exportToPDF(
            'Product Master Report',
            ['#', 'Code', 'Name', 'UOM', 'Type', 'Category', 'HSN Code', 'Tax %', 'Status'],
            tableRows,
            'product-master.pdf'
        );
        setIsExportOpen(false);
    };

    const handleExportExcel = () => {
        const excelData = filteredData.map(row => ({
            [t('product_code')]: row.code,
            [t('product_name')]: translateDynamic(row.name, t),
            [t('uom')]: translateDynamic(row.uom, t),
            [t('product_type')]: translateDynamic(row.type, t),
            [t('category')]: translateDynamic(row.category, t),
            [t('sub_category')]: translateDynamic(row.subcategory, t),
            [t('hsn_code')]: row.hsn,
            [t('tax_percent')]: row.tax,
            [t('common:status')]: row.status.toUpperCase() === 'ACTIVE' ? t('common:active') : t('common:inactive')
        }));

        exportToExcel(excelData, 'Product Master', 'product-master.xlsx');
        setIsExportOpen(false);
    };


    return (
        <div className="flex flex-col relative w-full h-full">
            {/* Conditional Content: Table or Form */}
            {currentView.type === 'list' ? (
                <>
                    <div className="flex flex-col gap-1 mb-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">{t('modules:product_master')}</h1>
                            <button
                                onClick={() => setCurrentView({ type: 'add', data: null })}
                                className="w-full sm:w-auto px-8 h-[44px] bg-[#073318] text-white rounded-[10px] text-[15px] font-bold hover:bg-[#04200f] transition-all shadow-sm flex items-center justify-center"
                            >
                                {t('modules:add_product')}
                            </button>
                        </div>
                        <p className="text-[#6B7280] text-[15px]">{t('modules:product_master_desc') || 'View, verify, and manage all products in your inventory, including HSN codes and tax configurations.'}</p>
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
                                        placeholder="Search by anything..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full h-[42px] bg-white border border-[#E5E7EB] rounded-[10px] pl-10 pr-10 text-[14px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 transition-all placeholder:text-gray-400"
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => {
                                                setSearchQuery('');
                                                setCurrentPage(1);
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className="flex items-center gap-2 px-4 h-[42px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] text-[14px] font-semibold hover:bg-gray-50 transition-all bg-white shadow-sm"
                                >
                                    <Filter size={18} className="text-gray-400" />
                                    {t('common:filter')}
                                </button>
                                <button
                                    className="flex items-center justify-center w-[42px] h-[42px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] hover:bg-gray-50 transition-colors bg-white shadow-sm"
                                    title="Refresh Data"
                                    onClick={() => {
                                        // Logic to refresh data if connected to real API
                                        window.location.reload();
                                    }}
                                >
                                    <RefreshCw size={18} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="relative flex items-center gap-3" ref={exportRef}>
                                <button
                                    onClick={() => setIsExportOpen(!isExportOpen)}
                                    className={`flex items-center justify-center gap-2 px-4 h-[42px] border rounded-[10px] text-[14px] font-semibold transition-all duration-200 bg-white
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
                                    <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6] text-[14px] font-bold text-[#374151]">
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-[#E5E7EB]">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('product_code')} <ChevronsUpDown size={14} className="text-gray-300" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-[#E5E7EB]">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('product_name')} <ChevronsUpDown size={14} className="text-gray-300" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-[#E5E7EB]">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('uom')} <ChevronsUpDown size={14} className="text-gray-300" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-[#E5E7EB]">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('product_type')} <ChevronsUpDown size={14} className="text-gray-300" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-[#E5E7EB]">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('category')} <ChevronsUpDown size={14} className="text-gray-300" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-[#E5E7EB]">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('sub_category')} <ChevronsUpDown size={14} className="text-gray-300" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-[#E5E7EB]">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('hsn_code')} <ChevronsUpDown size={14} className="text-gray-300" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-[#E5E7EB]">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('tax_percent')} <ChevronsUpDown size={14} className="text-gray-300" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap border-r border-[#E5E7EB]">
                                            <div className="flex items-center gap-2 uppercase tracking-tight">{t('common:status')} <ChevronsUpDown size={14} className="text-gray-300" /></div>
                                        </th>
                                        <th className="px-6 py-5 whitespace-nowrap text-center uppercase tracking-tight">{t('common:action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[14px] text-[#111827]">
                                    {currentData.length > 0 ? currentData.map((row, index) => (
                                        <tr key={row.id} className="border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F9FAFB] transition-all group">
                                            <td className="px-6 py-5 font-bold text-[#111827] border-r border-[#F3F4F6]">{row.code}</td>
                                            <td className="px-6 py-5 font-bold text-[#111827] border-r border-[#F3F4F6]">{translateDynamic(row.name, t)}</td>
                                            <td className="px-6 py-5 font-medium text-[#4B5563] border-r border-[#F3F4F6]">{translateDynamic(row.uom, t)}</td>
                                            <td className="px-6 py-5 font-medium text-[#4B5563] border-r border-[#F3F4F6]">{translateDynamic(row.type, t)}</td>
                                            <td className="px-6 py-5 font-medium text-[#4B5563] border-r border-[#F3F4F6]">{translateDynamic(row.category, t)}</td>
                                            <td className="px-6 py-5 font-medium text-[#4B5563] border-r border-[#F3F4F6]">{translateDynamic(row.subcategory, t)}</td>
                                            <td className="px-6 py-5 text-[#6B7280] border-r border-[#F3F4F6]">{row.hsn}</td>
                                            <td className="px-6 py-5 text-[#6B7280] border-r border-[#F3F4F6]">{row.tax}</td>
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
                                                            onClick={() => setCurrentView({ type: 'view', data: row })}
                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622] transition-colors whitespace-nowrap font-bold"
                                                        >
                                                            <Eye size={16} className="text-gray-400" />
                                                            {t('view_product')}
                                                        </button>
                                                        <button
                                                            onClick={() => setCurrentView({ type: 'edit', data: row })}
                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622] transition-colors whitespace-nowrap font-bold"
                                                        >
                                                            <FileEdit size={16} className="text-gray-400" />
                                                            {t('update_product')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(row.id)}
                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622] transition-colors whitespace-nowrap font-bold border-t border-gray-100"
                                                        >
                                                            {row.status.toUpperCase() === 'ACTIVE' ? (
                                                                <>
                                                                    <XCircle size={16} className="text-red-500" />
                                                                    {t('common:inactive')}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 size={16} className="text-[#0A3622]" />
                                                                    {t('common:active')}
                                                                </>
                                                            )}
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
                    <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                                        <option value="KG">KG</option>
                                        <option value="Liters">Liters</option>
                                        <option value="Pieces">Pieces</option>
                                        <option value="Boxes">Boxes</option>
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
                                        <option value="Active">{t('common:active')}</option>
                                        <option value="Inactive">{t('common:inactive')}</option>
                                    </select>
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronsUpDown size={14} />
                                    </div>
                                </div>
                            </div>

                            {/* Product Type Filter */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-[#4B5563]">{t('product_type')}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filterInputs.productType}
                                        onChange={(e) => setFilterInputs({ ...filterInputs, productType: e.target.value })}
                                        placeholder={t('eg_goods')}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#073318] bg-white"
                                    />
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
            ) : (
                <ProductForm
                    mode={currentView.type}
                    initialData={currentView.data}
                    onBack={() => setCurrentView({ type: 'list', data: null })}
                />
            )}
        </div>
    );
};

export default ProductMaster;
