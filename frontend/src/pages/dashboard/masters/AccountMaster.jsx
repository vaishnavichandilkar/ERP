import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, ListFilter, MoreVertical, Eye, Edit3, CheckCircle2, ChevronDown, ArrowLeft, ArrowRight, ChevronsUpDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AccountMaster = () => {
    const { t } = useTranslation(['common', 'modules']);
    const [dropdownIndex, setDropdownIndex] = useState(null);
    const dropdownRef = useRef(null);

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

    const tableData = [
        { vendorCode: 'VEN001', account: 'Rajesh Agro Traders', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AABCR2456M1ZP', panNo: 'AABCR2456M', opBalance: '₹25,000', address: 'Green Market Road, Nashik', bankAccountNo: '458796321457', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN002', account: 'Meera Farm Supplies', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7845K1ZS', panNo: 'AACFM7845K', opBalance: '₹12,500', address: 'Shanti Nagar Colony, Kolhapur', bankAccountNo: '3214578001234', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN003', account: 'Shree Ganesh Enterprises', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AAHSG3698P1ZX', panNo: 'AAHSG3698P', opBalance: '₹40,750', address: 'Industrial Area Phase 2, Pune', bankAccountNo: '789654125698', ifscCode: 'ICIC0005678', status: 'Inactive' }
    ];

    const filteredData = tableData.filter(row => {
        let match = true;
        if (appliedFilters.gstNo && !row.gstNo.toLowerCase().includes(appliedFilters.gstNo.toLowerCase())) match = false;
        if (appliedFilters.panNo && !row.panNo.toLowerCase().includes(appliedFilters.panNo.toLowerCase())) match = false;
        if (appliedFilters.groupName && !row.groupName.toLowerCase().includes(appliedFilters.groupName.toLowerCase())) match = false;
        if (appliedFilters.creditDays && row.creditDays.toString() !== appliedFilters.creditDays) match = false;
        if (appliedFilters.status && row.status !== appliedFilters.status) match = false;
        return match;
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownIndex(null);
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

    const totalItems = filteredData.length;
    const startIndex = 0;
    const endIndex = totalItems;

    return (
        <div className="flex flex-col font-['Plus_Jakarta_Sans'] w-full animate-in fade-in duration-500">
            {/* Top aligned Add Button */}
            <div className="flex justify-end mb-6">
                <button className="w-full sm:w-auto px-6 h-[40px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all flex items-center justify-center">
                    {t('modules:add_account')}
                </button>
            </div>

            {/* Main Content Box */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden shadow-sm">

                {/* Search, Filter, Export Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-[#E5E7EB] gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder={t('common:search_anything')}
                                className="w-full h-[40px] bg-[#F9FAFB]/50 border border-[#E5E7EB] rounded-[8px] pl-10 pr-4 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#014A36] transition-all"
                            />
                        </div>
                        <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-4 h-[40px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[13px] font-semibold hover:bg-gray-50 transition-colors">
                            <ListFilter size={16} className="text-[#4B5563]" />
                            {t('common:filter')}
                        </button>
                    </div>

                    <button className="flex items-center gap-2 px-4 h-[40px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[13px] font-semibold hover:bg-gray-50 transition-colors bg-white">
                        <Download size={16} className="text-[#4B5563]" />
                        {t('common:export')}
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar relative">
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
                    <table className="w-full whitespace-nowrap text-left text-[13px] min-w-[1200px]">
                        <thead className="bg-[#FCFCFD] border-b border-[#E5E7EB] text-[#6B7280]">
                            <tr>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('modules:vendor_code')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('modules:account')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('common:group')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('modules:credit_days')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('modules:gst_no')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('modules:pan_no')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('modules:op_balance')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('common:address')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('modules:bank_account_no')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('modules:ifsc_code')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    <div className="flex items-center gap-1 cursor-pointer">{t('common:status')} <ChevronsUpDown size={14} className="text-gray-400" /></div>
                                </th>
                                <th className="px-5 py-4 font-semibold text-center">{t('common:action')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-[#111827]">
                            {filteredData.map((row, index) => (
                                <tr key={index} className="border-b border-[#E5E7EB] hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-5 font-medium">{row.vendorCode}</td>
                                    <td className="px-5 py-5">{row.account}</td>
                                    <td className="px-5 py-5">{row.groupName}</td>
                                    <td className="px-5 py-5">{row.creditDays}</td>
                                    <td className="px-5 py-5">{row.gstNo}</td>
                                    <td className="px-5 py-5">{row.panNo}</td>
                                    <td className="px-5 py-5">{row.opBalance}</td>
                                    <td className="px-5 py-5 truncate max-w-[200px]" title={row.address}>{row.address}</td>
                                    <td className="px-5 py-5">{row.bankAccountNo}</td>
                                    <td className="px-5 py-5">{row.ifscCode}</td>
                                    <td className="px-5 py-5">
                                        <span className={row.status === 'Active' ? 'text-[#014A36] font-medium' : 'text-gray-500'}>
                                            {row.status === 'Active' ? t('common:active') : t('common:inactive')}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 text-center relative" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={(e) => toggleDropdown(index, e)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors inline-flex border border-transparent">
                                            <MoreVertical size={16} className="text-[#6B7280]" />
                                        </button>

                                        {dropdownIndex === index && (
                                            <div ref={dropdownRef} className="absolute right-8 top-10 w-[180px] bg-white border border-[#E5E7EB] rounded-[8px] shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-200 text-left">
                                                <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors">
                                                    <Eye size={15} className="text-[#6B7280]" />
                                                    {t('modules:view_account')}
                                                </button>
                                                <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors">
                                                    <Edit3 size={15} className="text-[#6B7280]" />
                                                    {t('modules:update_account')}
                                                </button>
                                                <button className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors">
                                                    <CheckCircle2 size={15} className="text-[#6B7280]" />
                                                    {row.status === 'Active' ? t('common:inactive') : t('common:active')}
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
                <div className="flex sm:flex-row flex-col items-center justify-between p-4 bg-white border-t border-[#E5E7EB] gap-4">
                    <div className="flex items-center gap-3 text-[13px] text-[#6B7280] font-medium">
                        <span>{t('common:show')}</span>
                        <div className="relative">
                            <select className="appearance-none border border-[#D1D5DB] rounded-[6px] pl-3 pr-8 py-1.5 outline-none bg-transparent hover:border-gray-400 focus:border-[#014A36] transition-colors cursor-pointer text-[#111827]">
                                <option>5</option>
                                <option>10</option>
                                <option>20</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                        </div>
                        <span>{t('common:per_page')}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[13px] text-[#6B7280] font-medium">
                        <span>{totalItems > 0 ? `${startIndex + 1}-${endIndex} of ${totalItems}` : '0-0 of 0'}</span>
                        <div className="flex items-center gap-1">
                            <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-gray-100 text-gray-400 transition-colors">
                                <ArrowLeft size={16} />
                            </button>
                            <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-gray-100 transition-colors text-[#6B7280]">1</button>
                            <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] bg-[#F3F4F6] text-[#111827] font-semibold transition-colors">2</button>
                            <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-gray-100 transition-colors text-[#6B7280]">3</button>
                            <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-gray-100 transition-colors text-[#6B7280]">4</button>
                            <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-gray-100 transition-colors text-[#6B7280]">5</button>
                            <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-gray-100 text-[#4B5563] transition-colors">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Filter Drawer */}
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
                    <div className="relative w-[400px] max-w-full bg-white h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
                            <h2 className="text-[18px] font-bold text-[#111827] font-['Plus_Jakarta_Sans']">{t('modules:apply_filters')}</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="text-[#6B7280] hover:text-[#111827] transition-colors p-1 rounded-full hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('modules:gst_no')}</label>
                                <input
                                    type="text"
                                    name="gstNo"
                                    value={filterInputs.gstNo}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('modules:pan_no')}</label>
                                <input
                                    type="text"
                                    name="panNo"
                                    value={filterInputs.panNo}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('common:group')}</label>
                                <input
                                    type="text"
                                    name="groupName"
                                    value={filterInputs.groupName}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('modules:credit_days')}</label>
                                <input
                                    type="number"
                                    name="creditDays"
                                    value={filterInputs.creditDays}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('common:status')}</label>
                                <select
                                    name="status"
                                    value={filterInputs.status}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 pr-10 border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all appearance-none bg-white font-['Plus_Jakarta_Sans']"
                                >
                                    <option value="" disabled className="hidden"></option>
                                    <option value="">{t('common:all')}</option>
                                    <option value="Active">{t('common:active')}</option>
                                    <option value="Inactive">{t('common:inactive')}</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]" />
                            </div>
                        </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-6 border-t border-[#E5E7EB] flex items-center justify-between gap-4 bg-white">
                        <button
                            onClick={clearFilters}
                            className="flex-1 h-[48px] bg-white border border-[#D1D5DB] text-[#374151] text-[15px] font-semibold rounded-[8px] hover:bg-gray-50 transition-colors"
                        >
                            {t('common:clear_filter')}
                        </button>
                        <button
                            onClick={applyFilters}
                            className="flex-1 h-[48px] bg-[#014A36] text-white text-[15px] font-semibold rounded-[8px] hover:bg-[#013b2b] transition-colors"
                        >
                            {t('common:apply_filter')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountMaster;
