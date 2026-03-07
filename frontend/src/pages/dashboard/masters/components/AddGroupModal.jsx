import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';

const AddGroupModal = ({ isOpen, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);

    const groups = ['Direct Expenses', 'Indirect Expenses', 'Sales', 'Purchase'];

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div
                ref={modalRef}
                className={`bg-white w-full max-w-[500px] rounded-[12px] shadow-2xl transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-[18px] font-bold text-[#111827]">Add Group</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-6">
                    {/* Group Dropdown */}
                    <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-gray-700">Group</label>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full h-[48px] border ${isDropdownOpen ? 'border-[#014A36] ring-1 ring-[#014A36]' : 'border-gray-200'} rounded-[8px] px-4 flex items-center justify-between cursor-pointer transition-all bg-white`}
                            >
                                <span className={selectedGroup ? 'text-gray-900' : 'text-gray-400'}>
                                    {selectedGroup || 'Select Group'}
                                </span>
                                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-[8px] shadow-xl z-10 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {groups.map((group) => (
                                        <div
                                            key={group}
                                            onClick={() => {
                                                setSelectedGroup(group);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="px-4 py-3 hover:bg-[#F9FAFB] cursor-pointer text-[14px] text-gray-700 transition-colors"
                                        >
                                            {group}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Group Under Input */}
                    <div className="space-y-2 pb-2">
                        <label className="text-[14px] font-semibold text-gray-700">Group Under</label>
                        <input
                            type="text"
                            placeholder="Enter group under"
                            className="w-full h-[48px] border border-gray-200 rounded-[8px] px-4 outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36] transition-all placeholder:text-gray-400 text-[14px]"
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                        <button
                            className="w-[140px] h-[44px] bg-[#014A36] text-white font-semibold rounded-[8px] hover:bg-[#013b2b] transition-colors text-[14px]"
                            onClick={onClose}
                        >
                            Save
                        </button>
                        <button
                            className="w-[80px] h-[44px] border border-gray-200 text-gray-700 font-semibold rounded-[8px] hover:bg-gray-50 transition-colors text-[14px]"
                            onClick={onClose}
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddGroupModal;
