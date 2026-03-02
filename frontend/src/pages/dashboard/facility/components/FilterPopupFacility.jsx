import React from 'react';
import { Plus, Box, Calendar } from 'lucide-react';

const FilterPopupFacility = ({ isOpen, filters, setFilters }) => {
    if (!isOpen) return null;

    const toggleStatus = (status) => {
        setFilters(prev => {
            const current = prev.status;
            return {
                ...prev,
                status: current.includes(status)
                    ? current.filter(s => s !== status)
                    : [...current, status]
            };
        });
    };

    const setQuickDate = (range) => {
        setFilters(prev => ({
            ...prev,
            dateRange: prev.dateRange === range ? '' : range,
            customFrom: '',
            customTo: ''
        }));
    };

    const handleCustomDateChange = (type, value) => {
        setFilters(prev => ({
            ...prev,
            [type]: value,
            dateRange: '' // Clear quick filter if custom is used
        }));
    };

    return (
        <div
            className="absolute top-full right-0 mt-2 bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] w-[340px] p-[20px] md:p-[24px] z-50 origin-top-right transform transition-all duration-300 border border-[#E5E7EB]"
        >
            <div className="mb-[16px] md:mb-[20px]">
                <h3 className="text-[14px] md:text-[15px] font-semibold text-[#374151] mb-[12px]">Status</h3>

                <div className="grid grid-cols-2 gap-[12px] mb-[16px]">
                    {['Last 15 Days', 'Last 30 Days', 'Last 6 Months', 'Last 1 Year'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setQuickDate(range)}
                            className={`flex items-center justify-between px-[12px] py-[8px] rounded-[12px] text-[13px] transition-colors border ${filters.dateRange === range
                                    ? 'bg-[#DCFCE7]/30 text-[#166534] border-[#014A36] font-medium'
                                    : 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:bg-gray-100'
                                }`}
                        >
                            {range}
                            <Plus size={14} className={`opacity-60 ${filters.dateRange === range ? "text-[#014A36]" : "text-[#9CA3AF]"}`} />
                        </button>
                    ))}
                    <button
                        onClick={() => setQuickDate('Older')}
                        className={`col-span-1 flex items-center justify-between px-[12px] py-[8px] rounded-[12px] text-[13px] transition-colors border ${filters.dateRange === 'Older'
                                ? 'bg-[#E0F2E9] text-[#014A36] border-[#014A36] font-medium'
                                : 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:bg-gray-100'
                            }`}
                    >
                        Older
                        <Plus size={14} className={`opacity-60 ${filters.dateRange === 'Older' ? "text-[#014A36]" : "text-[#9CA3AF]"}`} />
                    </button>
                </div>

                {/* Status Toggle Buttons */}
                <div className="grid grid-cols-2 gap-[12px]">
                    <button
                        onClick={() => toggleStatus('Active')}
                        className={`flex items-center justify-center gap-[8px] py-[10px] rounded-[12px] border text-[13px] font-medium transition-colors ${filters.status.includes('Active')
                                ? 'border-[#014A36] text-[#014A36] bg-[#E0F2E9]'
                                : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50'
                            }`}
                    >
                        <Box size={16} className={filters.status.includes('Active') ? "text-[#014A36]" : "opacity-70 text-[#6B7280]"} /> Active
                    </button>
                    <button
                        onClick={() => toggleStatus('Inactive')}
                        className={`flex items-center justify-center gap-[8px] py-[10px] rounded-[12px] border text-[13px] font-medium transition-colors ${filters.status.includes('Inactive')
                                ? 'border-[#014A36] text-[#014A36] bg-[#E0F2E9]'
                                : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50'
                            }`}
                    >
                        <Box size={16} className={filters.status.includes('Inactive') ? "text-[#014A36]" : "opacity-70 text-[#6B7280]"} /> Inactive
                    </button>
                </div>
            </div>

            {/* Custom Date Range */}
            <div>
                <h3 className="text-[14px] font-semibold text-[#374151] mb-[10px]">Custom Date range</h3>
                <div className="grid grid-cols-2 gap-[12px]">
                    <div className="relative">
                        <input
                            type="date"
                            value={filters.customFrom}
                            onChange={(e) => handleCustomDateChange('customFrom', e.target.value)}
                            className={`peer w-full h-[40px] pl-[14px] pr-[42px] border border-[#E5E7EB] bg-[#F3F4F6] rounded-[12px] text-[14px] outline-none focus:border-[#014A36] focus:bg-white transition-colors relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${filters.customFrom ? 'text-[#4B5563]' : 'text-transparent focus:text-[#4B5563]'
                                }`}
                        />
                        <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none z-20">
                            <Calendar size={16} className="text-[#9CA3AF]" />
                        </div>
                        {!filters.customFrom && <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px] text-[#6B7280] pointer-events-none z-20 peer-focus:hidden">From</span>}
                    </div>

                    <div className="relative">
                        <input
                            type="date"
                            value={filters.customTo}
                            onChange={(e) => handleCustomDateChange('customTo', e.target.value)}
                            className={`peer w-full h-[40px] pl-[14px] pr-[42px] border border-[#E5E7EB] bg-[#F3F4F6] rounded-[12px] text-[14px] outline-none focus:border-[#014A36] focus:bg-white transition-colors relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${filters.customTo ? 'text-[#4B5563]' : 'text-transparent focus:text-[#4B5563]'
                                }`}
                        />
                        <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none z-20">
                            <Calendar size={16} className="text-[#9CA3AF]" />
                        </div>
                        {!filters.customTo && <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px] text-[#6B7280] pointer-events-none z-20 peer-focus:hidden">To</span>}
                    </div>
                </div>
            </div>

            {/* Clear Filters Button */}
            {(filters.dateRange || filters.status.length > 0 || filters.customFrom || filters.customTo) && (
                <button
                    onClick={() => setFilters({ dateRange: '', status: [], customFrom: '', customTo: '' })}
                    className="w-full mt-[16px] text-[13px] font-medium text-[#EF4444] hover:text-[#B91C1C] transition-colors py-[4px]"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
};

export default FilterPopupFacility;
