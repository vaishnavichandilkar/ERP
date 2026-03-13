import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, Plus, Filter, MoreVertical, X, FileText, FileSpreadsheet, Eye, FileEdit, ArrowLeft, ArrowRight, ChevronsUpDown, CheckCircle2, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UnitForm from './components/UnitForm';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import unitService from '../../../services/masters/unitService';
import { toast } from '../../../utils/toast-mock';

const SuccessToast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-[#014A36] text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3 min-w-[280px] justify-center">
                <CheckCircle2 size={18} className="text-white" />
                <span className="text-[14px] font-medium">{message}</span>
            </div>
        </div>
    );
};

const UnitMaster = () => {
    const { t } = useTranslation(['modules', 'common']);
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

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [gstUomOptions, setGstUomOptions] = useState([]);
    const [showSuccessToast, setShowSuccessToast] = useState({ show: false, message: '' });
    const [isFilterApplied, setIsFilterApplied] = useState(false);

    const triggerSuccess = (message) => {
        setShowSuccessToast({ show: true, message });
    };

    const fetchUnits = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: searchQuery,
                status: appliedFilters.status || undefined,
                gst_uom: appliedFilters.gstUom || undefined,
                unit_name: appliedFilters.unitName || undefined
            };
            const response = await unitService.getUnits(params);
            setTableData(response.data || []);
            setTotalItems(response.meta?.total || 0);
        } catch (error) {
            console.error('Error fetching units:', error);
            toast.error(t('common:error_fetching_data'));
        } finally {
            setLoading(false);
        }
    };

    const fetchGstUomList = async () => {
        try {
            // Fetch names for filter dropdown - we can use unit-library or similar if needed
            // For now, let's just get the unit categories for the filter
            const response = await unitService.getUnitNames();
            setGstUomOptions(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, [currentPage, itemsPerPage, searchQuery, appliedFilters]);

    useEffect(() => {
        fetchGstUomList();
    }, []);

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

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await unitService.updateUnitStatus(id, newStatus);
            const actionMsg = newStatus === 'ACTIVE' ? 'activated' : 'deactivated';
            triggerSuccess(`Unit ${actionMsg} successfully`);
            fetchUnits();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(t('common:error_updating_status'));
        }
        setActiveDropdown(null);
    };

    const handleApplyFilter = () => {
        setAppliedFilters(filterInputs);
        // Check if any filter is actually selected
        const hasFilters = filterInputs.unitName || filterInputs.status || filterInputs.gstUom;
        setIsFilterApplied(!!hasFilters);
        setIsFilterOpen(false);
        setCurrentPage(1);
    };

    const handleClearFilter = () => {
        setFilterInputs(defaultFilters);
        setAppliedFilters(defaultFilters);
        setSearchQuery('');
        setIsFilterApplied(false);
        setIsFilterOpen(false);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

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
        const tableRows = tableData.map((row, index) => [
            startIndex + index + 1,
            row.unit_name,
            row.gst_uom,
            row.full_name_of_measurement || '-',
            row.status
        ]);

        exportToPDF(
            'Unit Master Report',
            ['Sr.No', 'Unit Name', 'GST UOM', 'Full Name of Measurement', 'Status'],
            tableRows,
            'unit-master.pdf'
        );
        setIsExportOpen(false);
    };

    const handleExportExcel = () => {
        const excelData = tableData.map((row, index) => ({
            'Sr.No': startIndex + index + 1,
            'Unit Name': row.unit_name,
            'GST UOM': row.gst_uom,
            'Full Name of Measurement': row.full_name_of_measurement || '-',
            'Status': row.status
        }));

        exportToExcel(excelData, 'Unit Master', 'unit-master.xlsx');
        setIsExportOpen(false);
    };

    return (
        <div className="flex flex-col relative w-full h-full">
            {showSuccessToast.show && (
                <SuccessToast 
                    message={showSuccessToast.message} 
                    onClose={() => setShowSuccessToast({ show: false, message: '' })} 
                />
            )}
            {currentView.type === 'list' ? (
                <>
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setCurrentView({ type: 'add', data: null })}
                            className="w-full sm:w-auto px-6 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            {t('add_unit')}
                        </button>
                    </div>

                    <div className="flex flex-col bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm w-full mb-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-[#E5E7EB] bg-white">
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
                                        className="w-full h-[40px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] pl-10 pr-4 text-[14px] outline-none focus:border-[#014A36] transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => isFilterApplied || searchQuery ? handleClearFilter() : setIsFilterOpen(true)}
                                    className={`flex items-center gap-2 px-6 h-[40px] border rounded-[8px] text-[14px] font-medium transition-all shadow-sm
                                        ${isFilterApplied || searchQuery 
                                            ? 'bg-[#014A36] border-[#014A36] text-white hover:bg-[#013b2b]' 
                                            : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                                >
                                    {isFilterApplied || searchQuery ? (
                                        <>
                                            <X size={18} className="text-white" />
                                            Clear Filter
                                        </>
                                    ) : (
                                        <>
                                            <Filter size={18} className="text-gray-400" />
                                            {t('common:filter')}
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="relative w-full sm:w-auto" ref={exportRef}>
                                <button
                                    onClick={() => setIsExportOpen(!isExportOpen)}
                                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-[40px] border rounded-[8px] text-[14px] font-medium transition-all duration-200 bg-white
                                        ${isExportOpen ? 'border-[#014A36] text-[#014A36]' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                                >
                                    <Download size={18} className={isExportOpen ? 'text-[#014A36]' : 'text-gray-400'} />
                                    {t('common:export')}
                                </button>

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

                        <div className="overflow-x-auto w-full min-h-[260px]">
                            <table className="w-full min-w-[1000px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[13px] font-semibold text-[#6B7280]">
                                        <th className="px-6 py-4 whitespace-nowrap">{t('common:sr_no')}</th>
                                        <th className="px-6 py-4 whitespace-nowrap">{t('unit_name')}</th>
                                        <th className="px-6 py-4 whitespace-nowrap">{t('gst_uom')}</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Full Name of Measurement</th>
                                        <th className="px-6 py-4 whitespace-nowrap">{t('common:status')}</th>
                                        <th className="px-6 py-4 whitespace-nowrap text-center">{t('common:action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[14px] text-[#111827]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-8 h-8 border-4 border-[#014A36]/20 border-t-[#014A36] rounded-full animate-spin"></div>
                                                    <span>{t('common:loading')}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : tableData.length > 0 ? tableData.map((row, index) => (
                                        <tr key={row.id} className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500">{startIndex + index + 1}.</td>
                                            <td className="px-6 py-4 font-medium">{row.unit_name}</td>
                                            <td className="px-6 py-4">{row.gst_uom}</td>
                                            <td className="px-6 py-4">{row.full_name_of_measurement || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[12px] font-medium ${row.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-center relative ${activeDropdown === row.id ? 'z-50' : ''}`}>
                                                <button
                                                    onClick={(e) => toggleDropdown(row.id, e)}
                                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {activeDropdown === row.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className={`absolute right-6 w-max min-w-[170px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-[100] py-2 animate-in fade-in duration-200 text-left ${index >= tableData.length - 2 && tableData.length > 2
                                                            ? 'bottom-[80%] mb-1 slide-in-from-bottom-2'
                                                            : 'top-[80%] mt-1 slide-in-from-top-2'
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveDropdown(null);
                                                                setCurrentView({ type: 'view', data: row });
                                                            }}
                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap font-medium"
                                                        >
                                                            <Eye size={16} />
                                                            {t('view_unit')}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveDropdown(null);
                                                                setCurrentView({ type: 'edit', data: row });
                                                            }}
                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap font-medium"
                                                        >
                                                            <FileEdit size={16} />
                                                            {t('update_unit') || t('common:update')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(row.id, row.status)}
                                                            className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap font-medium border-t border-gray-100"
                                                        >
                                                            {row.status === 'ACTIVE' ? (
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
                                                {t('no_units_found')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-white gap-4">
                            <div className="flex items-center gap-3 text-[14px] text-[#4B5563]">
                                <span>{t('common:show')}</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
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
                                    {totalItems > 0 ? `${startIndex + 1}-${endIndex} ${t('common:of')} ${totalItems}` : `0-0 ${t('common:of')} 0`}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-1.5 text-[#6B7280] hover:text-[#111827] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div className="flex items-center gap-1 px-2">
                                        {getVisiblePages().map((page, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handlePageChange(page)}
                                                className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors text-[14px]
                                                    ${currentPage === page
                                                        ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                                                        : 'text-[#6B7280] font-medium hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="p-1.5 text-[#6B7280] hover:text-[#111827] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isFilterOpen && (
                        <div
                            className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-[2px] transition-all duration-300 ease-in-out"
                            onClick={() => setIsFilterOpen(false)}
                        />
                    )}

                    <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
                            <h2 className="text-[18px] font-bold text-[#111827]">{t('apply_filters')}</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 px-6 py-6 overflow-y-auto space-y-6">
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-[#4B5563]">{t('unit_name')}</label>
                                <div className="relative">
                                    <select
                                        value={filterInputs.unitName}
                                        onChange={(e) => setFilterInputs({ ...filterInputs, unitName: e.target.value })}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] pl-4 pr-10 text-[14px] text-[#111827] outline-none focus:border-[#014A36] appearance-none bg-white"
                                    >
                                        <option value="">{t('common:all')}</option>
                                        {gstUomOptions.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronsUpDown size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-[#4B5563]">{t('common:status')}</label>
                                <div className="relative">
                                    <select
                                        value={filterInputs.status}
                                        onChange={(e) => setFilterInputs({ ...filterInputs, status: e.target.value })}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] pl-4 pr-10 text-[14px] text-[#111827] outline-none focus:border-[#014A36] appearance-none bg-white"
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
                        </div>

                        <div className="px-6 py-5 border-t border-[#E5E7EB] flex items-center gap-4 bg-white">
                            <button
                                onClick={handleClearFilter}
                                className="flex-1 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <X size={18} />
                                Clear Filter
                            </button>
                            <button
                                onClick={handleApplyFilter}
                                className="flex-1 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-colors shadow-sm"
                            >
                                {t('apply_filter')}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <UnitForm
                    mode={currentView.type}
                    initialData={currentView.data}
                    onBack={() => setCurrentView({ type: 'list', data: null })}
                    onSuccess={() => {
                        const message = currentView.type === 'add' ? 'Unit added successfully' : 'Unit updated successfully';
                        setCurrentView({ type: 'list', data: null });
                        triggerSuccess(message);
                        fetchUnits();
                    }}
                />
            )}
        </div>
    );
};

export default UnitMaster;
