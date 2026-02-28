import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Edit, Power, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ActionMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md border border-[#e5e7eb] py-1.5 z-40">
                    <Link to="/dashboard/facility/view" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                        <Eye size={16} className="text-gray-400" />
                        View Facility
                    </Link>
                    <Link to="/dashboard/facility/update" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                        <Edit size={16} className="text-gray-400" />
                        Update Facility
                    </Link>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                        <Power size={16} className="text-gray-400" />
                        Inactive / Active
                    </button>
                    <button
                        onClick={() => { setIsOpen(false); setIsDeleteModalOpen(true); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                        <Trash2 size={16} className="text-red-500" />
                        Delete Facility
                    </button>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[16px] shadow-lg w-full max-w-[400px] overflow-hidden">
                        <div className="p-6 md:p-8 flex flex-col items-center text-center">

                            {/* Alert Icon */}
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>

                            <h3 className="text-[20px] font-bold text-[#111827] mb-2">Delete?</h3>
                            <p className="text-[#4B5563] text-[15px] mb-8">
                                Are you sure ?
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    className="w-full py-3 px-4 bg-[#EF4444] hover:bg-red-600 text-white font-medium rounded-[10px] transition-colors"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                >
                                    Delete
                                </button>
                                <button
                                    className="w-full py-3 px-4 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#111827] font-medium rounded-[10px] transition-colors"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                >
                                    Back
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionMenu;
