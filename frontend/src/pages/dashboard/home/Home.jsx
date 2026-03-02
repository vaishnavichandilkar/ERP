import React, { useState, useRef, useEffect } from 'react';
import { Filter, ArrowUpRight, ArrowDownRight, Download, Search, ChevronDown, ArrowLeft, ArrowRight, ChevronsUpDown } from 'lucide-react';
import ActionMenu from '../facility/components/ActionMenu';

const StatCard = ({ title, value, trend, percentage }) => {
    const isUp = trend === 'up';
    return (
        <div className="bg-white rounded-[8px] md:rounded-[12px] border border-[#E5E7EB] p-3 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow duration-300 flex flex-col justify-between min-h-[105px] md:min-h-[130px]">
            <h3 className="text-[#111827] text-[11px] md:text-[15px] font-semibold md:font-medium font-['Plus_Jakarta_Sans'] mb-1 md:mb-2">
                {title}
            </h3>
            <p className="text-[#111827] text-[18px] md:text-[32px] font-semibold md:font-medium font-['Plus_Jakarta_Sans'] leading-tight mb-2">
                {value}
            </p>
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1">
                    {isUp ? (
                        <ArrowUpRight size={13} className="text-[#22C55E]" strokeWidth={3} />
                    ) : (
                        <ArrowDownRight size={13} className="text-[#EF4444]" strokeWidth={3} />
                    )}
                    <span className={`text-[9px] md:text-[12px] font-bold ${isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                        {percentage}
                        <span className="text-[#9CA3AF] font-normal ml-0.5 md:ml-1">vs last month</span>
                    </span>
                </div>
                {/* Embedded tiny SVG chart */}
                <div className="w-[30px] md:w-[40px] h-[14px] md:h-[20px]">
                    {isUp ? (
                        <svg viewBox="0 0 40 20" className="w-full h-full text-[#22C55E]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="0,15 10,12 20,15 35,5"></polyline>
                            <polyline points="35,5 40,6"></polyline>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 40 20" className="w-full h-full text-[#EF4444]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="0,5 15,10 25,6 35,16"></polyline>
                            <polyline points="35,16 40,14"></polyline>
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
};

const DashboardTable = ({ title, columns, data, searchPlaceholder, hideDownload }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);
    const rowsDropdownRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data;
        const query = searchQuery.toLowerCase();
        return data.filter(row =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(query)
            )
        );
    }, [data, searchQuery]);

    const totalRecords = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

    const startIndex = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, totalRecords);

    const paginatedDataset = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentPage(newPage);
                setIsAnimating(false);
            }, 150); // half of transition
        }
    };

    const handleRowsChange = (newRows) => {
        if (newRows !== rowsPerPage) {
            setIsAnimating(true);
            setTimeout(() => {
                setRowsPerPage(newRows);
                setCurrentPage(1);
                setIsRowsDropdownOpen(false);
                setIsAnimating(false);
            }, 150);
        } else {
            setIsRowsDropdownOpen(false);
        }
    };

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

    // Visible Pages logic
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
        <div className="bg-white rounded-[10px] md:rounded-[12px] border border-[#E5E7EB] mt-4 overflow-hidden flex flex-col font-['Plus_Jakarta_Sans'] transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
                <h3 className="text-[#111827] text-[13px] md:text-[16px] font-bold">{title}</h3>
                <div className="flex gap-3 items-center">
                    {searchPlaceholder ? (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
                                <Search size={14} className="text-[#9CA3AF]" />
                            </div>
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-[36px] min-w-[140px] w-full md:w-[200px] pl-[34px] pr-[12px] border border-[#E5E7EB] bg-[#F9FAFB] rounded-[8px] text-[13px] outline-none focus:border-[#014A36] transition-all placeholder-[#9CA3AF]"
                            />
                        </div>
                    ) : (
                        <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors focus:outline-none">
                            <Search size={16} strokeWidth={2} />
                        </button>
                    )}
                    {!hideDownload && (
                        <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors focus:outline-none">
                            <Download size={16} strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[300px]">
                    <thead>
                        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                            {columns.map((col, idx) => (
                                <th key={idx} className="p-3 md:p-4 text-[10px] md:text-[13px] font-medium text-[#6B7280] whitespace-nowrap border-r border-[#E5E7EB] last:border-r-0">
                                    <div className="flex items-center gap-1">
                                        {col.title}
                                        {col.sortable && <ChevronsUpDown size={12} className="opacity-60" />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={`text-[10px] md:text-[13px] text-[#4B5563] transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                        {paginatedDataset.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-gray-50/50 transition-colors">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="p-3 md:p-4 border-r border-[#E5E7EB] last:border-r-0 whitespace-nowrap h-[44px] md:h-[53px]">
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {/* Edge case: empty state */}
                        {totalRecords === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="py-[40px] text-center text-[#9CA3AF] align-middle">
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Terminal Boundary Line */}
            <div className="w-full bg-[#E5E7EB] h-[1px]"></div>

            {/* Pagination Footer */}
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: Show per page and Mobile Count */}
                <div className="flex items-center gap-3 text-[12px] md:text-[13px] text-[#4B5563] w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2">
                        <span>Show</span>
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
                                    {[3, 5, 10].map(option => (
                                        <div
                                            key={option}
                                            onClick={() => handleRowsChange(option)}
                                            className={`px-[8px] py-[6px] text-[13px] cursor-pointer hover:bg-gray-50 flex justify-center ${rowsPerPage === option ? 'bg-gray-50 font-medium text-[#111827]' : 'text-[#4B5563]'}`}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span>per page</span>
                    </div>
                    {/* Mobile Only Count */}
                    <span className="sm:hidden text-[#6B7280]">
                        {startIndex}-{endIndex} of {totalRecords}
                    </span>
                </div>

                {/* Right: Desktop Count & Navigation Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-3 text-[12px] md:text-[13px] text-[#6B7280] w-full sm:w-auto">
                    {/* Desktop Only Count */}
                    <span className="hidden sm:inline mr-2">{startIndex}-{endIndex} of {totalRecords}</span>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || totalRecords === 0}
                            className={`transition-colors p-1.5 flex items-center justify-center rounded-md focus:outline-none ${currentPage === 1 || totalRecords === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:text-[#111827] cursor-pointer'}`}
                        >
                            <ArrowLeft size={16} />
                        </button>

                        {visiblePages.map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`transition-colors w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] flex items-center justify-center rounded-[6px] focus:outline-none ${currentPage === page
                                    ? 'bg-[#F3F4F6] text-[#111827] font-bold'
                                    : 'hover:bg-gray-50 hover:text-[#111827] cursor-pointer font-medium'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalRecords === 0}
                            className={`transition-colors p-1.5 flex items-center justify-center rounded-md focus:outline-none ${currentPage === totalPages || totalRecords === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:text-[#111827] cursor-pointer'}`}
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const productColumns = [
    { title: 'Product name', key: 'name', sortable: true },
    { title: 'Category', key: 'category', sortable: true },
    { title: 'Seller name / ID', key: 'seller', sortable: true },
    {
        title: 'Status', key: 'status', sortable: true, render: (row) => {
            if (row.status === 'Approved') {
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#027A48] w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#12B76A]"></div>
                        <span className="text-[12px] font-medium">Approved</span>
                    </div>
                )
            } else {
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFAEB] text-[#B54708] w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F79009]"></div>
                        <span className="text-[12px] font-medium">Pending</span>
                    </div>
                )
            }
        }
    },
    { title: 'Uploaded on', key: 'uploadedOn', sortable: true },
    { title: '', key: 'action', sortable: false, render: () => <ActionMenu /> }
];

// Extended product data to test pagination
const productData = [
    { name: 'Hybrid Wheat', category: 'Seeds', seller: 'Ravi Agro / SELL1023', status: 'Approved', uploadedOn: '05-May-2025' },
    { name: 'NPK Fertilizer', category: 'Seeds', seller: 'Ravi Agro / SELL1023', status: 'Pending', uploadedOn: '05-May-2025' },
    { name: 'Organic Seeds', category: 'Seeds', seller: 'Ravi Agro / SELL1023', status: 'Approved', uploadedOn: '05-May-2025' },
    { name: 'Premium Sorghum', category: 'Seeds', seller: 'Ravi Agro / SELL1023', status: 'Approved', uploadedOn: '06-May-2025' },
    { name: 'Urea Fertilizer', category: 'Fertilizer', seller: 'Godrej / SELL1024', status: 'Approved', uploadedOn: '06-May-2025' },
    { name: 'Cotton Seeds', category: 'Seeds', seller: 'Kisan / SELL1025', status: 'Pending', uploadedOn: '07-May-2025' },
    { name: 'Bio Pesticide', category: 'Chemicals', seller: 'Agro Protect / SELL1026', status: 'Approved', uploadedOn: '07-May-2025' },
    { name: 'Soybean Pend', category: 'Cattle Feed', seller: 'NutriFeed / SELL1027', status: 'Approved', uploadedOn: '08-May-2025' },
    { name: 'Murgas', category: 'Cattle Feed', seller: 'Local Mill / SELL1028', status: 'Pending', uploadedOn: '08-May-2025' },
    { name: 'Zinc Sulphate', category: 'Fertilizer', seller: 'Ravi Agro / SELL1029', status: 'Approved', uploadedOn: '09-May-2025' },
    { name: 'Maize Seeds', category: 'Seeds', seller: 'Mahyco / SELL1030', status: 'Approved', uploadedOn: '09-May-2025' },
    { name: 'Super Phosphate', category: 'Fertilizer', seller: 'IFFCO / SELL1031', status: 'Pending', uploadedOn: '10-May-2025' }
];

const customerColumns = [
    { title: 'Customer Name', key: 'name', sortable: true },
    { title: 'Mobile', key: 'mobile', sortable: true },
    { title: 'ID', key: 'id', sortable: true },
    {
        title: 'Status', key: 'status', sortable: true, render: (row) => {
            if (row.status === 'Active') {
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#027A48] w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#12B76A]"></div>
                        <span className="text-[12px] font-medium">Active</span>
                    </div>
                )
            } else {
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F2F4F7] text-[#344054] w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#98A2B3]"></div>
                        <span className="text-[12px] font-medium">Inactive</span>
                    </div>
                )
            }
        }
    },
    { title: 'Added on', key: 'addedOn', sortable: true },
    { title: '', key: 'action', sortable: false, render: () => <ActionMenu /> }
];

// Extended customer data to test pagination
const customerData = [
    { id: 'GM00001', name: 'Mahadev Patil', mobile: '709854763...', status: 'Active', addedOn: '01-May-2025' },
    { id: 'GM00002', name: 'Prasad Vhanji', mobile: '709854763...', status: 'Active', addedOn: '02-May-2025' },
    { id: 'GM00003', name: 'Vilas Jadhav', mobile: '908765432...', status: 'Inactive', addedOn: '02-May-2025' },
    { id: 'GM00004', name: 'Sambhaji Bhosale', mobile: '887766554...', status: 'Active', addedOn: '03-May-2025' },
    { id: 'GM00005', name: 'Anand Shinde', mobile: '998877665...', status: 'Active', addedOn: '04-May-2025' },
    { id: 'GM00006', name: 'Prakash Rane', mobile: '776655443...', status: 'Inactive', addedOn: '05-May-2025' },
    { id: 'GM00007', name: 'Dattu More', mobile: '889900112...', status: 'Active', addedOn: '06-May-2025' },
    { id: 'GM00008', name: 'Rajendra Pawar', mobile: '901234567...', status: 'Active', addedOn: '07-May-2025' },
    { id: 'GM00009', name: 'Kishore Kulkarni', mobile: '789012345...', status: 'Inactive', addedOn: '08-May-2025' },
    { id: 'GM00010', name: 'Vishal Joshi', mobile: '890123456...', status: 'Active', addedOn: '09-May-2025' },
    { id: 'GM00011', name: 'Ramesh Naik', mobile: '701234567...', status: 'Active', addedOn: '10-May-2025' },
];

const Home = () => {
    return (
        <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-10">
            {/* Header section */}
            <div className="flex items-center justify-between mb-5 md:mb-8 pt-1">
                <div>
                    <h1 className="text-[20px] md:text-[26px] font-bold text-[#111827] mb-1 tracking-tight font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
                        Welcome <span className="text-[#0B3D2E] font-medium">Sahil !</span>
                    </h1>
                    <p className="text-[#9CA3AF] text-[10px] md:text-[14px] font-medium max-w-[280px] md:max-w-none leading-[1.3]">
                        Track, manage and forecast your customer and orders.
                    </p>
                </div>

                {/* Mobile Filter Funnel icon */}
                <button className="lg:hidden p-1.5 text-[#6B7280] hover:text-[#111827] transition-colors focus:outline-none shrink-0 self-start mt-1">
                    <Filter size={20} strokeWidth={1.5} />
                </button>

                {/* Desktop Filter Button */}
                <button className="hidden lg:flex items-center gap-2 bg-white border border-[#E5E7EB] px-4 py-2.5 rounded-lg text-[14px] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm self-start">
                    Filter by <ChevronDown size={18} className="text-gray-400" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                <StatCard title="Total Stock" value="18000 kg" trend="up" percentage="20%" />
                <StatCard title="To Deliver" value="15000 kg" trend="down" percentage="10%" />
                <StatCard title="Booking" value="1486" trend="up" percentage="30%" />
                <StatCard title="Total Outstanding" value="₹ 4.2 L" trend="down" percentage="15%" />
            </div>

            {/* Tables Area */}
            <DashboardTable title="New products added" columns={productColumns} data={productData} searchPlaceholder="Search products" hideDownload={true} />
            <DashboardTable title="New customers added" columns={customerColumns} data={customerData} searchPlaceholder="Search customers" hideDownload={true} />
        </div>
    );
};

export default Home;
