import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Download, Plus, Minus, FileText, FileSpreadsheet, Maximize2, Minimize2, MoreVertical, CheckCircle2, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import AddGroupModal from './components/AddGroupModal';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';

const GroupMaster = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef(null);

    const masterData = useMemo(() => ([
        { id: 'exp-direct', name: 'Direct Expense', items: ['Light Bill', 'Labour Charges'] },
        { id: 'exp-indirect', name: 'Indirect Expense', items: ['Bank Charges', 'Company Promotions'] },
        { id: 'exp-purchase', name: 'Purchase', items: ['Light Bill', 'Labour Charges'] },
        { id: 'exp-opening', name: 'Opening Stock', items: ['Product-Opening Stock', 'Store-Opening Stock'] },
        { id: 'rev-direct', name: 'Direct Sale', items: ['Light Bill', 'Labour Charges'] },
        { id: 'rev-indirect', name: 'Indirect Sale', items: ['Light Bill', 'Labour Charges'] },
        { id: 'rev-sale', name: 'Sale', items: ['Light Bill', 'Labour Charges'] },
        { id: 'rev-closing', name: 'Closing Stock', items: ['Product-Closing Stock', 'Store-Closing Stock'] }
    ]), []);

    const [itemStatuses, setItemStatuses] = useState({});
    const [activeRowDropdown, setActiveRowDropdown] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

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

    // Pagination Calculations
    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedData = processedData.slice(startIndex, endIndex);

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

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            {/* Add Type Button (Top Right) */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto px-6 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    Add Group
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
                            placeholder="Search by anything"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Reset page on search
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
                            {isAllExpanded ? 'Collapse All' : 'Expand All'}
                        </button>

                        <div className="relative" ref={exportRef}>
                            <button
                                onClick={() => setIsExportOpen(!isExportOpen)}
                                className={`flex items-center gap-2 px-4 h-[40px] border rounded-[8px] text-[14px] font-medium transition-all duration-200 bg-white
                                    ${isExportOpen ? 'border-[#014A36] text-[#014A36] shadow-sm' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                            >
                                <Download size={18} className={isExportOpen ? 'text-[#014A36]' : 'text-gray-400'} />
                                Export
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
                </div>
                {paginatedData.length > 0 ? (
                    paginatedData.map((section) => {
                        // If searching and items match, auto-expand
                        const isSearchExpanding = searchQuery && section.items.some(item =>
                            item.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        const isExpanded = expandedGroups[section.id] || isSearchExpanding;

                        return (
                            <div key={section.id} className="flex flex-col border-b border-[#E5E7EB] last:border-b-0">
                                <div
                                    className="flex items-center justify-between p-4 bg-white hover:bg-gray-50/50 transition-colors group"
                                >
                                    <div
                                        className="flex items-center gap-3 cursor-pointer select-none"
                                        onClick={() => toggleGroup(section.id)}
                                    >
                                        <div className="flex items-center justify-center w-5 h-5">
                                            {isExpanded ? (
                                                <Minus size={14} className="text-[#111827] stroke-[3px]" />
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
                                            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-[110px] bg-white border border-gray-100 rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-[100] py-1.5 animate-in zoom-in-95 duration-200">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(`group-${section.id}`, 'Active'); }}
                                                    className="w-full px-4 py-2 flex items-center gap-2.5 text-[13px] text-[#4B5563] hover:bg-gray-50 transition-colors"
                                                >
                                                    <CheckCircle2 size={15} className="text-gray-400" />
                                                    Active
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(`group-${section.id}`, 'Inactive'); }}
                                                    className="w-full px-4 py-2 flex items-center gap-2.5 text-[13px] text-[#4B5563] hover:bg-gray-50 transition-colors"
                                                >
                                                    <XCircle size={15} className="text-gray-400" />
                                                    Inactive
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sub-items with smooth transition */}
                                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'} ${activeRowDropdown?.startsWith(`${section.id}-item-`) ? '!overflow-visible' : 'overflow-hidden'}`}>
                                    <div className="flex flex-col bg-gray-50/30 border-t border-[#E5E7EB]/50">
                                        {section.items.map((item, itemIdx) => {
                                            const isHighlighted = searchQuery && item.toLowerCase().includes(searchQuery.toLowerCase());
                                            const dropdownId = `${section.id}-item-${itemIdx}`;
                                            const currentStatus = itemStatuses[dropdownId] || 'Active';

                                            return (
                                                <div
                                                    key={itemIdx}
                                                    className={`relative flex items-center justify-between p-3.5 pl-[52px] text-[13px] border-b border-[#E5E7EB]/50 last:border-b-0 transition-colors
                                                        ${isHighlighted ? 'bg-yellow-50 text-[#014A36]' : 'text-[#6B7280]'}`}
                                                >
                                                    <span className="font-medium text-[#4B5563]">
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
                                                            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-[110px] bg-white border border-gray-100 rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-[100] py-1.5 animate-in zoom-in-95 duration-200">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(dropdownId, 'Active'); }}
                                                                    className="w-full px-4 py-2 flex items-center gap-2.5 text-[13px] text-[#4B5563] hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <CheckCircle2 size={15} className="text-gray-400" />
                                                                    Active
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(dropdownId, 'Inactive'); }}
                                                                    className="w-full px-4 py-2 flex items-center gap-2.5 text-[13px] text-[#4B5563] hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <XCircle size={15} className="text-gray-400" />
                                                                    Inactive
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
                        No matching groups found
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-white gap-4">
                    <div className="flex items-center gap-3 text-[14px] text-[#4B5563]">
                        <span>Show</span>
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
                        <span>per page</span>
                    </div>

                    <div className="flex items-center gap-4 text-[14px]">
                        <span className="text-[#6B7280]">
                            {totalItems > 0 ? `${startIndex + 1}-${endIndex} of ${totalItems}` : '0-0 of 0'}
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
                                        onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                                        disabled={typeof page !== 'number'}
                                        className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors text-[14px]
                                            ${page === '...'
                                                ? 'text-[#6B7280] cursor-default bg-transparent'
                                                : currentPage === page
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

            {/* Add Group Modal */}
            <AddGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div >
    );
};

export default GroupMaster;
