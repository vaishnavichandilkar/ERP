import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, ChevronDown, ArrowLeft, ArrowRight, Download, ListFilter, FileText, FileSpreadsheet } from 'lucide-react';
import ActionMenu from './ActionMenu';
import FilterPopupFacility from './FilterPopupFacility';
import { exportToExcelFacility, exportToPdfFacility } from '../../../../features/facility/exportUtils';

// Generate 52 dummy records for testing pagination
const fullDataset = Array.from({ length: 52 }, (_, i) => {
    const id = i + 1;
    let location = 'Gadhinglaj';
    if (id % 5 === 2) location = 'Pune';
    if (id % 5 === 3) location = 'Mumbai';
    if (id % 5 === 4) location = 'Nashik';
    if (id % 5 === 0) location = 'Satara';

    // Spread dates across recent months to make filters work
    const month = (id % 3) === 0 ? '01' : (id % 2) === 0 ? '02' : '03';

    return {
        id,
        name: `Plant ${id}`,
        location,
        machines: (id % 10) + 4, // 4 to 13 machines
        status: id % 4 === 0 ? 'Inactive' : 'Active',
        createdAt: `2026-${month}-${String((id % 28) + 1).padStart(2, '0')} 11:05`
    };
});

const FacilityTable = () => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    }, []);

    const handleExportExcel = () => {
        const { success, message } = exportToExcelFacility(fullDataset, 'Facility');
        showToast(message, success ? 'success' : 'error');
    };

    const handleExportPdf = () => {
        const { success, message } = exportToPdfFacility(filteredDataset, 'Facility');
        showToast(message, success ? 'success' : 'error');
    };

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterContainerRef = useRef(null);

    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const exportDropdownRef = useRef(null);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    useEffect(() => {
        const handleClickOutsideExport = (event) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setIsExportDropdownOpen(false);
            }
        };

        if (isExportDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutsideExport);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideExport);
        };
    }, [isExportDropdownOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };

        const handleEsc = (event) => {
            if (event.key === 'Escape') setIsFilterOpen(false);
        };

        if (isFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isFilterOpen]);

    const [filters, setFilters] = useState({
        dateRange: '',
        status: [],
        customFrom: '',
        customTo: ''
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);
    const rowsDropdownRef = useRef(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1); // Reset page automatically when search executes
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (rowsDropdownRef.current && !rowsDropdownRef.current.contains(event.target)) {
                setIsRowsDropdownOpen(false);
            }
        };

        if (isRowsDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isRowsDropdownOpen]);

    const getFilteredDataset = () => {
        let result = [...fullDataset];

        if (filters.status.length > 0) {
            result = result.filter(item => filters.status.includes(item.status));
        }

        result = result.filter(item => {
            const itemDateStr = item.createdAt.split(' ')[0].replace(/\./g, '-');
            const itemDate = new Date(itemDateStr);
            const today = new Date();

            if (filters.customFrom && new Date(filters.customFrom) > itemDate) return false;
            if (filters.customTo) {
                const toDateObj = new Date(filters.customTo);
                toDateObj.setHours(23, 59, 59, 999);
                if (toDateObj < itemDate) return false;
            }

            if (filters.dateRange) {
                const diffTime = Math.abs(today - itemDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (filters.dateRange === 'Last 15 Days' && diffDays > 15) return false;
                if (filters.dateRange === 'Last 30 Days' && diffDays > 30) return false;
                if (filters.dateRange === 'Last 6 Months' && diffDays > 182) return false;
                if (filters.dateRange === 'Last 1 Year' && diffDays > 365) return false;
                if (filters.dateRange === 'Older' && diffDays <= 365) return false;
            }

            return true;
        });

        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase().trim();
            result = result.filter(item => {
                return (
                    String(item.id).toLowerCase().includes(query) ||
                    String(item.name).toLowerCase().includes(query) ||
                    String(item.location).toLowerCase().includes(query) ||
                    String(item.machines).toLowerCase().includes(query) ||
                    String(item.status).toLowerCase().includes(query) ||
                    String(item.createdAt).toLowerCase().includes(query)
                );
            });
        }

        return result;
    };

    const filteredDataset = getFilteredDataset();

    const totalRecords = filteredDataset.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    const startIndex = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, totalRecords);

    // Slice data to respect current page and limit
    const paginatedDataset = filteredDataset.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > 5) {
        if (currentPage <= 3) {
            startPage = 1;
            endPage = 5;
        } else if (currentPage >= totalPages - 2) {
            startPage = totalPages - 4;
            endPage = totalPages;
        } else {
            startPage = currentPage - 2;
            endPage = currentPage + 2;
        }
    }

    const visiblePages = Array.from({ length: Math.max(0, (endPage + 1) - startPage) }, (_, i) => startPage + i);

    return (
        <div className="relative flex flex-col w-full font-['Plus_Jakarta_Sans']">
            {/* Toast Modal */}
            {toast.show && (
                <div
                    className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg flex items-center gap-2 transform transition-all duration-300 ${toast.type === 'success'
                        ? 'bg-[#DCFCE7] text-[#166534] border border-[#166534]/20'
                        : 'bg-[#FEE2E2] text-[#991B1B] border border-[#991B1B]/20'
                        }`}
                >
                    <span className="text-[14px] font-medium">{toast.message}</span>
                </div>
            )}

            <div className="bg-white rounded-[10px] md:rounded-[12px] border border-[#E5E7EB] p-[20px] md:p-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out">

                {/* Top Row Inside Card */}
                <div className="flex flex-col gap-4 mb-[20px] md:mb-[24px] relative" ref={filterContainerRef}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-[16px] font-semibold text-[#111827]">
                            Facility List
                        </h2>

                        {/* Mobile Controls (< md) */}
                        <div className="flex md:hidden items-center gap-[16px] text-[#6B7280]">
                            {/* Export */}
                            <div className="relative" ref={exportDropdownRef}>
                                <button onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)} className="flex items-center justify-center p-1">
                                    <Download size={20} className={isExportDropdownOpen ? "text-[#111827]" : ""} />
                                </button>
                                {isExportDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-[160px] bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#E5E7EB] py-[8px] z-50">
                                        <button
                                            onClick={() => { handleExportPdf(); setIsExportDropdownOpen(false); }}
                                            className="w-full text-left px-[16px] py-[10px] text-[13px] text-[#4B5563] hover:bg-gray-50 flex items-center gap-[8px]"
                                        >
                                            <FileText size={14} className="text-[#9CA3AF]" /> Export to PDF
                                        </button>
                                        <button
                                            onClick={() => { handleExportExcel(); setIsExportDropdownOpen(false); }}
                                            className="w-full text-left px-[16px] py-[10px] text-[13px] text-[#4B5563] hover:bg-gray-50 flex items-center gap-[8px]"
                                        >
                                            <FileSpreadsheet size={14} className="text-[#9CA3AF]" /> Export to Excel
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Filter */}
                            <button onClick={() => setIsFilterOpen(prev => !prev)} className="flex items-center justify-center p-1">
                                <ListFilter size={20} className={isFilterOpen ? "text-[#111827]" : ""} />
                            </button>

                            {/* Search */}
                            <button onClick={() => setIsMobileSearchOpen(prev => !prev)} className="flex items-center justify-center p-1">
                                <Search size={20} className={isMobileSearchOpen ? "text-[#111827]" : ""} />
                            </button>
                        </div>

                        {/* Desktop Controls (>= md) */}
                        <div className="hidden md:flex flex-wrap items-center gap-[12px]">
                            <button
                                onClick={handleExportExcel}
                                className="bg-[#014A36] hover:bg-[#013b2b] text-white h-[36px] md:h-[38px] px-[16px] rounded-[8px] text-[14px] font-medium transition-colors whitespace-nowrap"
                            >
                                Export Excel
                            </button>
                            <button
                                onClick={handleExportPdf}
                                className="bg-[#014A36] hover:bg-[#013b2b] text-white h-[36px] md:h-[38px] px-[16px] rounded-[8px] text-[14px] font-medium transition-colors whitespace-nowrap"
                            >
                                Export PDF
                            </button>

                            <div>
                                <button
                                    onClick={() => setIsFilterOpen(prev => !prev)}
                                    className={`h-[36px] md:h-[38px] px-[14px] rounded-[8px] text-[14px] font-medium flex items-center gap-2 transition-colors whitespace-nowrap border ${isFilterOpen
                                        ? 'bg-gray-100 border-[#D1D5DB] text-[#111827]'
                                        : 'bg-[#F9FAFB] border-[#E5E7EB] hover:bg-gray-100 text-[#4B5563]'
                                        }`}
                                >
                                    Filter by <ChevronDown size={16} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180 text-[#4B5563]' : 'rotate-0 text-[#9CA3AF]'}`} />
                                </button>
                            </div>

                            <div className="relative w-[220px]">
                                <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
                                    <Search size={16} className="text-[#9CA3AF]" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search facility"
                                    className="w-full h-[36px] md:h-[38px] pl-[36px] pr-[12px] border border-[#E5E7EB] rounded-[8px] text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder-[#9CA3AF]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Input Expansion */}
                    {isMobileSearchOpen && (
                        <div className="md:hidden w-full relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
                                <Search size={16} className="text-[#9CA3AF]" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search facility"
                                className="w-full h-[40px] pl-[36px] pr-[12px] border border-[#E5E7EB] rounded-[8px] text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder-[#9CA3AF]"
                                autoFocus
                            />
                        </div>
                    )}

                    <FilterPopupFacility
                        isOpen={isFilterOpen}
                        filters={filters}
                        setFilters={(val) => {
                            setFilters(val);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                        <thead>
                            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                                <th className="py-[14px] px-[16px] text-[13px] font-medium text-[#6B7280] w-[60px] first:pl-[8px]">Sr.</th>
                                <th className="py-[14px] px-[16px] text-[13px] font-medium text-[#6B7280]">Facility Name</th>
                                <th className="py-[14px] px-[16px] text-[13px] font-medium text-[#6B7280]">Location</th>
                                <th className="py-[14px] px-[16px] text-[13px] font-medium text-[#6B7280]">Total Production Machine</th>
                                <th className="py-[14px] px-[16px] text-[13px] font-medium text-[#6B7280]">Status</th>
                                <th className="py-[14px] px-[16px] text-[13px] font-medium text-[#6B7280]">Created At</th>
                                <th className="py-[14px] px-[16px] text-[13px] font-medium text-[#6B7280] text-center w-[80px] last:pr-[8px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className={`text-[13px] text-[#4B5563] transition-all duration-300 ease-in-out`}>
                            {paginatedDataset.length > 0 ? (
                                paginatedDataset.map((row) => (
                                    <tr key={row.id} className="border-b border-[#F3F4F6] last:border-b-0 hover:bg-gray-50/50 transition-colors group">
                                        <td className="h-[48px] md:h-[52px] px-[16px] whitespace-nowrap first:pl-[8px] align-middle">{row.id}</td>
                                        <td className="h-[48px] md:h-[52px] px-[16px] whitespace-nowrap text-[#111827] font-medium align-middle">{row.name}</td>
                                        <td className="h-[48px] md:h-[52px] px-[16px] whitespace-nowrap align-middle">{row.location}</td>
                                        <td className="h-[48px] md:h-[52px] px-[16px] whitespace-nowrap align-middle">{row.machines}</td>
                                        <td className="h-[48px] md:h-[52px] px-[16px] whitespace-nowrap align-middle">
                                            {row.status === 'Active' ? (
                                                <span className="inline-flex items-center justify-center px-[10px] py-[4px] text-[12px] font-medium rounded-[20px] bg-[#E0F2E9] text-[#014A36]">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center px-[10px] py-[4px] text-[12px] font-medium rounded-[20px] bg-gray-100 text-gray-600">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="h-[48px] md:h-[52px] px-[16px] whitespace-nowrap align-middle text-[#6B7280]">{row.createdAt}</td>
                                        <td className="h-[48px] md:h-[52px] px-[16px] whitespace-nowrap align-middle text-center last:pr-[8px]">
                                            <ActionMenu />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-[40px] text-center text-[14px] text-[#6B7280]">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Terminal Boundary Line */}
                <div className="w-full bg-[#E5E7EB] h-[1px]"></div>

                {/* Bottom Pagination Section */}
                <div className="flex items-center justify-between mt-[20px] md:mt-[24px]">
                    {/* Left: Show per page */}
                    <div className="flex items-center gap-[8px] text-[13px] text-[#4B5563]">
                        <span className="hidden md:inline">Show</span>
                        <div className="relative border border-[#E5E7EB] rounded-[6px] h-[32px] min-w-[50px] bg-white transition-colors" ref={rowsDropdownRef}>
                            <div
                                onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                                className="w-full h-full px-[8px] flex items-center justify-between cursor-pointer hover:border-[#D1D5DB]"
                            >
                                <span className="text-[13px] text-[#111827] mr-2">{rowsPerPage}</span>
                                <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform duration-200 ${isRowsDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </div>

                            {isRowsDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-[#E5E7EB] rounded-[6px] shadow-lg overflow-hidden z-50 py-[4px]">
                                    {[5, 10, 25, 50].map(option => (
                                        <div
                                            key={option}
                                            onClick={() => {
                                                setRowsPerPage(option);
                                                setCurrentPage(1);
                                                setIsRowsDropdownOpen(false);
                                            }}
                                            className={`px-[8px] py-[6px] text-[13px] cursor-pointer hover:bg-gray-50 flex justify-center ${rowsPerPage === option ? 'bg-gray-50 font-medium text-[#111827]' : 'text-[#4B5563]'}`}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span className="hidden md:inline">per page</span>
                    </div>

                    {/* Right: Pagination */}
                    <div className="flex items-center gap-[6px] md:gap-[12px] text-[13px] text-[#6B7280]">
                        <span className="hidden md:inline mr-2">{startIndex}-{endIndex} of {totalRecords}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || totalRecords === 0}
                            className={`transition-colors p-1 flex items-center justify-center ${currentPage === 1 || totalRecords === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#111827] cursor-pointer'}`}
                        >
                            <ArrowLeft size={14} />
                        </button>

                        {visiblePages.map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`transition-colors w-[24px] h-[24px] flex items-center justify-center rounded-[4px] ${currentPage === page
                                    ? 'bg-[#F3F4F6] text-[#111827] font-medium'
                                    : 'hover:text-[#111827] cursor-pointer'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalRecords === 0}
                            className={`transition-colors p-1 flex items-center justify-center ${currentPage === totalPages || totalRecords === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#111827] cursor-pointer'}`}
                        >
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FacilityTable;
