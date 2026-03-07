import React from 'react';
import { Filter, ArrowUpRight, ArrowDownRight, ChevronDown } from 'lucide-react';

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



const Home = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const firstName = user.first_name || 'Seller';

    return (
        <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-10">
            {/* Header section */}
            <div className="flex items-center justify-between mb-5 md:mb-8 pt-1">
                <div>
                    <h1 className="text-[20px] md:text-[26px] font-bold text-[#111827] mb-1 tracking-tight font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
                        Welcome <span className="text-[#0B3D2E] font-medium">{firstName} !</span>
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

        </div>

    );
};

export default Home;
