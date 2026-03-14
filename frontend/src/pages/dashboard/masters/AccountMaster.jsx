import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllAccounts, toggleAccountStatus } from '../../../redux/account/accountSlice';
import { Search, Download, Filter, MoreVertical, Eye, Edit3, CheckCircle2, ChevronDown, ArrowLeft, ArrowRight, ChevronsUpDown, X, FileText, FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import { translateDynamic } from '../../../utils/i18nUtils';
import accountService from '../../../services/accountService';
import AddAccount from './components/AddAccount';
import ViewAccount from './components/ViewAccount';

const AccountMaster = () => {
    const { t } = useTranslation(['common', 'modules']);
    const [dropdownIndex, setDropdownIndex] = useState(null);
    const dropdownRef = useRef(null);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterInputs, setFilterInputs] = useState({
        gstNo: '',
        panNo: '',
        groupName: '',
        creditDays: '',
        status: ''
    });
    const [appliedFilters, setAppliedFilters] = useState({
        gstNo: '',
        panNo: '',
        groupName: '',
        creditDays: '',
        status: ''
    });
    const [currentView, setCurrentView] = useState('list');
    const [selectedAccount, setSelectedAccount] = useState(null);

    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

        const dispatch = useDispatch();
    const { accounts, total: totalItems, totalPages, loading } = useSelector(state => state.account);
    const paginatedData = accounts || [];

    

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, appliedFilters]);

        useEffect(() => {
        const params = {
            page: currentPage,
            limit: rowsPerPage,
            search: searchQuery,
            ...appliedFilters
        };
        if (params.status === 'Active') params.isActive = true;
        else if (params.status === 'InActive') params.isActive = false;
        
        Object.keys(params).forEach(k => {
            if (params[k] === '' || params[k] === undefined) {
                delete params[k];
            }
        });
        
        dispatch(fetchAllAccounts(params));
    }, [dispatch, currentPage, rowsPerPage, searchQuery, appliedFilters]);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems || 0);

    const getVisiblePages = () => {
        let pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, 5];
            } else if (currentPage >= totalPages - 2) {
                pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
            }
        }
        return pages;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownIndex(null);
            }
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setIsExportOpen(false);
            }
        };
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const toggleDropdown = (index, event) => {
        event.stopPropagation();
        setDropdownIndex(dropdownIndex === index ? null : index);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterInputs(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters(filterInputs);
        setIsFilterOpen(false);
    };

    const clearFilters = () => {
        const emptyFilters = {
            gstNo: '',
            panNo: '',
            groupName: '',
            creditDays: '',
            status: ''
        };
        setFilterInputs(emptyFilters);
        setAppliedFilters(emptyFilters);
    };

        const handleExportPDF = async () => {
        setIsExportOpen(false);
        try {
            const params = { format: 'pdf', search: searchQuery, ...appliedFilters };
            if (params.status === 'Active') params.isActive = true;
            else if (params.status === 'InActive') params.isActive = false;
            
            const response = await accountService.exportAccounts(params);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'account-master.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) {
            console.error('Export failed', e);
        }
    };
        const handleExportExcel = async () => {
        setIsExportOpen(false);
        try {
            const params = { format: 'xlsx', search: searchQuery, ...appliedFilters };
            if (params.status === 'Active') params.isActive = true;
            else if (params.status === 'InActive') params.isActive = false;
            
            const response = await accountService.exportAccounts(params);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'account-master.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) {
            console.error('Export failed', e);
        }
    };
    const handleAddAccount = (newAccount) => {
        dispatch(fetchAllAccounts({ page: currentPage, limit: rowsPerPage, search: searchQuery, ...appliedFilters }));
        setCurrentView('list');
    };

    const handleUpdateAccount = (updatedAccount) => {
        dispatch(fetchAllAccounts({ page: currentPage, limit: rowsPerPage, search: searchQuery, ...appliedFilters }));
        setCurrentView('list');
        setSelectedAccount(null);
    };

        const toggleStatus = async (account, event) => {
        event.stopPropagation();
        await dispatch(toggleAccountStatus({ id: account.id, isActive: !account.isActive }));
        dispatch(fetchAllAccounts({ page: currentPage, limit: rowsPerPage, search: searchQuery, ...appliedFilters }));
        setDropdownIndex(null);
    };

    if (currentView === 'add') {
        return <AddAccount onBack={() => setCurrentView('list')} onAddAccount={handleAddAccount} />;
    }

    if (currentView === 'edit') {
        return <AddAccount onBack={() => { setCurrentView('list'); setSelectedAccount(null); }} initialData={selectedAccount} onUpdateAccount={handleUpdateAccount} />;
    }

    if (currentView === 'view') {
        return <ViewAccount initialData={selectedAccount} onBack={() => { setCurrentView('list'); setSelectedAccount(null); }} />;
    }

    return (
        <div className="flex flex-col font-['Plus_Jakarta_Sans'] w-full animate-in fade-in duration-500">
            {/* Top aligned Add Button */}
            <div className="flex justify-end mb-6">
                <button 
                    onClick={() => setCurrentView('add')}
                    className="w-full sm:w-auto px-6 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all flex items-center justify-center gap-2 shadow-sm">
                    {t('modules:add_account')}
                </button>
            </div>

            {/* Main Content Box */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm">

                {/* Search, Filter, Export Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-[#E5E7EB] gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={t('common:search_anything')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-[40px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] pl-10 pr-4 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#014A36] transition-all"
                            />
                        </div>
                        <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-6 h-[40px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-medium hover:bg-gray-50 transition-colors bg-white">
                            <Filter size={18} className="text-gray-400" />
                            {t('common:filter')}
                        </button>
                    </div>

                    <div className="relative" ref={exportRef}>
                        <button 
                            onClick={() => setIsExportOpen(!isExportOpen)}
                            className={`flex items-center gap-2 px-6 h-[40px] border rounded-[8px] text-[14px] font-medium transition-all duration-200 bg-white
                                ${isExportOpen ? 'border-[#014A36] text-[#014A36] shadow-sm' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                        >
                            <Download size={18} className={isExportOpen ? 'text-[#014A36]' : 'text-gray-400'} />
                            {t('common:export')}
                        </button>

                        {/* Export Dropdown */}
                        {isExportOpen && (
                            <div className="absolute top-full right-0 mt-2 w-[160px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] z-[50] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                >
                                    <FileText size={18} className="text-red-500" />
                                    PDF
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                >
                                    <FileSpreadsheet size={18} className="text-green-600" />
                                    Excel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar relative min-h-[400px]">
                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            height: 6px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: #E5E7EB;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #A7C0B8;
                            border-radius: 4px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #014A36;
                        }
                    `}</style>
                    <table className="w-full whitespace-nowrap text-left min-w-[1200px]">
                        <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[13px] font-semibold text-[#6B7280]">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:vendor_code')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:account')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('common:group')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:credit_days')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:gst_no')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:pan_no')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:op_balance')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('common:address')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:bank_account_no')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:ifsc_code')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('common:status')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">{t('common:action')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-[#111827]">
                            {paginatedData.map((row, index) => (
                                <tr key={index} className="border-b border-[#E5E7EB] hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{row.code}</td>
                                    <td className="px-6 py-4">{row.accountName}</td>
                                    <td className="px-6 py-4">{translateDynamic(row.groupName, t)}</td>
                                    <td className="px-6 py-4">{row.creditDays}</td>
                                    <td className="px-6 py-4">{row.gstNo}</td>
                                    <td className="px-6 py-4">{row.panNo}</td>
                                    <td className="px-6 py-4">{row.openingBalance}</td>
                                    <td className="px-6 py-4 truncate max-w-[200px]" title={row.addressLine1}>{row.addressLine1}</td>
                                    <td className="px-6 py-4">{row.accountNumber}</td>
                                    <td className="px-6 py-4">{row.ifscCode}</td>
                                    <td className="px-6 py-4">
                                        <span className={row.isActive ? 'text-[#014A36] font-medium' : 'text-gray-500'}>
                                            {row.isActive ? t('common:active') : t('common:inactive')}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-center relative ${dropdownIndex === index ? 'z-50' : ''}`}>
                                        <button onClick={(e) => toggleDropdown(index, e)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                            <MoreVertical size={18} />
                                        </button>

                                        {dropdownIndex === index && (
                                            <div 
                                                ref={dropdownRef} 
                                                className={`absolute right-6 w-max min-w-[180px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-[100] py-2 animate-in fade-in duration-200 text-left ${
                                                    index >= paginatedData.length - 2 && paginatedData.length > 2
                                                        ? 'bottom-[80%] mb-1 slide-in-from-bottom-2'
                                                        : 'top-[80%] mt-1 slide-in-from-top-2'
                                                }`}
                                            >
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedAccount(row); setCurrentView('view'); setDropdownIndex(null); }} 
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap"
                                                >
                                                    <Eye size={16} />
                                                    {t('modules:view_account')}
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedAccount(row); setCurrentView('edit'); setDropdownIndex(null); }} 
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap"
                                                >
                                                    <Edit3 size={16} />
                                                    {t('modules:update_account')}
                                                </button>
                                                <button 
                                                    onClick={(e) => toggleStatus(row, e)} 
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap border-t border-gray-100"
                                                >
                                                    <CheckCircle2 size={16} className={row.isActive ? 'text-gray-500' : 'text-[#014A36]'} />
                                                    {row.isActive ? t('common:inactive') : t('common:active')}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-white gap-4">
                    <div className="flex items-center gap-3 text-[14px] text-[#4B5563]">
                        <span>{t('common:show')}</span>
                        <div className="relative">
                            <select 
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="appearance-none border border-[#D1D5DB] rounded-[6px] pl-3 pr-8 py-1.5 outline-none bg-transparent hover:border-gray-400 focus:border-[#014A36] transition-colors cursor-pointer text-[#111827]"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                        </div>
                        <span>{t('common:per_page')}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[14px]">
                        <span>{totalItems === 0 ? '0-0 of 0' : `${startIndex + 1}–${endIndex} of ${totalItems}`}</span>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`w-[32px] h-[32px] flex items-center justify-center rounded-[6px] transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-[#4B5563]'}`}
                            >
                                <ArrowLeft size={16} />
                            </button>
                            {getVisiblePages().map(page => (
                                <button 
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-[32px] h-[32px] flex items-center justify-center rounded-[6px] transition-colors ${currentPage === page ? 'bg-[#F3F4F6] text-[#111827] font-semibold' : 'hover:bg-gray-100 text-[#6B7280]'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`w-[32px] h-[32px] flex items-center justify-center rounded-[6px] transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-[#4B5563]'}`}
                            >
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {isFilterOpen && (
                <div
                    className="fixed inset-0 z-[100] flex justify-end"
                >
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/50 transition-opacity"
                        onClick={() => setIsFilterOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="relative w-[400px] max-w-full bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-6 pb-4">
                            <h2 className="text-[16px] font-bold text-[#111827] font-['Plus_Jakarta_Sans']">{t('common:apply_filters')}</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="text-black hover:text-[#111827] transition-colors p-1 rounded-full hover:bg-gray-100">
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6">
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('modules:gst_no')}</label>
                                <input
                                    type="text"
                                    name="gstNo"
                                    value={filterInputs.gstNo}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 border border-[#D1D5DB] rounded-[6px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('modules:pan_no')}</label>
                                <input
                                    type="text"
                                    name="panNo"
                                    value={filterInputs.panNo}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 border border-[#D1D5DB] rounded-[6px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('modules:group_name')}</label>
                                <select
                                    name="groupName"
                                    value={filterInputs.groupName}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 pr-10 border border-[#D1D5DB] rounded-[6px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all appearance-none bg-white font-['Plus_Jakarta_Sans']"
                                >
                                    <option value="" disabled className="hidden"></option>
                                    <option value="Sundry Creditors">{t('modules:sundry_creditors')}</option>
                                    <option value="Sundry Debtors">{t('modules:sundry_debtors')}</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-3 top-1/2 translate-y-[20%] pointer-events-none text-[#6B7280]" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('modules:credit_days')}</label>
                                <input
                                    type="text"
                                    name="creditDays"
                                    value={filterInputs.creditDays}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 border border-[#D1D5DB] rounded-[6px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('common:status')}</label>
                                <select
                                    name="status"
                                    value={filterInputs.status}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 pr-10 border border-[#D1D5DB] rounded-[6px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all appearance-none bg-white font-['Plus_Jakarta_Sans']"
                                >
                                    <option value="" disabled className="hidden"></option>
                                    <option value="Active">{t('common:active')}</option>
                                    <option value="InActive">{t('common:inactive')}</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]" />
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-[#E5E7EB] flex items-center justify-between gap-4 bg-white mt-auto">
                            <button
                                onClick={clearFilters}
                                className="flex-1 h-[48px] bg-white border border-[#D1D5DB] text-[#374151] text-[14px] font-semibold rounded-[6px] hover:bg-gray-50 transition-colors"
                            >
                                {t('common:clear')}
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 h-[48px] bg-[#014A36] text-white text-[14px] font-semibold rounded-[6px] hover:bg-[#013b2b] transition-colors"
                            >
                                {t('common:apply_filters')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountMaster;
