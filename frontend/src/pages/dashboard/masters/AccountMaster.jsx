import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllAccounts, toggleAccountStatus } from '../../../redux/account/accountSlice';
import { Search, Download, Upload, Filter, MoreVertical, Eye, Edit3, CheckCircle2, ChevronDown, RefreshCw, ArrowLeft, ArrowRight, ChevronsUpDown, X, FileText, FileSpreadsheet, Plus, Database, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import accountService from '../../../services/accountService';
import AddAccount from './components/AddAccount';
import ViewAccount from './components/ViewAccount';
import toast from 'react-hot-toast';
import SuccessToast from './components/SuccessToast';
import ImportModal from './components/ImportModal';

const AccountMaster = () => {
    const { t } = useTranslation(['common', 'modules']);
    const [dropdownIndex, setDropdownIndex] = useState(null);
    const dropdownRef = useRef(null);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const exportRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [filterInputs, setFilterInputs] = useState({
        gstNo: '',
        panNo: '',
        groupName: '',
        supplierCreditDays: '',
        customerCreditDays: '',
        status: ''
    });
    const [appliedFilters, setAppliedFilters] = useState({
        gstNo: '',
        panNo: '',
        groupName: '',
        supplierCreditDays: '',
        customerCreditDays: '',
        status: ''
    });
    const [currentView, setCurrentView] = useState('list');
    const [previousView, setPreviousView] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [toastMessage, setToastMessage] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToastMessage({ show: true, message, type });
        // Auto-close is handled inside SuccessToast component itself though, 
        // but we need onBack to reset it in some cases maybe.
    };

    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const dispatch = useDispatch();
    const { accounts, total: totalItems, totalPages, loading } = useSelector(state => state.account);
    const paginatedData = accounts || [];

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [searchQuery, appliedFilters]);

    useEffect(() => {
        const params = {
            page: currentPage,
            limit: rowsPerPage,
            search: searchQuery,
            ...appliedFilters
        };
        if (params.status === 'Active') params.status = 'ACTIVE';
        else if (params.status === 'InActive') params.status = 'INACTIVE';
        
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
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFilterInputs(prev => {
                const currentGroups = prev.groupName ? prev.groupName.split(',').filter(g => g !== '') : [];
                let nextGroups;
                if (checked) {
                    nextGroups = [...currentGroups, value];
                } else {
                    nextGroups = currentGroups.filter(g => g !== value);
                }
                return { ...prev, groupName: nextGroups.join(',') };
            });
        } else {
            setFilterInputs(prev => ({ ...prev, [name]: value }));
        }
    };

    const applyFilters = () => {
        setAppliedFilters(filterInputs);
        const hasFilters = filterInputs.gstNo || filterInputs.panNo || filterInputs.groupName || filterInputs.supplierCreditDays || filterInputs.customerCreditDays || filterInputs.status;
        setIsFilterApplied(!!hasFilters);
        setIsFilterOpen(false);
    };

    const handleClearFilter = () => {
        const emptyFilters = {
            gstNo: '',
            panNo: '',
            groupName: '',
            supplierCreditDays: '',
            customerCreditDays: '',
            status: ''
        };
        setFilterInputs(emptyFilters);
        setAppliedFilters(emptyFilters);
        setSearchQuery('');
        setIsFilterApplied(false);
        setIsFilterOpen(false);
    };

    const handleRefresh = () => {
        const params = {
            page: currentPage,
            limit: rowsPerPage,
            search: searchQuery,
            ...appliedFilters
        };
        if (params.status === 'Active') params.status = 'ACTIVE';
        else if (params.status === 'InActive') params.status = 'INACTIVE';
        
        Object.keys(params).forEach(k => {
            if (params[k] === '' || params[k] === undefined) {
                delete params[k];
            }
        });
        
        dispatch(fetchAllAccounts(params));
        showToast("Data refreshed successfully");
    };

    const handleExportPDF = async () => {
        setIsExportOpen(false);
        try {
            const params = { format: 'pdf', search: searchQuery, ...appliedFilters };
            if (params.status === 'Active') params.status = 'ACTIVE';
            else if (params.status === 'InActive') params.status = 'INACTIVE';
            
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
            if (params.status === 'Active') params.status = 'ACTIVE';
            else if (params.status === 'InActive') params.status = 'INACTIVE';
            
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

    const handleImportExcel = async (formData) => {
        const loadingToast = toast.loading(t('common:importing', 'Importing data...'));
        
        try {
            await accountService.importAccounts(formData);
            toast.dismiss(loadingToast);
            toast.custom(() => (
                <SuccessToast message={t('common:import_success', 'Data imported successfully')} />
            ), { duration: 2000, position: 'top-right' });
            handleRefresh();
            return Promise.resolve();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error?.response?.data?.message || t('common:import_failed', 'Failed to import data'));
            return Promise.reject(error);
        }
    };

    const handleAddAccount = () => {
        dispatch(fetchAllAccounts({ page: currentPage, limit: rowsPerPage, search: searchQuery, ...appliedFilters }));
        setCurrentView('list');
    };

    const handleUpdateAccount = () => {
        dispatch(fetchAllAccounts({ page: currentPage, limit: rowsPerPage, search: searchQuery, ...appliedFilters }));
        setCurrentView('list');
        setSelectedAccount(null);
    };

    const toggleStatus = async (account, event) => {
        event.stopPropagation();
        const newStatus = account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await dispatch(toggleAccountStatus({ id: account.id, status: newStatus }));
        dispatch(fetchAllAccounts({ page: currentPage, limit: rowsPerPage, search: searchQuery, ...appliedFilters }));
        showToast(`Account ${newStatus === 'ACTIVE' ? 'activated' : 'inactivated'} successfully`);
        setDropdownIndex(null);
    };

    if (currentView === 'add' || currentView === 'edit') {
        const handleBack = () => {
            if (previousView === 'view') {
                setCurrentView('view');
            } else {
                setCurrentView('list');
                setSelectedAccount(null);
            }
            setPreviousView(null);
        };
        return <AddAccount 
            initialData={selectedAccount} 
            isEditMode={currentView === 'edit'} 
            onBack={handleBack} 
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onShowToast={showToast}
        />;
    }

    if (currentView === 'view') {
        return <ViewAccount 
            initialData={selectedAccount} 
            onBack={() => { setCurrentView('list'); setSelectedAccount(null); setPreviousView(null); }} 
            onEdit={() => { setPreviousView('view'); setCurrentView('edit'); }} 
        />;
    }

    return (
        <div className="flex flex-col font-['Plus_Jakarta_Sans'] w-full animate-in fade-in duration-500">
            <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">{t('modules:account_master')}</h1>
                    <button 
                        onClick={() => { setPreviousView(null); setCurrentView('add'); }}
                        className="flex items-center gap-2 bg-[#073318] hover:bg-[#04200f] text-white px-6 h-[44px] rounded-[10px] text-[15px] font-semibold transition-all shadow-sm active:scale-[0.98]"
                    >
                        {t('modules:add_account')}
                    </button>
                </div>
                <p className="text-[#6B7280] text-[15px]">{t('modules:account_master_desc', 'View, search, and manage all accounts in your system')}</p>
            </div>

            <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full overflow-hidden mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-[#F3F4F6] gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={t('common:search_placeholder', 'Search By Anything...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-[42px] bg-white border border-[#E5E7EB] rounded-[10px] pl-10 pr-10 text-[14px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 transition-all placeholder:text-gray-400 shadow-sm"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
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
                            <Filter size={18} className={isFilterApplied ? "text-red-500" : "text-gray-400"} />
                            {isFilterApplied ? t('common:clear', 'Clear') : t('common:filter', 'Filter')}
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="flex items-center justify-center w-[42px] h-[42px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] hover:bg-gray-50 transition-colors bg-white shadow-sm"
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="relative flex items-center gap-3" ref={exportRef}>
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 h-[42px] border border-[#E5E7EB] rounded-[10px] text-[14px] font-bold text-[#4B5563] hover:bg-gray-50 transition-all duration-200 bg-white shadow-sm"
                        >
                            <Upload size={18} className="text-gray-400" />
                            {t('common:import', 'Import')}
                        </button>
                        <ImportModal
                            isOpen={isImportModalOpen}
                            onClose={() => setIsImportModalOpen(false)}
                            onImport={handleImportExcel}
                            onDownloadSample={async () => {
                                const response = await accountService.downloadSample();
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'Account_Master_Sample.xlsx');
                                document.body.appendChild(link);
                                link.click();
                                link.parentNode.removeChild(link);
                            }}
                            sampleFileName="Account_Master_Sample.xlsx"
                            sampleHeaders={['Account Name*', 'Group Name*', 'GST NO', 'PAN NO*', 'Address1*', 'Address2', 'Pincode*', 'Area', 'Sub District', 'District', 'State', 'Country', 'Supplier Credit Days', 'Supplier Opening Balance', 'Customer Credit Days', 'Customer Opening Balance', 'Customer Type', 'MSME Enabled', 'MSME ID', 'Reg.Under', 'Reg.Type', 'Status']}
                        />

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
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#073318] transition-colors"
                                >
                                    <FileText size={18} className="text-red-500" />
                                    {t('common:pdf')}
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#073318] transition-colors"
                                >
                                    <FileSpreadsheet size={18} className="text-green-600" />
                                    {t('common:excel')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

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
                    <table className="w-full min-w-[1200px] text-left border-collapse">
                        <thead>
                            <tr className="bg-emerald-900 border-b border-emerald-950 text-[14px] font-bold text-white">
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/10 uppercase tracking-tight">
                                    {t('modules:customer_code')}
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50 uppercase tracking-tight">
                                    {t('modules:supplier_code')}
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#073318] transition-colors uppercase tracking-tight text-left">
                                        {t('modules:account')}
                                        <ChevronsUpDown size={14} className="text-emerald-200/50" />
                                    </div>
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50 uppercase tracking-tight">
                                    {t('modules:account_type')}
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50 uppercase tracking-tight">
                                    {t('modules:customer_type', 'Customer Type')}
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50 uppercase tracking-tight">
                                    {t('modules:customer_credit_days')}
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50 uppercase tracking-tight">
                                    {t('modules:supplier_credit_days')}
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#073318] transition-colors uppercase tracking-tight">
                                        {t('modules:gst_no')}
                                        <ChevronsUpDown size={14} className="text-emerald-200/50" />
                                    </div>
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#073318] transition-colors uppercase tracking-tight">
                                        {t('modules:pan_no')}
                                        <ChevronsUpDown size={14} className="text-emerald-200/50" />
                                    </div>
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50 uppercase tracking-tight">
                                    {t('modules:customer_op_balance')}
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50 uppercase tracking-tight">
                                    {t('modules:supplier_op_balance')}
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#073318] transition-colors uppercase tracking-tight">
                                        {t('common:address')}
                                        <ChevronsUpDown size={14} className="text-emerald-200/50" />
                                    </div>
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap border-r border-white/50">
                                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#073318] transition-colors uppercase tracking-tight">
                                        {t('common:status')}
                                        <ChevronsUpDown size={14} className="text-emerald-200/50" />
                                    </div>
                                </th>
                                <th className="px-6 py-5 whitespace-nowrap text-center uppercase tracking-tight">{t('common:action')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-[#111827]">
                            {loading ? (
                                <tr>
                                    <td colSpan="12" className="px-6 py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-[#0A3622]/10 border-t-[#0A3622] rounded-full animate-spin"></div>
                                            <span className="font-medium">{t('common:loading')}...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((row, index) => (
                                <tr key={index} className="border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F9FAFB] transition-all group">
                                    <td className="px-6 py-5 text-gray-500 font-medium border-r border-[#F3F4F6]">{row.customerCode || '-'}</td>
                                    <td className="px-6 py-5 text-gray-500 font-medium border-r border-[#F3F4F6]">{row.supplierCode || '-'}</td>
                                    <td className="px-6 py-5 font-bold text-[#111827] border-r border-[#F3F4F6]">{row.accountName}</td>
                                    <td className="px-6 py-5 border-r border-[#F3F4F6]">
                                        <div className="flex gap-1.5 flex-wrap">
                                            {row.groupName?.includes('SUNDRY_DEBTORS') && <span className="px-2 py-0.5 bg-[#073318]/10 text-[#073318] rounded text-[11px] font-bold uppercase tracking-wider">{t('modules:customer')}</span>}
                                            {row.groupName?.includes('SUNDRY_CREDITORS') && <span className="px-2 py-0.5 bg-[#4B5563]/10 text-[#4B5563] rounded text-[11px] font-bold uppercase tracking-wider">{t('modules:sundry_creditors')}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[#4B5563] font-medium border-r border-[#F3F4F6] capitalize">
                                        {row.customerType ? row.customerType.toLowerCase() : '-'}
                                    </td>
                                    <td className="px-6 py-5 text-[#4B5563] font-medium border-r border-[#F3F4F6]">{row.customerCreditDays || 0}</td>
                                    <td className="px-6 py-5 text-[#4B5563] font-medium border-r border-[#F3F4F6]">{row.supplierCreditDays || 0}</td>
                                    <td className="px-6 py-5 text-[#4B5563] font-medium border-r border-[#F3F4F6]">{row.gstNo || '-'}</td>
                                    <td className="px-6 py-5 text-[#4B5563] font-medium border-r border-[#F3F4F6]">{row.panNo || '-'}</td>
                                    <td className="px-6 py-5 text-[#4B5563] font-medium border-r border-[#F3F4F6]">{row.customerOpeningBalance || 0}</td>
                                    <td className="px-6 py-5 text-[#4B5563] font-medium border-r border-[#F3F4F6]">{row.supplierOpeningBalance || 0}</td>
                                    <td className="px-6 py-5 text-[#6B7280] max-w-[200px] truncate border-r border-[#F3F4F6]" title={row.addressLine1}>{row.addressLine1 || '-'}</td>
                                    <td className="px-6 py-5 border-r border-[#F3F4F6]">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold ${row.status === 'ACTIVE' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'ACTIVE' ? 'bg-[#059669]' : 'bg-[#DC2626]'}`}></span>
                                            {row.status === 'ACTIVE' ? t('common:active') : t('common:inactive')}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-5 text-center relative ${dropdownIndex === index ? 'z-[100]' : ''}`} ref={dropdownIndex === index ? dropdownRef : null}>
                                        <button
                                            onClick={(e) => toggleDropdown(index, e)}
                                            className={`p-2 rounded-lg transition-all ${dropdownIndex === index ? 'bg-gray-100 text-[#111827]' : 'text-gray-400 hover:bg-gray-100 hover:text-[#111827]'}`}
                                        >
                                            < MoreVertical size={20} />
                                        </button>

                                        {dropdownIndex === index && (
                                            <div 
                                                 
                                                className={`absolute right-[80%] w-max min-w-[200px] bg-white border border-gray-100 rounded-[14px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] z-[110] py-2 animate-in fade-in zoom-in-95 duration-200 text-left ${
                                                    index >= paginatedData.length - 2 && paginatedData.length > 2
                                                        ? 'bottom-0 mb-2'
                                                        : 'top-0 mt-2'
                                                }`}
                                            >
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedAccount(row); setCurrentView('view'); setDropdownIndex(null); }} 
                                                    className="w-full px-5 py-3 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#073318] transition-colors whitespace-nowrap font-bold"
                                                >
                                                    <Eye size={18} className="text-gray-400" />
                                                    {t('modules:view_and_edit_account')}
                                                </button>
                                                <div className="h-[1px] bg-[#F3F4F6] mx-2 my-1" />
                                                <button 
                                                    onClick={(e) => toggleStatus(row, e)} 
                                                    className="w-full px-5 py-3 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#073318] transition-colors whitespace-nowrap font-bold"
                                                >
                                                    <CheckCircle2 size={18} className={row.status === 'ACTIVE' ? 'text-gray-400' : 'text-[#073318]'} />
                                                    {row.status === 'ACTIVE' ? t('common:inactive') : t('common:active')}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="12" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 bg-gray-50 rounded-full">
                                                <Database size={32} className="text-gray-300" />
                                            </div>
                                            <p className="text-[#6B7280] font-medium">{t('modules:no_accounts_found', 'No accounts found')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t border-[#F3F4F6] bg-white gap-4">
                    <div className="flex items-center gap-3 text-[14px] text-[#6B7280] font-medium">
                        <span>{t('common:show')}</span>
                        <div className="relative group">
                            <select 
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
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
                            {totalItems > 0 ? `${startIndex + 1}-${endIndex} of ${totalItems}` : `0-0 of 0`}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-[10px]"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-1.5">
                                {getVisiblePages().map((page, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => setCurrentPage(page)}
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
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-[10px]"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isFilterOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsFilterOpen(false)} />
                    <div className="relative w-full max-w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#04200f] bg-emerald-900">
                            <h2 className="text-[20px] font-bold text-white tracking-tight">{t('common:apply_filters', 'Apply Filters')}</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="text-emerald-100 hover:text-white transition-colors p-1">
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="flex-1 px-8 py-8 overflow-y-auto space-y-7">
                            <div className="space-y-2.5">
                                <label className="text-[14px] font-medium text-[#4B5563]">{t('modules:gst_no')}</label>
                                <input
                                    type="text"
                                    name="gstNo"
                                    value={filterInputs.gstNo}
                                    onChange={handleFilterChange}
                                    placeholder={t('modules:enter_gst_number')}
                                    className="w-full h-[46px] border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#073318] bg-white font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[14px] font-medium text-[#4B5563]">{t('modules:pan_no')}</label>
                                <input
                                    type="text"
                                    name="panNo"
                                    value={filterInputs.panNo}
                                    onChange={handleFilterChange}
                                    placeholder={t('modules:enter_pan_number')}
                                    className="w-full h-[46px] border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#073318] bg-white font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[14px] font-medium text-[#4B5563]">{t('modules:group_name', 'Group Name')}</label>
                                <div className="flex flex-col gap-3 mt-1">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                name="groupName"
                                                value="SUNDRY_DEBTORS"
                                                checked={filterInputs.groupName?.includes('SUNDRY_DEBTORS')}
                                                onChange={handleFilterChange}
                                                className="peer appearance-none w-5 h-5 border-2 border-[#E5E7EB] rounded-md checked:bg-[#073318] checked:border-[#073318] transition-all cursor-pointer"
                                            />
                                            <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={14} />
                                        </div>
                                        <span className="text-[14px] text-[#4B5563] group-hover:text-[#111827] transition-colors">{t('modules:sundry_debtors')}</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                name="groupName"
                                                value="SUNDRY_CREDITORS"
                                                checked={filterInputs.groupName?.includes('SUNDRY_CREDITORS')}
                                                onChange={handleFilterChange}
                                                className="peer appearance-none w-5 h-5 border-2 border-[#E5E7EB] rounded-md checked:bg-[#073318] checked:border-[#073318] transition-all cursor-pointer"
                                            />
                                            <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={14} />
                                        </div>
                                        <span className="text-[14px] text-[#4B5563] group-hover:text-[#111827] transition-colors">{t('modules:sundry_creditors')}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[14px] font-medium text-[#4B5563]">{t('modules:customer_credit_days')}</label>
                                <input
                                    type="text"
                                    name="customerCreditDays"
                                    value={filterInputs.customerCreditDays}
                                    onChange={handleFilterChange}
                                    placeholder={t('modules:enter_credit_days', 'Enter credit days')}
                                    className="w-full h-[46px] border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#073318] bg-white font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[14px] font-medium text-[#4B5563]">{t('modules:supplier_credit_days')}</label>
                                <input
                                    type="text"
                                    name="supplierCreditDays"
                                    value={filterInputs.supplierCreditDays}
                                    onChange={handleFilterChange}
                                    placeholder={t('modules:enter_credit_days', 'Enter credit days')}
                                    className="w-full h-[46px] border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#073318] bg-white font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[14px] font-medium text-[#4B5563]">{t('common:status')}</label>
                                <div className="relative">
                                    <select
                                        name="status"
                                        value={filterInputs.status}
                                        onChange={handleFilterChange}
                                        className="w-full h-[46px] border border-[#E5E7EB] rounded-[10px] pl-4 pr-10 text-[14px] text-[#111827] outline-none focus:border-[#073318] appearance-none bg-white font-medium"
                                    >
                                        <option value="">{t('common:all')}</option>
                                        <option value="Active">{t('common:active')}</option>
                                        <option value="InActive">{t('common:inactive')}</option>
                                    </select>
                                    <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronsUpDown size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-[#E5E7EB] flex items-center gap-4 bg-white">
                            <button
                                onClick={handleClearFilter}
                                className="flex-1 h-[46px] bg-white border border-[#E5E7EB] text-[#374151] text-[15px] font-semibold rounded-[10px] hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                {t('common:clear', 'Clear')}
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 h-[46px] bg-[#073318] text-white text-[15px] font-bold rounded-[10px] hover:bg-[#04200f] transition-all shadow-sm"
                            >
                                {t('common:apply_filter')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

export default AccountMaster;
