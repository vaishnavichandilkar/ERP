import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Download, Plus, Minus, FileText, FileSpreadsheet, Maximize2, Minimize2, MoreVertical, ShieldCheck, ShieldX, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AddGroupModal from './components/AddGroupModal';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';

const GroupMaster = () => {
    const { t } = useTranslation(['modules', 'common']);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef(null);

    const masterData = useMemo(() => ([
        { id: 'exp-direct', name: t('direct_expense'), items: [t('light_bill'), t('labour_charges')] },
        { id: 'exp-indirect', name: t('indirect_expense'), items: [t('bank_charges'), t('company_promotions')] },
        { id: 'exp-purchase', name: t('purchase'), items: [t('light_bill'), t('labour_charges')] },
        { id: 'exp-opening', name: t('opening_stock'), items: [t('product_opening_stock'), t('store_opening_stock')] },
        { id: 'rev-direct', name: t('direct_sale'), items: [t('light_bill'), t('labour_charges')] },
        { id: 'rev-indirect', name: t('indirect_sale'), items: [t('light_bill'), t('labour_charges')] },
        { id: 'rev-sale', name: t('sale'), items: [t('light_bill'), t('labour_charges')] },
        { id: 'rev-closing', name: t('closing_stock'), items: [t('product_closing_stock'), t('store_closing_stock')] }
    ]), [t]);

    const [itemStatuses, setItemStatuses] = useState({});
    const [activeRowDropdown, setActiveRowDropdown] = useState(null);



    // Handle click outside for export dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setIsExportOpen(false);
            }
            setActiveRowDropdown(null);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to toggle expansion
    const toggleGroup = (id) => {
        setExpandedGroups(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const filteredData = () => {
        if (!searchQuery) return masterData;

        const q = searchQuery.toLowerCase();
        return masterData.filter(section => {
            const nameMatch = section.name.toLowerCase().includes(q);
            const itemsMatch = section.items.some(item => item.toLowerCase().includes(q));
            return nameMatch || itemsMatch;
        });
    };

    const isAllExpanded = Object.keys(expandedGroups).length === masterData.length && Object.values(expandedGroups).every(Boolean);

    const toggleExpandAll = () => {
        if (isAllExpanded) {
            setExpandedGroups({});
        } else {
            const newExpanded = {};
            masterData.forEach(section => newExpanded[section.id] = true);
            setExpandedGroups(newExpanded);
        }
    };

    const handleToggleStatus = (dropdownId, currentStatus) => {
        setItemStatuses(prev => ({
            ...prev,
            [dropdownId]: currentStatus === 'Active' ? 'Inactive' : 'Active'
        }));
        setActiveRowDropdown(null);
    };

    // Export Logic
    const handleExportPDF = () => {
        const tableRows = [];
        const prepareRows = (sections) => {
            sections.forEach(sec => {
                tableRows.push([{ content: sec.name, colSpan: 2, styles: { fontStyle: 'bold' } }]);
                sec.items.forEach((item, idx) => {
                    tableRows.push([`${idx + 1}.`, item]);
                });
            });
        };

        prepareRows(masterData);

        exportToPDF('Group Master Report', ['#', 'Group Name'], tableRows, 'group-master.pdf');
        setIsExportOpen(false);
    };

    const handleExportExcel = () => {
        const data = [];
        const handlePrepareData = (sections) => {
            sections.forEach(sec => {
                data.push({ 'Type': '', 'Group': sec.name, 'Sub-Group': '' });
                sec.items.forEach(item => {
                    data.push({ 'Type': '', 'Group': '', 'Sub-Group': item });
                });
            });
            data.push({}); // Empty row
        };

        handlePrepareData(masterData);

        exportToExcel(data, 'Group Master', 'group-master.xlsx');
        setIsExportOpen(false);
    };

    const processedData = filteredData();



    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            {/* Add Type Button (Top Right) */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto px-6 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    {t('add_group')}
                </button>
            </div>

            {/* Content List Array */}
            <div className={`flex flex-col bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm mb-8 ${activeRowDropdown ? '!overflow-visible' : 'overflow-hidden'}`}>
                {/* Action Bar (Search + Export) inner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-[#E5E7EB] bg-white">
                    <div className="relative w-full sm:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('common:search_anything')}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                            }}
                            className="w-full h-[40px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] pl-10 pr-4 text-[14px] outline-none focus:border-[#014A36] transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={toggleExpandAll}
                            className="flex items-center gap-2 px-4 h-[40px] border border-[#E5E7EB] rounded-[8px] text-[14px] font-medium text-[#4B5563] hover:bg-gray-50 transition-all bg-white"
                        >
                            {isAllExpanded ? <Minimize2 size={16} className="text-gray-400" /> : <Maximize2 size={16} className="text-gray-400" />}
                            {isAllExpanded ? t('common:collapse_all') : t('common:expand_all')}
                        </button>

                        <div className="relative" ref={exportRef}>
                            <button
                                onClick={() => setIsExportOpen(!isExportOpen)}
                                className={`flex items-center gap-2 px-4 h-[40px] border rounded-[8px] text-[14px] font-medium transition-all duration-200 bg-white
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
                {processedData.length > 0 ? (
                    processedData.map((section) => {
                        // If searching and items match, auto-expand
                        const isSearchExpanding = searchQuery && section.items.some(item =>
                            item.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        const isExpanded = expandedGroups[section.id] || isSearchExpanding;

                        return (
                            <div key={section.id} className="flex flex-col border-b border-[#E5E7EB] last:border-b-0">
                                <div
                                    className="flex items-center justify-between p-4 bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors group"
                                >
                                    <div
                                        className="flex items-center gap-3 cursor-pointer select-none"
                                        onClick={() => toggleGroup(section.id)}
                                    >
                                        <div className="flex items-center justify-center w-5 h-5">
                                            {isExpanded ? (
                                                <span className="text-[#111827] font-bold text-[18px] leading-none">—</span>
                                            ) : (
                                                <Plus size={14} className="text-[#111827] stroke-[3px]" />
                                            )}
                                        </div>
                                        <span className="text-[14px] font-bold text-[#111827]">
                                            {section.name}
                                        </span>
                                    </div>
                                    <div className="relative flex items-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveRowDropdown(activeRowDropdown === `group-${section.id}` ? null : `group-${section.id}`);
                                            }}
                                            className="p-1 px-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {/* Group Action Dropdown */}
                                        {activeRowDropdown === `group-${section.id}` && (
                                            <div className="absolute right-0 mt-2 w-[130px] bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] z-[100] py-1.5 animate-in zoom-in-95 duration-200">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(`group-${section.id}`, 'Active'); }}
                                                    className="w-full px-4 py-2 flex items-center gap-3 text-[14px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                                >
                                                    <ShieldCheck size={16} className="text-gray-400" />
                                                    {t('common:active')}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(`group-${section.id}`, 'Inactive'); }}
                                                    className="w-full px-4 py-2 flex items-center gap-3 text-[14px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                                >
                                                    <ShieldX size={16} className="text-gray-400" />
                                                    {t('common:inactive')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sub-items with smooth transition */}
                                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} ${activeRowDropdown?.startsWith(`${section.id}-item-`) ? '!overflow-visible' : 'overflow-hidden'}`}>
                                    <div className="flex flex-col bg-white">
                                        {section.items.map((item, itemIdx) => {
                                            const isHighlighted = searchQuery && item.toLowerCase().includes(searchQuery.toLowerCase());
                                            const dropdownId = `${section.id}-item-${itemIdx}`;
                                            const currentStatus = itemStatuses[dropdownId] || 'Active';

                                            return (
                                                <div
                                                    key={itemIdx}
                                                    className={`relative flex items-center justify-between p-3.5 pl-[64px] border-b border-[#E5E7EB]/50 last:border-b-0 transition-colors bg-white
                                                        ${isHighlighted ? 'bg-yellow-50 text-[#014A36]' : 'text-[#6B7280]'}`}
                                                >
                                                    <span className="text-[13px] font-medium text-[#6B7280]">
                                                        {itemIdx + 1}. {item}
                                                    </span>

                                                    <div className="relative flex items-center">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveRowDropdown(activeRowDropdown === dropdownId ? null : dropdownId);
                                                            }}
                                                            className="p-1 px-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>

                                                        {/* Row Action Dropdown */}
                                                        {activeRowDropdown === dropdownId && (
                                                            <div className="absolute right-0 mt-2 w-[130px] bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] z-[100] py-1.5 animate-in zoom-in-95 duration-200">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(dropdownId, 'Active'); }}
                                                                    className="w-full px-4 py-2 flex items-center gap-3 text-[14px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                                                >
                                                                    <ShieldCheck size={16} className="text-gray-400" />
                                                                    {t('common:active')}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(dropdownId, 'Inactive'); }}
                                                                    className="w-full px-4 py-2 flex items-center gap-3 text-[14px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                                                >
                                                                    <ShieldX size={16} className="text-gray-400" />
                                                                    {t('common:inactive')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-12 text-center text-gray-400 text-[14px]">
                        {t('no_matching_groups')}
                    </div>
                )}
            </div>

            {/* Add Group Modal */}
            <AddGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div >
    );
};

export default GroupMaster;
