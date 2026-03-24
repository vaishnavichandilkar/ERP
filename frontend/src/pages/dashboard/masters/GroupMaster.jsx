import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Download, Filter, Plus, Minus, FileText, FileSpreadsheet, Maximize2, Minimize2, MoreVertical, CheckCircle2, XCircle, RefreshCw, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GroupForm from './components/GroupForm';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import masterService from '../../../services/masterService';
import { translateDynamic } from '../../../utils/i18nUtils';

const GroupMaster = () => {
    const { t } = useTranslation(['modules', 'common']);
    const [currentView, setCurrentView] = useState({ type: 'list', data: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterInputs, setFilterInputs] = useState({ status: '' });
    const [appliedFilters, setAppliedFilters] = useState({ status: '' });
    const isFilterApplied = appliedFilters.status !== '';
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const exportRef = useRef(null);
    const [activeRowDropdown, setActiveRowDropdown] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const response = await masterService.getAllGroups();
            if (response.success) {
                setGroups(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch groups', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // Handle click outside for export dropdown
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

    const toggleGroup = (id) => {
        setExpandedGroups(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const hasMatchingChild = (group, query) => {
        if (group.group_name.toLowerCase().includes(query.toLowerCase())) return true;
        if (group.children && group.children.length > 0) {
            return group.children.some(child => hasMatchingChild(child, query));
        }
        return false;
    };

    const filteredData = useMemo(() => {
        let result = groups;
        if (searchQuery) {
            result = result.filter(group => hasMatchingChild(group, searchQuery));
        }
        if (appliedFilters.status) {
            result = result.filter(group => group.status === appliedFilters.status);
        }
        return result;
    }, [groups, searchQuery, appliedFilters]);

    const getAllIds = (items) => {
        let ids = [];
        items.forEach(item => {
            ids.push(item.id);
            if (item.children && item.children.length > 0) {
                ids = ids.concat(getAllIds(item.children));
            }
        });
        return ids;
    };

    const allGroupIds = useMemo(() => getAllIds(groups), [groups]);
    const isAllExpanded = allGroupIds.length > 0 && allGroupIds.every(id => expandedGroups[id]);

    const toggleExpandAll = () => {
        if (isAllExpanded) {
            setExpandedGroups({});
        } else {
            const newExpanded = {};
            allGroupIds.forEach(id => newExpanded[id] = true);
            setExpandedGroups(newExpanded);
        }
    };

    const handleToggleStatus = async (groupId, currentStatus) => {
        const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setActiveRowDropdown(null);

        try {
            const response = await masterService.updateGroupStatus(groupId, nextStatus);
            if (response.success) {
                showToast(`Group ${nextStatus === 'ACTIVE' ? 'activated' : 'inactivated'} successfully`);
                fetchGroups();
            } else {
                showToast(response.message || 'Failed to update status', 'error');
            }
        } catch (err) {
            console.error('Error:', err);
            showToast(err.response?.data?.message || err.message || 'Server error', 'error');
        }
    };

    const handleApplyFilter = () => {
        setAppliedFilters(filterInputs);
        setIsFilterOpen(false);
    };

    const handleClearFilter = () => {
        setFilterInputs({ status: '' });
        setAppliedFilters({ status: '' });
        setIsFilterOpen(false);
    };

    // Export Logic
    const handleExportPDF = () => {
        const tableRows = [];
        const prepareRows = (items, level = 0) => {
            items.forEach((item, idx) => {
                const indent = '  '.repeat(level);
                tableRows.push([
                    level === 0 ? `${idx + 1}.` : '',
                    `${indent}${translateDynamic(item.group_name, t)}`
                ]);
                if (item.children && item.children.length > 0) {
                    prepareRows(item.children, level + 1);
                }
            });
        };
        prepareRows(groups);
        exportToPDF('Group Master Report', ['#', 'Group Name'], tableRows, 'group-master.pdf');
        setIsExportOpen(false);
    };

    const handleExportExcel = () => {
        const data = [];
        const prepareData = (items, level = 0) => {
            items.forEach(item => {
                data.push({
                    'Level': level,
                    'Group Name': translateDynamic(item.group_name, t),
                    'Status': item.status
                });
                if (item.children && item.children.length > 0) {
                    prepareData(item.children, level + 1);
                }
            });
        };
        prepareData(groups);
        exportToExcel(data, 'Group Master', 'group-master.xlsx');
        setIsExportOpen(false);
    };

    const renderGroupRow = (group, depth = 0) => {
        const hasChildren = group.children && group.children.length > 0;
        const isExpanded = expandedGroups[group.id] || (searchQuery && hasMatchingChild(group, searchQuery));
        const dropdownId = `dropdown-${group.id}`;
        const isHighlighted = searchQuery && group.group_name.toLowerCase().includes(searchQuery.toLowerCase());

        return (
            <React.Fragment key={group.id}>
                <div
                    className={`flex items-center justify-between px-4 py-4 border-b border-[#F3F4F6] transition-all duration-200 group-row
                        ${depth === 0 ? 'bg-[#F9FAFB]/50' : 'bg-white'}
                        hover:bg-gray-50`}
                >
                    <div
                        className="flex items-center flex-1 cursor-pointer select-none gap-3"
                        style={{ paddingLeft: `${depth * 28}px` }}
                        onClick={() => hasChildren && toggleGroup(group.id)}
                    >
                        {/* Plus/Minus Toggle - Darker & bolder */}
                        <div className="w-6 h-6 flex items-center justify-center">
                            {hasChildren ? (
                                <div className={`p-0.5 rounded transition-colors duration-200 ${isExpanded ? 'bg-red-50 text-red-600' : 'bg-[#073318]/5 text-[#111827]'}`}>
                                    {isExpanded ? (
                                        <Minus size={14} strokeWidth={3} />
                                    ) : (
                                        <Plus size={14} strokeWidth={3} />
                                    )}
                                </div>
                            ) : (
                                <div className="w-1.5 h-1.5 bg-[#4B5563] rounded-full ml-0.5" />
                            )}
                        </div>

                        {/* Group Name with Visual Hierarchy */}
                        <div className="flex flex-col">
                            <span className={`text-[14px] transition-colors
                                ${depth === 0 ? 'font-bold text-[#111827]' : 'font-medium text-[#374151]'}
                                ${group.status === 'INACTIVE' ? 'text-gray-400' : ''}`}
                            >
                                {translateDynamic(group.group_name, t)}
                                {group.is_header && group.level === 1 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-[#6B7280] text-[9px] font-bold rounded uppercase tracking-wider">
                                        Header
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Properly Aligned Actions Area */}
                    <div className="flex items-center gap-6 shrink-0 ml-4">
                        {/* Status Badge */}
                        <div className="w-[100px] flex justify-end">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold ${group.status === 'ACTIVE' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${group.status === 'ACTIVE' ? 'bg-[#059669]' : 'bg-[#DC2626]'}`}></span>
                                {group.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                            </div>
                        </div>

                        {/* Three-dot menu aligned to the right */}
                        <div className="relative w-8 flex justify-center">
                            {(!group.is_header || group.level !== 1) && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveRowDropdown(activeRowDropdown === dropdownId ? null : dropdownId);
                                        }}
                                        className={`p-1.5 rounded-md transition-all duration-200 dropdown-trigger
                                            ${activeRowDropdown === dropdownId ? 'bg-gray-100 text-[#073318]' : 'text-gray-400 hover:text-[#073318] hover:bg-white border border-transparent'}`}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {activeRowDropdown === dropdownId && (
                                        <div className="absolute right-0 top-full mt-1 w-max min-w-[200px] bg-white border border-gray-100 rounded-[14px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] z-[100] py-2 animate-in zoom-in-95 duration-200 dropdown-menu">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleStatus(group.id, group.status);
                                                }}
                                                className="w-full px-5 py-3 flex items-center gap-3 text-[14px] font-bold text-gray-700 hover:bg-[#F9FAFB] hover:text-[#073318] transition-colors whitespace-nowrap"
                                            >
                                                <CheckCircle2 size={18} className={group.status === 'ACTIVE' ? "text-gray-400" : "text-[#073318]"} />
                                                {group.status === 'ACTIVE' ? t('common:inactive') : t('common:active')}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* Recursive Children with Indentation */}
                {hasChildren && isExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        {group.children.map((child, childIndex) => renderGroupRow(child, depth + 1, childIndex))}
                    </div>
                )}
            </React.Fragment>
        );
    };

    if (currentView.type === 'add' || currentView.type === 'edit') {
        return (
            <GroupForm
                mode={currentView.type}
                initialData={currentView.data}
                onBack={() => setCurrentView({ type: 'list', data: null })}
                onSuccess={() => {
                    fetchGroups();
                    setCurrentView({ type: 'list', data: null });
                    showToast(currentView.type === 'add' ? 'Group added successfully' : 'Group updated successfully');
                }}
            />
        );
    }

    return (
        <div className="flex flex-col animate-in fade-in duration-500 relative font-['Plus_Jakarta_Sans']">
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300
                    ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#073318] text-white'}`}>
                    {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    <span className="text-[16px] font-medium">{toast.message}</span>
                </div>
            )}

            <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">{t('group_master')}</h1>
                    <button
                        onClick={() => setCurrentView({ type: 'add', data: null })}
                        className="px-6 h-[44px] bg-[#073318] text-white rounded-[10px] text-[15px] font-bold hover:bg-[#04200f] transition-all shadow-sm flex items-center justify-center"
                    >
                        {t('add_group')}
                    </button>
                </div>
                <p className="text-[#6B7280] text-[15px]">{t('group_master_desc')}</p>
            </div>

            {/* Content Container */}
            <div className={`flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 ${activeRowDropdown ? '!overflow-visible' : 'overflow-hidden'}`}>
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-[#F3F4F6] bg-white text-[#111827]">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search By Anything..."
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
                            onClick={toggleExpandAll}
                            className="flex items-center gap-2 px-4 h-[42px] border border-[#E5E7EB] rounded-[10px] text-[14px] font-bold text-[#4B5563] hover:bg-gray-50 transition-all bg-white shadow-sm"
                        >
                            {isAllExpanded ? <Minimize2 size={16} className="text-gray-400" /> : <Maximize2 size={16} className="text-gray-400" />}
                            {isAllExpanded ? t('common:collapse_all') : t('common:expand_all')}
                        </button>
                        <button
                            onClick={() => {
                                fetchGroups();
                                setSearchQuery('');
                                handleClearFilter();
                            }}
                            className="flex items-center justify-center w-[42px] h-[42px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] hover:bg-gray-50 transition-colors bg-white shadow-sm"
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="relative" ref={exportRef}>
                        <button
                            onClick={() => setIsExportOpen(!isExportOpen)}
                            className={`flex items-center justify-center gap-2 px-4 h-[42px] border rounded-[10px] text-[14px] font-bold transition-all duration-200 bg-white
                                ${isExportOpen ? 'border-[#073318] text-[#073318]' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                        >
                            <Download size={18} className={isExportOpen ? 'text-[#073318]' : 'text-gray-400'} />
                            {t('common:export')}
                        </button>

                        {/* Export Dropdown */}
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

                <div className="min-w-full overflow-x-auto overflow-y-hidden">
                    <div className="flex items-stretch justify-between bg-emerald-900 border-b border-emerald-950 text-[13px] font-bold text-white uppercase tracking-wider">
                        <div className="flex-1 border-r border-white/50 pr-6 py-4 pl-9 flex items-center">{t('modules:group_master')}</div>
                        <div className="flex items-stretch shrink-0">
                            <div className="w-[120px] border-r border-white/50 flex items-center justify-center px-4">{t('common:status')}</div>
                            <div className="w-20 flex items-center justify-center px-4">{t('common:action')}</div>
                        </div>
                    </div>
                    <div className="flex flex-col divide-y divide-[#F3F4F6]">
                        {isLoading ? (
                            <div className="p-16 text-center">
                                <div className="inline-block w-8 h-8 border-2 border-[#073318] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[#6B7280] text-[14px] font-medium">{t('common:loading_groups') || 'Loading groups...'}</p>
                            </div>
                        ) : filteredData.length > 0 ? (
                            filteredData.map(group => renderGroupRow(group))
                        ) : (
                            <div className="p-16 text-center">
                                <Search size={40} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 text-[15px] font-medium">
                                    {t('no_matching_groups')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Removed Filter Sidebar */}
        </div>
    );
};

export default GroupMaster;
