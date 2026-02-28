import React from 'react';
import { Link } from 'react-router-dom';

const ViewFacility = () => {
    return (
        <div className="flex-1 w-full bg-[#ffffff] min-h-screen">
            <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#111827] mb-1.5 tracking-tight">View facility</h1>
                        <p className="text-[14px] text-gray-500">
                            View facility details
                        </p>
                    </div>
                    <Link to="/dashboard/facility">
                        <button className="px-5 py-2.5 bg-white border border-[#e5e7eb] hover:bg-gray-50 text-[#111827] text-[14px] font-medium rounded-lg shadow-sm transition-colors">
                            Back
                        </button>
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[12px] border border-[#e5e7eb] shadow-sm w-full">
                    <div className="px-6 py-4 border-b border-[#e5e7eb]">
                        <h2 className="text-[16px] font-semibold text-gray-900">View facility</h2>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col">

                            {/* Row 1: Facility Name */}
                            <div className="flex items-center py-4 border-b border-gray-100">
                                <div className="w-[30%] min-w-[200px] text-[14px] text-gray-500 font-medium">Facility Name</div>
                                <div className="flex-1 text-[14px] text-[#111827]">Plant 1</div>
                            </div>

                            {/* Row 2: Location */}
                            <div className="flex items-center py-4 border-b border-gray-100">
                                <div className="w-[30%] min-w-[200px] text-[14px] text-gray-500 font-medium">Location</div>
                                <div className="flex-1 text-[14px] text-[#111827]">Satara</div>
                            </div>

                            {/* Row 3: Address */}
                            <div className="flex items-center py-4 border-b border-gray-100">
                                <div className="w-[30%] min-w-[200px] text-[14px] text-gray-500 font-medium">Address</div>
                                <div className="flex-1 text-[14px] text-[#111827]">Satara</div>
                            </div>

                            {/* Row 4: Total Production Machine */}
                            <div className="flex items-center py-4 border-b border-gray-100">
                                <div className="w-[30%] min-w-[200px] text-[14px] text-gray-500 font-medium">Total Production Machine</div>
                                <div className="flex-1 text-[14px] text-[#111827]">8</div>
                            </div>

                            {/* Row 5: GST Number */}
                            <div className="flex items-center py-4 border-b border-gray-100">
                                <div className="w-[30%] min-w-[200px] text-[14px] text-gray-500 font-medium">GST Number</div>
                                <div className="flex-1 text-[14px] text-[#111827]">27ABCDE1234F275</div>
                            </div>

                            {/* Row 6: Status */}
                            <div className="flex items-center py-4">
                                <div className="w-[30%] min-w-[200px] text-[14px] text-gray-500 font-medium">Status</div>
                                <div className="flex-1 text-[14px] text-[#111827]">Active</div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ViewFacility;
