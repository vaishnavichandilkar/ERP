import React from 'react';
import { ChevronDown } from 'lucide-react';

const StatCard = ({ title, value }) => (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300 flex flex-col justify-between min-h-[130px]">
        <h3 className="text-[#111827] text-[15px] font-medium font-['Plus_Jakarta_Sans']">
            {title}
        </h3>
        <p className="text-[#111827] text-[32px] font-medium font-['Plus_Jakarta_Sans'] leading-none">
            {value}
        </p>
    </div>
);

const Home = () => {
    return (
        <div className="flex flex-col w-full max-w-[1400px] mx-auto">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 pt-2">
                <div>
                    <h1 className="text-[26px] font-bold text-[#111827] mb-1.5 tracking-tight font-['Plus_Jakarta_Sans']">
                        Welcome <span className="text-[#6B7280] font-normal">Sahil !</span>
                    </h1>
                    <p className="text-[#111827] text-[14px] font-medium">
                        Track, manage and forecast your customer and orders.
                    </p>
                </div>

                <button className="flex items-center gap-2 bg-white border border-[#E5E7EB] px-4 py-2.5 rounded-lg text-[14px] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm self-start">
                    Filter by <ChevronDown size={18} className="text-gray-400" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                <StatCard title="Total Stock" value="0 kg" />
                <StatCard title="To Deliver" value="0 kg" />
                <StatCard title="Booking" value="0" />
                <StatCard title="Total Outstanding" value="₹ 0 L" />
            </div>
        </div>
    );
};

export default Home;
