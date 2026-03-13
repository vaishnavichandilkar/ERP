import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import masterService from '../../../../services/masterService';

const AddGroupModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation(['common', 'modules']);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [subGroupName, setSubGroupName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [headerGroups, setHeaderGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchHeaderGroups();
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            setSubGroupName('');
            setSelectedGroup(null);
            setError('');
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchHeaderGroups = async () => {
        try {
            const response = await masterService.getGroupDropdown();
            if (response.success) {
                setHeaderGroups(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch header groups', err);
        }
    };

    const handleSave = async () => {
        if (!subGroupName.trim()) {
            setError(t('modules:sub_group_required'));
            return;
        }
        if (!selectedGroup) {
            setError(t('modules:header_group_required'));
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const response = await masterService.createSubGroup({
                sub_group_name: subGroupName,
                group_id: selectedGroup.id
            });

            if (response.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || t('common:error_occurred'));
        } finally {
            setIsLoading(false);
        }
    };

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
                className={`bg-white w-full max-w-[440px] rounded-[16px] shadow-2xl transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#F3F4F6]">
                    <h2 className="text-[15px] font-bold text-[#111827]">{t('modules:add_group')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-[13px] rounded-[8px] border border-red-100 animate-in fade-in duration-300">
                            {error}
                        </div>
                    )}
                    {/* Group Input */}
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-[#4B5563]">{t('common:group')}</label>
                        <input
                            type="text"
                            value={subGroupName}
                            onChange={(e) => setSubGroupName(e.target.value)}
                            placeholder={t('common:enter_group_text')}
                            className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-3.5 outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all placeholder:text-[#9CA3AF] text-[14px] text-[#111827]"
                        />
                    </div>

                    {/* Group Under Dropdown */}
                    <div className="space-y-1.5 pb-2">
                        <label className="text-[13px] font-medium text-[#4B5563]">{t('common:group_under')}</label>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full h-[44px] border ${isDropdownOpen ? 'border-[#014A36] ring-1 ring-[#014A36]/10' : 'border-[#E5E7EB] hover:border-gray-300'} rounded-[8px] px-3.5 flex items-center justify-between cursor-pointer transition-all bg-white`}
                            >
                                <span className={`text-[14px] ${selectedGroup ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                                    {selectedGroup ? selectedGroup.group_name : t('common:select_group_under')}
                                </span>
                                <ChevronDown size={18} className={`text-[#6B7280] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-[#E5E7EB] rounded-[8px] shadow-lg z-50 py-1.5 max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    {headerGroups.map((group) => (
                                        <div
                                            key={group.id}
                                            onClick={() => {
                                                setSelectedGroup(group);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`px-3.5 py-2.5 mx-1.5 rounded-[6px] hover:bg-[#F3F4F6] cursor-pointer text-[14px] transition-colors
                                                ${selectedGroup?.id === group.id ? 'bg-[#F3F4F6] text-[#014A36] font-medium' : 'text-[#4B5563]'}`}
                                        >
                                            {group.group_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button
                            className="px-10 h-[44px] bg-[#014A36] text-white font-semibold rounded-[8px] hover:bg-[#013b2b] transition-colors text-[14px] disabled:opacity-50"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? t('common:saving') : t('common:save')}
                        </button>
                        <button
                            className="px-6 h-[44px] border border-[#E5E7EB] text-[#4B5563] font-semibold rounded-[8px] hover:bg-gray-50 transition-colors text-[14px]"
                            onClick={onClose}
                        >
                            {t('common:exit')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddGroupModal;
