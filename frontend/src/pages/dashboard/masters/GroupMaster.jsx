import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import AddGroupModal from './components/AddGroupModal';

const GroupMaster = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const leftPanelData = {
        title: 'Expenses & Costs',
        sections: [
            {
                name: 'Direct Expense',
                items: ['Light Bill', 'Labour Charges']
            },
            {
                name: 'Indirect Expense',
                items: ['Bank Charges', 'Company Promotions']
            },
            {
                name: 'Purchase',
                items: ['Light Bill', 'Labour Charges']
            },
            {
                name: 'Opening Stock',
                items: ['Product-Opening Stock', 'Store-Opening Stock']
            }
        ]
    };

    const rightPanelData = {
        title: 'Revenue & Income',
        sections: [
            {
                name: 'Direct Sale',
                items: ['Light Bill', 'Labour Charges']
            },
            {
                name: 'Indirect Sale',
                items: ['Light Bill', 'Labour Charges']
            },
            {
                name: 'Sale',
                items: ['Light Bill', 'Labour Charges']
            },
            {
                name: 'Closing Stock',
                items: ['Product-Closing Stock', 'Store-Closing Stock']
            }
        ]
    };

    const MasterSection = ({ data }) => (
        <div className="flex-1 bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden shadow-sm">
            <div className="bg-[#F9FAFB] p-4 border-b border-[#E5E7EB]">
                <h3 className="text-[16px] font-bold text-[#111827]">{data.title}</h3>
            </div>
            <div className="flex flex-col">
                {data.sections.map((section, idx) => (
                    <div key={idx} className="flex flex-col border-b border-[#E5E7EB] last:border-b-0">
                        <div className="flex items-center gap-2 p-3.5 bg-gray-50/30">
                            <div className="w-4 h-px bg-gray-400"></div>
                            <span className="text-[14px] font-bold text-[#4B5563]">{section.name}</span>
                        </div>
                        <div className="flex flex-col bg-white">
                            {section.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="p-3.5 pl-10 border-t border-[#F3F4F6] text-[13px] text-[#6B7280] font-medium transition-colors hover:bg-gray-50/50">
                                    <span className="mr-2 text-gray-400">{itemIdx + 1}.</span> {item}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by anything"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-[44px] bg-white border border-[#E5E7EB] rounded-[8px] pl-10 pr-4 text-[14px] outline-none focus:border-[#014A36] transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 h-[44px] border border-[#E5E7EB] rounded-[8px] text-[14px] font-semibold text-[#4B5563] hover:bg-gray-50 transition-colors bg-white">
                        <Download size={18} className="text-gray-400" />
                        Export
                    </button>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto px-6 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all shadow-sm flex items-center justify-center"
                >
                    Add Type
                </button>
            </div>

            {/* Content Panels */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
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
