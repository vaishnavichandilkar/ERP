import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Download, Plus, Minus, FileText, FileSpreadsheet, Maximize2, Minimize2, MoreVertical, CheckCircle2, XCircle, ArrowLeft, ArrowRight, ChevronDown, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AddCategoryModal from './components/AddCategoryModal';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';

const CategoryMaster = () => {
    const { t } = useTranslation(['modules', 'common']);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const exportRef = useRef(null);

    const masterData = useMemo(() => ([
        { id: 'cat-silage', name: t('silage'), items: [t('maize_silage'), t('napier_silage'), t('oat_silage')] },
        { id: 'cat-animal-feed', name: t('animal_feed'), items: [t('cattle_feed'), t('poultry_feed'), t('swine_feed')] },
        { id: 'cat-fertilizers', name: t('fertilizers'), items: [t('organic_fertilizers'), t('chemical_fertilizers'), t('liquid_fertilizers')] },
        { id: 'cat-seeds', name: t('seeds'), items: [t('hybrid_seeds'), t('vegetable_seeds'), t('flower_seeds')] },
        { id: 'cat-equipment', name: t('farm_equipment'), items: [t('tractors'), t('harvesters'), t('ploughs')] },
        { id: 'cat-chemicals', name: t('agri_chemicals'), items: [t('pesticides'), t('herbicides'), t('fungicides')] },
        { id: 'cat-packaging', name: t('packaging_materials'), items: [t('gunny_bags'), t('plastic_crates'), t('cartons')] },
        { id: 'cat-irrigation', name: t('irrigation_systems'), items: [t('drip_irrigation'), t('sprinklers'), t('pipes')] },
        { id: 'cat-livestock', name: t('livestock_care'), items: [t('veterinary_medicines'), t('vitamins'), t('vaccines')] },
        { id: 'cat-soil', name: t('soil_care'), items: [t('compost'), t('peat_moss'), t('soil_conditioners')] },
        { id: 'cat-greenhouse', name: t('greenhouse_accessories'), items: [t('shade_nets'), t('uv_films'), t('trays')] },
        { id: 'cat-tools', name: t('hand_tools'), items: [t('spades'), t('rakes'), t('pruners')] },
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

    // Reset pagination to page 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

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

        exportToPDF(t('modules:category_master_report', 'Category Master Report'), ['#', t('modules:category_name')], tableRows, 'category-master.pdf');
        setIsExportOpen(false);
    };

    const handleExportExcel = () => {
        const data = [];
        const handlePrepareData = (sections) => {
            sections.forEach(sec => {
                data.push({ [t('common:type')]: '', [t('modules:category_name')]: sec.name, [t('modules:sub_category')]: '' });
                sec.items.forEach(item => {
                    data.push({ [t('common:type')]: '', [t('modules:category_name')]: '', [t('modules:sub_category')]: item });
                });
            });
            data.push({}); // Empty row
        };

        handlePrepareData(masterData);

        exportToExcel(data, 'Category Master', 'category-master.xlsx');
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

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">{t('modules:category_master')}</h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto px-8 h-[44px] bg-[#073318] text-white rounded-[10px] text-[15px] font-bold hover:bg-[#04200f] transition-all shadow-sm flex items-center justify-center">
                        {t('modules:add_category')}
                    </button>
                </div>
                <p className="text-[#6B7280] text-[15px]">{t('modules:category_master_desc') || 'View, verify, and manage product categories and sub-categories to keep your inventory organized.'}</p>
            </div>

            {/* Content List Array */}
            <div className={`flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 ${activeRowDropdown ? '!overflow-visible' : 'overflow-hidden'}`}>
                {/* Action Bar (Search + Export) inner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-[#F3F4F6] bg-white">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by anything..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-[42px] bg-white border border-[#E5E7EB] rounded-[10px] pl-10 pr-10 text-[14px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 transition-all placeholder:text-gray-400"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={toggleExpandAll}
                            className="flex items-center gap-2 px-4 h-[42px] border border-[#E5E7EB] rounded-[10px] text-[14px] font-semibold text-[#4B5563] hover:bg-gray-50 transition-all bg-white shadow-sm"
                        >
                            {isAllExpanded ? <Minimize2 size={16} className="text-gray-400" /> : <Maximize2 size={16} className="text-gray-400" />}
                            {isAllExpanded ? t('common:collapse_all') : t('common:expand_all')}
                        </button>

                        <button
                            className="flex items-center justify-center w-[42px] h-[42px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] hover:bg-gray-50 transition-colors bg-white shadow-sm"
                            title="Refresh Data"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw size={18} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="relative flex items-center gap-3" ref={exportRef}>
                        <button
                            onClick={() => setIsExportOpen(!isExportOpen)}
                            className={`flex items-center justify-center gap-2 px-4 h-[42px] border rounded-[10px] text-[14px] font-semibold transition-all duration-200 bg-white
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
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622] transition-colors"
                                >
                                    <FileText size={18} className="text-red-500" />
                                    {t('common:pdf')}
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622] transition-colors"
                                >
                                    <FileSpreadsheet size={18} className="text-green-600" />
                                    {t('common:excel')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* Header title internally */}
                <div className="p-4 border-b border-[#E5E7EB] bg-white text-[16px] font-bold text-[#111827]">
                    {t('category_sub_category')}
                </div>

                <div className="min-h-[300px]">
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
                                                        {t('common:active')}
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(`group-${section.id}`, 'Inactive'); }}
                                                        className="w-full px-4 py-2 flex items-center gap-2.5 text-[13px] text-[#4B5563] hover:bg-gray-50 transition-colors"
                                                    >
                                                        <XCircle size={15} className="text-gray-400" />
                                                        {t('common:inactive')}
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
                                                                        {t('common:active')}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(dropdownId, 'Inactive'); }}
                                                                        className="w-full px-4 py-2 flex items-center gap-2.5 text-[13px] text-[#4B5563] hover:bg-gray-50 transition-colors"
                                                                    >
                                                                        <XCircle size={15} className="text-gray-400" />
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
                            {t('no_matching_categories')}
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t border-[#F3F4F6] bg-white gap-4">
                    <div className="flex items-center gap-3 text-[14px] text-[#6B7280] font-medium">
                        <span>{t('common:show')}</span>
                        <div className="relative group">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
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
                            {totalItems > 0 ? `${startIndex + 1}–${endIndex} of ${totalItems}` : `0-0 of 0`}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-[10px]"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-1.5">
                                {getVisiblePages().map((page, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
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
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-[10px]"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Category Modal */}
            <AddCategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div >
    );
};

export default CategoryMaster;
