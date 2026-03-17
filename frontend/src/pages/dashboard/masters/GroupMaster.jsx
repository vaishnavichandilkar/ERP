import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Download, Plus, Minus, FileText, FileSpreadsheet, Maximize2, Minimize2, MoreVertical, ShieldCheck, ShieldX, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AddGroupModal from './components/AddGroupModal';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import masterService from '../../../services/masterService';
import { translateDynamic } from '../../../utils/i18nUtils';

const GroupMaster = () => {
    const { t } = useTranslation(['modules', 'common']);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isExportOpen, setIsExportOpen] = useState(false);
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
        if (!searchQuery) return groups;
        return groups.filter(group => hasMatchingChild(group, searchQuery));
    }, [groups, searchQuery]);

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
                showToast(nextStatus === 'ACTIVE' ? 'Group activated successfully' : 'Group inactivated successfully');
                fetchGroups();
            } else {
                showToast(response.message || 'Failed to update status', 'error');
            }
        } catch (err) {
            console.error('Error:', err);
            showToast(err.response?.data?.message || err.message || 'Server error', 'error');
        }
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
                        ${isHighlighted ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
                >
                    <div
                        className="flex items-center flex-1 cursor-pointer select-none gap-3"
                        style={{ paddingLeft: `${depth * 28}px` }}
                        onClick={() => hasChildren && toggleGroup(group.id)}
                    >
                        {/* Plus/Minus Toggle - Darker & bolder */}
                        <div className="w-6 h-6 flex items-center justify-center">
                            {hasChildren ? (
                                <div className={`p-0.5 rounded transition-colors duration-200 ${isExpanded ? 'bg-red-50 text-red-600' : 'bg-[#014A36]/5 text-[#111827]'}`}>
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
                        <div className="w-[80px] flex justify-end">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                                ${group.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-700 border-green-100'
                                    : 'bg-red-50 text-red-700 border-red-100'}`}
                            >
                                {group.status === 'ACTIVE' ? t('common:active') : t('common:inactive')}
                            </span>
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
                                            ${activeRowDropdown === dropdownId ? 'bg-gray-100 text-[#014A36]' : 'text-gray-400 hover:text-[#014A36] hover:bg-white border border-transparent'}`}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {activeRowDropdown === dropdownId && (
                                        <div className="absolute right-0 top-full mt-1 w-[140px] bg-white border border-[#E5E7EB] rounded-[10px] shadow-xl z-[100] py-1.5 animate-in zoom-in-95 duration-200 dropdown-menu">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleStatus(group.id, group.status);
                                                }}
                                                className="w-full px-4 py-2 flex items-center gap-3 text-[13px] font-semibold text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                            >
                                                {group.status === 'ACTIVE' ? (
                                                    <>
                                                        <ShieldX size={16} className="text-gray-400" />
                                                        {t('common:inactive')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck size={16} className="text-gray-400" />
                                                        {t('common:active')}
                                                    </>
                                                )}
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
                        {group.children.map(child => renderGroupRow(child, depth + 1))}
                    </div>
                )}
            </React.Fragment>
        );
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500 relative font-['Plus_Jakarta_Sans']">
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-[12px] shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300
                    ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#014A36] text-white'}`}>
                    {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    <span className="text-[14px] font-medium">{toast.message}</span>
                </div>
            )}

            {/* Top Action Section */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto px-6 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    {t('add_group')}
                </button>
            </div>

            {/* Table Container */}
            <div className={`flex flex-col bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm mb-8 overflow-hidden`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-[#E5E7EB] bg-white">
                    <div className="relative w-full sm:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('common:search_anything')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-[40px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] pl-10 pr-4 text-[14px] outline-none focus:border-[#014A36] transition-all text-[#111827]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={toggleExpandAll}
                            className="flex items-center gap-2 px-4 h-[40px] border border-[#E5E7EB] rounded-[8px] text-[13px] font-semibold text-[#4B5563] hover:bg-gray-50 transition-all bg-white"
                        >
                            {isAllExpanded ? <Minimize2 size={16} className="text-gray-400" /> : <Maximize2 size={16} className="text-gray-400" />}
                            {isAllExpanded ? t('common:collapse_all') : t('common:expand_all')}
                        </button>

                        <div className="relative" ref={exportRef}>
                            <button
                                onClick={() => setIsExportOpen(!isExportOpen)}
                                className={`flex items-center gap-2 px-4 h-[40px] border rounded-[8px] text-[13px] font-semibold transition-all duration-200 bg-white
                                    ${isExportOpen ? 'border-[#014A36] text-[#014A36] shadow-sm' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                            >
                                <Download size={18} className={isExportOpen ? 'text-[#014A36]' : 'text-gray-400'} />
                                {t('common:export')}
                            </button>

                            {isExportOpen && (
                                <div className="absolute top-full right-0 mt-2 w-[160px] bg-white border border-gray-100 rounded-[12px] shadow-lg z-[50] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={handleExportPDF}
                                        className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                    >
                                        <FileText size={18} className="text-red-500" />
                                        {t('common:pdf')}
                                    </button>
                                    <button
                                        onClick={handleExportExcel}
                                        className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                    >
                                        <FileSpreadsheet size={18} className="text-green-600" />
                                        {t('common:excel')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="min-w-full overflow-x-auto overflow-y-hidden">
                    <div className="flex flex-col divide-y divide-[#F3F4F6]">
                        {isLoading ? (
                            <div className="p-16 text-center">
                                <div className="inline-block w-8 h-8 border-2 border-[#014A36] border-t-transparent rounded-full animate-spin mb-4" />
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

            <AddGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchGroups();
                    showToast('Group added successfully');
                }}
            />
        </div>
    );
};

export default GroupMaster;
