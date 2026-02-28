import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import FacilityTable from './components/FacilityTable';

const FacilityPage = () => {
    return (
        <div className="flex-1 w-full bg-[#ffffff] min-h-screen">
            <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#111827] mb-1.5 tracking-tight">Facility Management</h1>
                        <p className="text-[14px] text-gray-500">
                            Manage your Facility database with search, filters, exports, and easy additions.
                        </p>
                    </div>

                    <Link to="/dashboard/facility/add" className="flex items-center gap-2 bg-[#014A36] hover:bg-[#013b2b] text-white px-5 py-2.5 rounded-lg font-medium text-[14px] shadow-sm transition-all focus:ring-2 focus:ring-[#014A36]/50 whitespace-nowrap">
                        <Plus size={18} />
                        Add Facility
                    </Link>
                </div>

                {/* List Section */}
                <FacilityTable />
            </div>
        </div>
    );
};

export default FacilityPage;
