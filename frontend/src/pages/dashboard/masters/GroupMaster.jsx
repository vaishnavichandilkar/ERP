import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Download, Plus, Minus, FileText, FileSpreadsheet } from 'lucide-react';
import AddGroupModal from './components/AddGroupModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const GroupMaster = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef(null);

    const leftPanelData = useMemo(() => ({
        title: 'Expenses & Costs',
        sections: [
            { id: 'exp-direct', name: 'Direct Expense', items: ['Light Bill', 'Labour Charges'] },
            { id: 'exp-indirect', name: 'Indirect Expense', items: ['Bank Charges', 'Company Promotions'] },
            { id: 'exp-purchase', name: 'Purchase', items: ['Light Bill', 'Labour Charges'] },
            { id: 'exp-opening', name: 'Opening Stock', items: ['Product Opening Stock', 'Store Opening Stock'] }
        ]
    }), []);

    const rightPanelData = useMemo(() => ({
        title: 'Revenue & Income',
        sections: [
            { id: 'rev-direct', name: 'Direct Sale', items: ['Light Bill', 'Labour Charges'] },
            { id: 'rev-indirect', name: 'Indirect Sale', items: ['Light Bill', 'Labour Charges'] },
            { id: 'rev-sale', name: 'Sale', items: ['Light Bill', 'Labour Charges'] },
            { id: 'rev-closing', name: 'Closing Stock', items: ['Product Closing Stock', 'Store Closing Stock'] }
        ]
    }), []);

    // Handle click outside for export dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setIsExportOpen(false);
            }
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

    // Filter logic + auto-expand
    const filteredData = (data) => {
        if (!searchQuery) return data;

        const q = searchQuery.toLowerCase();
        return {
            ...data,
            sections: data.sections.filter(section => {
                const nameMatch = section.name.toLowerCase().includes(q);
                const itemsMatch = section.items.some(item => item.toLowerCase().includes(q));

                // If sub-items match, we should return this section and it will be expanded in the render logic
                return nameMatch || itemsMatch;
            })
        };
    };

    // Export Logic
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Group Master Report', 14, 22);

        const tableRows = [];
        const prepareRows = (panel) => {
            tableRows.push([{ content: panel.title, colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
            panel.sections.forEach(sec => {
                tableRows.push([{ content: sec.name, colSpan: 2, styles: { fontStyle: 'bold' } }]);
                sec.items.forEach((item, idx) => {
                    tableRows.push([`${idx + 1}.`, item]);
                });
            });
        };

        prepareRows(leftPanelData);
        prepareRows(rightPanelData);

        autoTable(doc, {
            startY: 30,
            head: [['#', 'Group Name']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [1, 74, 54] }
        });

        doc.save('group-master.pdf');
        setIsExportOpen(false);
    };

    const handleExportExcel = () => {
        const data = [];
        const prepareExcelData = (panel) => {
            data.push({ 'Type': panel.title, 'Group': '', 'Sub-Group': '' });
            panel.sections.forEach(sec => {
                data.push({ 'Type': '', 'Group': sec.name, 'Sub-Group': '' });
                sec.items.forEach(item => {
                    data.push({ 'Type': '', 'Group': '', 'Sub-Group': item });
                });
            });
            data.push({}); // Empty row
        };

        prepareExcelData(leftPanelData);
        prepareExcelData(rightPanelData);

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Group Master');
        XLSX.writeFile(wb, 'group-master.xlsx');
        setIsExportOpen(false);
    };

    const MasterSection = ({ data }) => {
        const processedData = filteredData(data);

        return (
            <div className="flex-1 bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden shadow-sm h-fit">
                <div className="bg-[#F9FAFB] p-4 border-b border-[#E5E7EB]">
                    <h3 className="text-[16px] font-bold text-[#111827]">{data.title}</h3>
                </div>
                <div className="flex flex-col">
                    {processedData.sections.length > 0 ? (
                        processedData.sections.map((section) => {
                            // If searching and items match, auto-expand
                            const isSearchExpanding = searchQuery && section.items.some(item =>
                                item.toLowerCase().includes(searchQuery.toLowerCase())
                            );
                            const isExpanded = expandedGroups[section.id] || isSearchExpanding;

                            return (
                                <div key={section.id} className="flex flex-col border-b border-[#E5E7EB] last:border-b-0">
                                    <div
                                        onClick={() => toggleGroup(section.id)}
                                        className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50/50 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center justify-center w-5 h-5">
                                            {isExpanded ? (
                                                <Minus size={14} className="text-[#014A36] stroke-[3px]" />
                                            ) : (
                                                <Plus size={14} className="text-gray-400 group-hover:text-[#014A36] stroke-[3px]" />
                                            )}
                                        </div>
                                        <span className={`text-[14px] font-bold transition-colors ${isExpanded ? 'text-[#014A36]' : 'text-[#4B5563]'}`}>
                                            {section.name}
                                        </span>
                                    </div>

                                    {/* Sub-items with smooth transition */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="flex flex-col bg-gray-50/20 border-t border-[#F3F4F6]">
                                            {section.items.map((item, itemIdx) => {
                                                const isHighlighted = searchQuery && item.toLowerCase().includes(searchQuery.toLowerCase());
                                                return (
                                                    <div
                                                        key={itemIdx}
                                                        className={`p-3.5 pl-12 text-[13px] font-medium border-b border-[#F3F4F6]/50 last:border-b-0 transition-colors
                                                            ${isHighlighted ? 'bg-yellow-50 text-[#014A36]' : 'text-[#6B7280]'}`}
                                                    >
                                                        <span className="mr-3 text-gray-400 font-normal">{itemIdx + 1}.</span>
                                                        {item}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-[14px]">
                            No matching groups found
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            {/* Add Type Button (Top Right) */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto px-6 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all shadow-sm flex items-center justify-center"
                >
                    Add Type
                </button>
            </div>

            {/* Action Bar (Search + Export) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by anything"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-[44px] bg-[#F9FAFB]/50 border border-[#E5E7EB] rounded-[8px] pl-10 pr-4 text-[14px] outline-none focus:border-[#014A36] transition-all"
                    />
                </div>

                <div className="relative" ref={exportRef}>
                    <button
                        onClick={() => setIsExportOpen(!isExportOpen)}
                        className={`flex items-center gap-2 px-4 h-[44px] border rounded-[8px] text-[14px] font-semibold transition-all duration-200 bg-white
                            ${isExportOpen ? 'border-[#014A36] text-[#014A36] shadow-md' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
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

            {/* Content Panels */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start">
                <MasterSection data={leftPanelData} />
                <MasterSection data={rightPanelData} />
            </div>

            {/* Add Group Modal */}
            <AddGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default GroupMaster;
