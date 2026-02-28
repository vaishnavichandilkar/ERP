import React from 'react';
import { ChevronDown, Search } from 'lucide-react';
import ActionMenu from './ActionMenu';
import Pagination from './Pagination';

const dummyData = [
    { id: 1, name: 'Plant 1', location: 'Gadhinglaj', machines: 8, status: 'Active', createdAt: '2016-07-00 11:05' },
    { id: 2, name: 'Plant 2', location: 'Pune', machines: 4, status: 'Active', createdAt: '2016-07-00 11:05' },
    { id: 3, name: 'Plant 3', location: 'Mumbai', machines: 5, status: 'Active', createdAt: '2016-07-00 11:05' },
    { id: 4, name: 'Plant 4', location: 'Nashik', machines: 9, status: 'Inactive', createdAt: '2016-07-00 11:05' },
    { id: 5, name: 'Plant 5', location: 'Satara', machines: 6, status: 'Active', createdAt: '2016-07-00 11:05' },
];

const FacilityTable = () => {
    return (
        <div className="bg-white rounded-[12px] border border-[#e5e7eb] shadow-sm flex flex-col">
            {/* Table Header Controls */}
            <div className="p-5 flex flex-col xl:flex-row justify-between xl:items-center gap-4 border-b border-gray-100">
                <h2 className="text-[17px] font-semibold text-gray-900">Facility List</h2>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button className="px-3.5 py-2 text-[13px] font-medium text-white bg-[#014A36] rounded-md hover:bg-[#013b2b] transition-colors">
                        Export Excel
                    </button>
                    <button className="px-3.5 py-2 text-[13px] font-medium text-white bg-[#014A36] rounded-md hover:bg-[#013b2b] transition-colors">
                        Export PDF
                    </button>

                    <div className="relative">
                        <select className="appearance-none pl-4 pr-9 py-2 border border-gray-200 rounded-md text-[13px] text-gray-600 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#014A36] cursor-pointer">
                            <option>Filter by</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                            <ChevronDown size={14} />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <Search size={14} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search facility"
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-[13px] w-full sm:w-[220px] focus:outline-none focus:ring-1 focus:ring-[#014A36] transition-shadow placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                    <thead>
                        <tr className="bg-white border-b border-gray-100">
                            <th className="py-3.5 px-6 text-[13px] font-medium text-gray-500 w-[60px]">Sr.</th>
                            <th className="py-3.5 px-6 text-[13px] font-medium text-gray-500">Facility Name</th>
                            <th className="py-3.5 px-6 text-[13px] font-medium text-gray-500">Location</th>
                            <th className="py-3.5 px-6 text-[13px] font-medium text-gray-500">Total Production Machine</th>
                            <th className="py-3.5 px-6 text-[13px] font-medium text-gray-500">Status</th>
                            <th className="py-3.5 px-6 text-[13px] font-medium text-gray-500">Created At</th>
                            <th className="py-3.5 px-6 text-[13px] font-medium text-gray-500 text-center w-[80px]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {dummyData.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-4 px-6 text-[13px] text-gray-500 font-medium">{row.id}</td>
                                <td className="py-4 px-6 text-[13px] text-gray-900 font-medium">{row.name}</td>
                                <td className="py-4 px-6 text-[13px] text-gray-600">{row.location}</td>
                                <td className="py-4 px-6 text-[13px] text-gray-600">{row.machines}</td>
                                <td className="py-4 px-6 text-[13px]">
                                    {row.status === 'Active' ? (
                                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-[#E0F2E9] text-[#014A36]">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-600">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-[13px] text-gray-500">{row.createdAt}</td>
                                <td className="py-4 px-6 text-center">
                                    <ActionMenu />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Container */}
            <Pagination />
        </div>
    );
};

export default FacilityTable;
