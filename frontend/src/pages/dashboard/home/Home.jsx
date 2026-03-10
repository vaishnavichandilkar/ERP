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
            {/* Blank Dashboard Page */}
        </div>

    );
};

export default Home;
