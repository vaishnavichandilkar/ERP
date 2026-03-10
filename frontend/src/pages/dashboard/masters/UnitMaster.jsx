import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, Plus, Filter, MoreVertical, X, FileText, FileSpreadsheet, Eye, FileEdit, ChevronLeft, ChevronRight, ChevronsUpDown, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UnitForm from './components/UnitForm';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';

const UOM_MASTER_LIST = [
    ['BAGS', 'Measure', 'BAG'], ['BALE', 'Measure', 'BAL'], ['BUNDLES', 'Measure', 'BDL'],
    ['BUCKLES', 'Measure', 'BKL'], ['BILLIONS OF UNITS', 'Measure', 'BOU'], ['BOX', 'Measure', 'BOX'],
    ['BOTTLES', 'Measure', 'BTL'], ['BUNCHES', 'Measure', 'BUN'], ['CANS', 'Measure', 'CAN'],
    ['CUBIC METER', 'Volume', 'CBM'], ['CUBIC CENTIMETER', 'Volume', 'CCM'], ['CENTIMETER', 'Length', 'CMS'],
    ['CARTONS', 'Measure', 'CTN'], ['DOZEN', 'Measure', 'DOZ'], ['DRUM', 'Measure', 'DRM'],
    ['GREAT GROSS', 'Measure', 'GGR'], ['GRAMS', 'Weight', 'GMS'], ['GROSS', 'Measure', 'GRS'],
    ['GROSS YARDS', 'Length', 'GYD'], ['KILOGRAMS', 'Weight', 'KGS'], ['KILOLITER', 'Volume', 'KLR'],
    ['KILOMETRE', 'Length', 'KME'], ['MILLILITRE', 'Volume', 'MLT'], ['METERS', 'Length', 'MTR'],
    ['METRIC TONS', 'Weight', 'MTS'], ['NUMBERS', 'Measure', 'NOS'], ['PACKS', 'Measure', 'PAC'],
    ['PIECES', 'Measure', 'PCS'], ['PAIRS', 'Measure', 'PRS'], ['QUINTAL', 'Weight', 'QTL'],
    ['ROLLS', 'Measure', 'ROL'], ['SETS', 'Measure', 'SET'], ['SQUARE FEET', 'Area', 'SQF'],
    ['SQUARE METERS', 'Area', 'SQM'], ['SQUARE YARDS', 'Area', 'SQY'], ['TABLETS', 'Measure', 'TBS'],
    ['TEN GROSS', 'Measure', 'TGM'], ['THOUSANDS', 'Measure', 'THD'], ['TONNES', 'Weight', 'TON'],
    ['TUBES', 'Measure', 'TUB'], ['US GALLONS', 'Volume', 'UGS'], ['UNITS', 'Measure', 'UNT'],
    ['YARDS', 'Length', 'YDS'], ['OTHERS', 'Misc', 'OTH']
];

const UnitMaster = () => {
    const { t } = useTranslation(['common', 'modules']);
    const defaultFilters = { gstUom: '', status: '', unitName: '' };
    const [searchQuery, setSearchQuery] = useState('');
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [filterInputs, setFilterInputs] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [currentView, setCurrentView] = useState({ type: 'list', data: null });
    const exportRef = useRef(null);
    const dropdownRef = useRef(null);

    // Generate 44 items based on the provided Master List
    const generateInitialData = () => {
        return UOM_MASTER_LIST.map((item, index) => ({
            id: index + 1,
            name: item[0],
            gstUom: item[2],
            description: item[1] !== 'Misc' ? `${item[1]} measurement unit` : '',
            status: index % 5 === 0 ? 'Inactive' : 'Active'
        }));
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
        setCurrentPage(1); // Reset to first page
    };

    const handleClearFilter = () => {
        setFilterInputs(defaultFilters);
        setAppliedFilters(defaultFilters);
        setIsFilterOpen(false);
        setCurrentPage(1); // Reset to first page
    };

    const filteredData = tableData.filter(row => {
        const searchString = `${row.name} ${row.gstUom} ${row.description} ${row.status}`.toLowerCase();
        const matchesSearch = searchString.includes(searchQuery.toLowerCase());

        const matchesUOM = appliedFilters.gstUom ? row.gstUom.toLowerCase() === appliedFilters.gstUom.toLowerCase() : true;
        const matchesStatus = appliedFilters.status ? row.status.toLowerCase() === appliedFilters.status.toLowerCase() : true;
        const matchesName = appliedFilters.unitName ? row.name.toLowerCase().includes(appliedFilters.unitName.toLowerCase()) : true;

        return matchesSearch && matchesUOM && matchesStatus && matchesName;
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
            row.name,
            row.gstUom,
            row.description,
            row.status
        ]);

        exportToPDF(
            t('modules:unit_master_report'),
            [t('common:sr_no_short'), t('modules:unit_name'), t('modules:gst_uom'), t('common:description'), t('common:status')],
            tableRows,
            'unit-master.pdf'
        );
        setIsExportOpen(false);
    };

    const handleExportExcel = () => {
        const excelData = filteredData.map((row, index) => ({
            [t('common:sr_no_short')]: index + 1,
            [t('modules:unit_name')]: row.name,
            [t('modules:gst_uom')]: row.gstUom,
            [t('common:description')]: row.description,
            [t('common:status')]: row.status
        }));

        exportToExcel(excelData, t('modules:unit_master'), 'unit-master.xlsx');
        setIsExportOpen(false);
    };

    if (currentView.type !== 'list') {
        return (
            <UnitForm
                mode={currentView.type}
                initialData={currentView.data}
                onBack={() => setCurrentView({ type: 'list', data: null })}
            />
        );
    }

    return (
        <div className="flex flex-col relative w-full h-full">
            {/* Top Action Bar (Add Unit Button) */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setCurrentView({ type: 'add', data: null })}
                    className="w-full sm:w-auto px-6 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    {t('modules:add_unit')}
                </button>
            </div>

            {/* Second Action Bar (Search, Filter, Export) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('common:search_anything')}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full h-[44px] bg-[#F9FAFB]/50 border border-[#E5E7EB] rounded-[8px] pl-10 pr-4 text-[14px] outline-none focus:border-[#014A36] transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-6 h-[44px] border border-[#E5E7EB] rounded-[8px] text-[14px] font-semibold text-[#4B5563] hover:bg-gray-50 transition-all bg-white"
                    >
                        <Filter size={18} className="text-gray-400" />
                        {t('common:filter')}
                    </button>
                </div>

                <div className="relative w-full sm:w-auto" ref={exportRef}>
                    <button
                        onClick={() => setIsExportOpen(!isExportOpen)}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-[44px] border rounded-[8px] text-[14px] font-semibold transition-all duration-200 bg-white
                            ${isExportOpen ? 'border-[#014A36] text-[#014A36]' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                    >
                        <Download size={18} className={isExportOpen ? 'text-[#014A36]' : 'text-gray-400'} />
                        {t('common:export')}
                    </button>

                    {/* Export Dropdown */}
                    {isExportOpen && (
                        <div className="absolute top-full right-0 mt-2 w-[160px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] z-[50] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button onClick={handleExportPDF} className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors">
                                <FileText size={18} className="text-red-500" />
                                {t('common:pdf')}
                            </button>
                            <button onClick={handleExportExcel} className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors">
                                <FileSpreadsheet size={18} className="text-green-600" />
                                {t('common:excel')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col w-full overflow-hidden">
                <div className="overflow-x-auto w-full min-h-[260px]">
                    <table className="w-full min-w-[1000px] text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[13px] font-semibold text-[#6B7280]">
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('common:sr_no')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:unit_name')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:gst_uom')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('common:description')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('common:status')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">{t('common:action')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-[#111827]">
                            {currentData.length > 0 ? currentData.map((row, index) => (
                                <tr key={row.id} className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500">{startIndex + index + 1}.</td>
                                    <td className="px-6 py-4 font-medium">{row.name}</td>
                                    <td className="px-6 py-4">{row.gstUom}</td>
                                    <td className="px-6 py-4">{row.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={row.status === 'Active' ? 'text-[#014A36] font-medium' : 'text-gray-500 font-medium'}>
                                            {row.status === 'Active' ? t('common:active') : t('common:inactive')}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-center relative ${activeDropdown === row.id ? 'z-50' : ''}`}>
                                        <button
                                            onClick={(e) => toggleDropdown(row.id, e)}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {/* Action Dropdown Menu */}
                                        {activeDropdown === row.id && (
                                            <div
                                                ref={dropdownRef}
                                                className={`absolute right-6 w-max min-w-[170px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-[100] py-2 animate-in fade-in duration-200 text-left ${index >= currentData.length - 2 && currentData.length > 2
                                                    ? 'bottom-[80%] mb-1 slide-in-from-bottom-2'
                                                    : 'top-[80%] mt-1 slide-in-from-top-2'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => setCurrentView({ type: 'view', data: row })}
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap font-medium"
                                                >
                                                    <Eye size={16} />
                                                    {t('modules:view_unit')}
                                                </button>
                                                <button
                                                    onClick={() => setCurrentView({ type: 'edit', data: row })}
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap font-medium"
                                                >
                                                    <FileEdit size={16} />
                                                    {t('modules:update_unit')}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(row.id)}
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap font-medium border-t border-gray-100"
                                                >
                                                    {row.status === 'Active' ? (
                                                        <>
                                                            <CheckCircle2 size={16} className="text-gray-500" />
                                                            {t('common:inactive')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 size={16} className="text-[#014A36]" />
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
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        {t('modules:no_units_found')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-white gap-4">
                    <div className="flex items-center gap-3 text-[14px] text-[#4B5563]">
                        <span>{t('common:show')}</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1); // Reset to first page when changing page size
                            }}
                            className="border border-[#E5E7EB] rounded-[6px] px-2 py-1 outline-none focus:border-[#014A36] text-[#111827] bg-white cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>{t('common:per_page')}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[14px]">
                        <span className="text-[#6B7280]">
                            {totalItems > 0 ? `${startIndex + 1}-${endIndex} of ${totalItems}` : '0-0 of 0'}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-1 text-[#9CA3AF] hover:text-[#111827] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1">
                                {getVisiblePages().map((page, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                                        disabled={typeof page !== 'number'}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors
                                            ${page === '...'
                                                ? 'text-[#6B7280] cursor-default bg-transparent'
                                                : currentPage === page
                                                    ? 'bg-[#014A36] text-white'
                                                    : 'text-[#4B5563] hover:bg-gray-100'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-1 text-[#6B7280] hover:text-[#111827] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} />
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
                    <h2 className="text-[18px] font-bold text-[#111827]">{t('modules:apply_filters')}</h2>
                    <button
                        onClick={() => setIsFilterOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 px-6 py-6 overflow-y-auto space-y-6">
                    {/* GST UMO Filter */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:gst_uom')}</label>
                        <div className="relative">
                            <select
                                value={filterInputs.gstUom}
                                onChange={(e) => setFilterInputs({ ...filterInputs, gstUom: e.target.value })}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] pl-4 pr-10 text-[14px] text-[#111827] outline-none focus:border-[#014A36] appearance-none bg-white"
                            >
                                <option value="">{t('common:all')}</option>
                                {UOM_MASTER_LIST.map(uom => (
                                    <option key={uom[2]} value={uom[2]}>{uom[2]}</option>
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
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] pl-4 pr-10 text-[14px] text-[#111827] outline-none focus:border-[#014A36] appearance-none bg-white"
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

                    {/* Unit Name Filter */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:unit_name')}</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={filterInputs.unitName}
                                onChange={(e) => setFilterInputs({ ...filterInputs, unitName: e.target.value })}
                                placeholder={t('common:enter')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-5 border-t border-[#E5E7EB] flex items-center gap-4 bg-white">
                    <button
                        onClick={handleClearFilter}
                        className="flex-1 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors"
                    >
                        {t('common:clear_filter')}
                    </button>
                    <button
                        onClick={handleApplyFilter}
                        className="flex-1 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-colors shadow-sm"
                    >
                        {t('common:apply_filter')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnitMaster;
