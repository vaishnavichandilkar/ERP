import React from 'react';
import { Filter, ArrowUpRight, ArrowDownRight, Download, Search, ChevronDown, ArrowLeft, ArrowRight, ChevronsUpDown } from 'lucide-react';

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

const DashboardTable = ({ title, columns, data }) => {
    return (
        <div className="bg-white rounded-[10px] md:rounded-[12px] border border-[#E5E7EB] mt-4 overflow-hidden flex flex-col font-['Plus_Jakarta_Sans']">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
                <h3 className="text-[#111827] text-[13px] md:text-[16px] font-bold">{title}</h3>
                <div className="flex gap-3">
                    <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                        <Download size={16} strokeWidth={2} />
                    </button>
                    <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                        <Search size={16} strokeWidth={2} />
                    </button>
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
                    <tbody className="text-[10px] md:text-[13px] text-[#4B5563]">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-gray-50/50">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="p-3 md:p-4 border-r border-[#E5E7EB] last:border-r-0 whitespace-nowrap">
                                        {row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Progress bar line above pagination */}
            <div className="h-1.5 w-full bg-[#E5E7EB]">
                <div className="h-full bg-[#A7C0B8] w-[70%]"></div>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 md:p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="relative border border-[#E5E7EB] rounded-[6px] px-2 py-1 flex items-center justify-between min-w-[45px] bg-[#F9FAFB] cursor-pointer">
                    <span className="text-[11px] md:text-[12px] text-[#4B5563]">3</span>
                    <ChevronDown size={14} className="text-[#9CA3AF]" />
                </div>

                <div className="flex items-center gap-3 text-[11px] md:text-[12px] text-[#9CA3AF] font-medium">
                    <button className="hover:text-[#111827]"><ArrowLeft size={14} /></button>
                    <button className="hover:text-[#111827]">1</button>
                    <button className="w-[20px] h-[20px] rounded bg-[#F9FAFB] text-[#111827] flex items-center justify-center font-bold">2</button>
                    <button className="hover:text-[#111827]">3</button>
                    <button className="hover:text-[#111827]">4</button>
                    <button className="hover:text-[#111827]">5</button>
                    <button className="hover:text-[#111827] text-[#111827]"><ArrowRight size={14} /></button>
                </div>
            </div>
        </div>
    );
};

const productColumns = [
    { title: 'Product name', key: 'name', sortable: false },
    { title: 'Category', key: 'category', sortable: true },
    { title: 'Seller name / ID', key: 'seller', sortable: false }
];

const productData = [
    { name: 'Hybrid Wheat', category: 'Seeds', seller: 'Ravi Agro / SEL...' },
    { name: 'NPK Fertilizer', category: 'Seeds', seller: 'Ravi Agro / SEL...' },
    { name: 'Organic Seeds', category: 'Seeds', seller: 'Ravi Agro / SEL...' }
];

const customerColumns = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Customer Name', key: 'name', sortable: true },
    { title: 'Mobile', key: 'mobile', sortable: true }
];

const customerData = [
    { id: 'GM00001', name: 'Mahadev Patil', mobile: '709854763...' },
    { id: 'GM00002', name: 'Prasad Vhanji', mobile: '709854763...' }
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
            <DashboardTable title="New Products added" columns={productColumns} data={productData} />
            <DashboardTable title="New Customer added" columns={customerColumns} data={customerData} />
        </div>
    );
};

export default Home;
