import React, { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddFacility = () => {
    const [statusOpen, setStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('Active');

    return (
        <div className="flex-1 w-full bg-[#ffffff] min-h-screen">
            <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-[22px] font-bold text-[#111827] mb-1.5 tracking-tight">Add Facility</h1>
                    <p className="text-[14px] text-gray-500">
                        Add a new facility by entering the required information below.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[12px] border border-[#e5e7eb] shadow-[0_1px_3px_rgb(0,0,0,0.05)] w-full">
                    <div className="px-6 py-4 border-b border-[#e5e7eb]">
                        <h2 className="text-[16px] font-semibold text-gray-900">Add Facility</h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                            {/* Facility Name */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[14px] font-medium text-gray-800">
                                    Facility Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Plant 1"
                                    placeholder="Facility Name"
                                    className="px-3.5 py-2.5 bg-white border border-[#e5e7eb] rounded-lg text-[14px] focus:outline-none focus:ring-1 focus:ring-[#014A36] focus:border-[#014A36] text-[#111827] placeholder:text-gray-400"
                                />
                            </div>

                            {/* Location */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[14px] font-medium text-gray-800">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Satara"
                                    placeholder="Location"
                                    className="px-3.5 py-2.5 bg-white border border-[#e5e7eb] rounded-lg text-[14px] focus:outline-none focus:ring-1 focus:ring-[#014A36] focus:border-[#014A36] text-[#111827] placeholder:text-gray-400"
                                />
                            </div>

                            {/* Address */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[14px] font-medium text-gray-800">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Satara"
                                    placeholder="Address"
                                    className="px-3.5 py-2.5 bg-white border border-[#e5e7eb] rounded-lg text-[14px] focus:outline-none focus:ring-1 focus:ring-[#014A36] focus:border-[#014A36] text-[#111827] placeholder:text-gray-400"
                                />
                            </div>

                            {/* Total Production Machine */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[14px] font-medium text-gray-800">
                                    Total Production Machine <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    defaultValue="8"
                                    placeholder="Total Machine"
                                    className="px-3.5 py-2.5 bg-white border border-[#e5e7eb] rounded-lg text-[14px] focus:outline-none focus:ring-1 focus:ring-[#014A36] focus:border-[#014A36] text-[#111827] placeholder:text-gray-400"
                                />
                            </div>

                            {/* GST Number */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[14px] font-medium text-gray-800">
                                    GST Number
                                </label>
                                <input
                                    type="text"
                                    defaultValue="27ABCDE1234F275"
                                    placeholder="GST Number"
                                    className="px-3.5 py-2.5 bg-white border border-[#e5e7eb] rounded-lg text-[14px] focus:outline-none focus:ring-1 focus:ring-[#014A36] focus:border-[#014A36] text-[#111827] placeholder:text-gray-400"
                                />
                            </div>

                            {/* Status */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-[14px] font-medium text-gray-800">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <div
                                    className={`flex items-center justify-between px-3.5 py-2.5 bg-white border ${statusOpen ? 'border-[#014A36] ring-1 ring-[#014A36]' : 'border-[#e5e7eb]'} rounded-lg cursor-pointer`}
                                    onClick={() => setStatusOpen(!statusOpen)}
                                >
                                    <span className="text-[14px] text-[#111827]">
                                        {selectedStatus || 'Select status'}
                                    </span>
                                    <ChevronDown size={18} className={`text-gray-600 transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Custom Dropdown Menu matching the image precisely */}
                                {statusOpen && (
                                    <div className="absolute top-[82px] left-0 w-full bg-white border border-gray-100 shadow-[0_4px_16px_rgb(0,0,0,0.08)] rounded-xl overflow-hidden z-20 py-1.5 px-1.5">
                                        <div
                                            className="px-3 py-2.5 hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors bg-gray-100 text-[#111827] mb-1"
                                            onClick={() => { setSelectedStatus('Active'); setStatusOpen(false); }}
                                        >
                                            <Clock size={16} className="text-[#374151]" />
                                            <span className="text-[14px] font-medium">Active</span>
                                        </div>
                                        <div
                                            className="px-3 py-2.5 hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors text-[#374151]"
                                            onClick={() => { setSelectedStatus('Inactive'); setStatusOpen(false); }}
                                        >
                                            <Clock size={16} className="text-[#84CC16]" />
                                            <span className="text-[14px] font-medium text-[#4B5563]">Inactive</span>
                                            {/* (Looking closely at image, I see a clock icon next to Inactive too) */}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-8">
                            <button className="px-6 py-2.5 bg-[#014A36] hover:bg-[#013b2b] text-white text-[14px] font-medium rounded-lg shadow-sm transition-colors">
                                Add Facility
                            </button>
                            <Link to="/dashboard/facility">
                                <button className="px-6 py-2.5 bg-white border border-[#e5e7eb] hover:bg-gray-50 text-[#111827] text-[14px] font-medium rounded-lg shadow-sm transition-colors">
                                    Back
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFacility;
