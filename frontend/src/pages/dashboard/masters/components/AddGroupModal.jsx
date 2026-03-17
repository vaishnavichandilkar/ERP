import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import masterService from '../../../../services/masterService';
import { translateDynamic } from '../../../../utils/i18nUtils';

const AddGroupModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation(['common', 'modules']);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupName, setGroupName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [allGroups, setAllGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchDropdownGroups();
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            setGroupName('');
            setSelectedGroup(null);
            setError('');
            setSearchQuery('');
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchDropdownGroups = async () => {
        try {
            const response = await masterService.getGroupDropdown();
            if (response.success) {
                setAllGroups(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch dropdown groups', err);
        }
    };

    const handleSave = async () => {
        if (!groupName.trim()) {
            setError(t('modules:group_required') || 'Group name is required');
            return;
        }
        if (!selectedGroup) {
            setError(t('modules:parent_group_required') || 'Parent group is required');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const response = await masterService.createGroup({
                group_name: groupName,
                parent_id: selectedGroup.id
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

    const filteredGroups = allGroups.filter(g =>
        g.display_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <label className="text-[13px] font-medium text-[#4B5563]">
                            {t('common:group')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder={t('common:enter_group_text')}
                            className={`w-full h-[44px] border rounded-[8px] px-3.5 outline-none focus:ring-1 focus:ring-[#014A36]/10 transition-all placeholder:text-[#9CA3AF] text-[14px] text-[#111827]
                                ${error && !groupName.trim() ? 'border-red-300 bg-red-50/30' : 'border-[#E5E7EB] focus:border-[#014A36]'}`}
                        />
                    </div>

                    {/* Group Under Dropdown */}
                    <div className="space-y-1.5 pb-2">
                        <label className="text-[13px] font-medium text-[#4B5563]">
                            {t('common:group_under')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full h-[44px] border ${isDropdownOpen ? 'border-[#014A36] ring-1 ring-[#014A36]/10' : 'border-[#E5E7EB] hover:border-gray-300'} 
                                    ${error && !selectedGroup ? 'border-red-300 bg-red-50/30' : ''}
                                    rounded-[8px] px-3.5 flex items-center justify-between cursor-pointer transition-all bg-white`}
                            >
                                <div className="flex items-center overflow-hidden">
                                    {selectedGroup ? (
                                        <>
                                            {selectedGroup.level === 1 && selectedGroup.is_header && <span className="mr-2">📁</span>}
                                            {selectedGroup.level > 1 && <span className="text-gray-400 mr-2">↳</span>}
                                            <span className={`text-[14px] truncate ${selectedGroup.level === 1 && selectedGroup.is_header ? 'font-bold text-[#111827]' : 'text-[#111827]'}`}>
                                                {translateDynamic(selectedGroup.group_name, t)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-[14px] text-[#9CA3AF]">{t('common:select_group_under')}</span>
                                    )}
                                </div>
                                <ChevronDown size={18} className={`text-[#6B7280] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-[#E5E7EB] rounded-[8px] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Search inside dropdown */}
                                    <div className="p-2 border-b border-[#F3F4F6]">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder={t('common:search_groups')}
                                                className="w-full h-[32px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] pl-8 pr-3 text-[12px] outline-none focus:border-[#014A36] transition-all"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>

                                    <div className="max-h-[200px] overflow-y-auto py-1.5 px-1.5">
                                        {filteredGroups.length > 0 ? (
                                            filteredGroups.map((group) => {
                                                const isHeader = group.level === 1 && group.is_header;
                                                const indentation = (group.level - 1) * 10;

                                                return (
                                                    <div
                                                        key={group.id}
                                                        onClick={() => {
                                                            setSelectedGroup(group);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className={`px-3 py-2 rounded-[6px] hover:bg-[#F3F4F6] cursor-pointer text-[13px] transition-all mb-0.5
                                                            ${selectedGroup?.id === group.id ? 'bg-[#F3F4F6] text-[#014A36] font-medium' : 'text-[#4B5563]'}
                                                            ${isHeader ? 'mt-3 first:mt-0 font-bold border-t border-gray-50 pt-2.5' : ''}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center overflow-hidden">
                                                                {!isHeader && (
                                                                    <>
                                                                        <span className="whitespace-pre text-transparent select-none">
                                                                            {' '.repeat(indentation)}
                                                                        </span>
                                                                        <span className="text-gray-500 mr-1 flex-shrink-0 font-medium">↳</span>
                                                                    </>
                                                                )}
                                                                {isHeader && <span className="mr-2 flex-shrink-0 text-amber-600">📁</span>}
                                                                <span className={`truncate ${isHeader ? 'text-[#111827]' : 'text-[#374151]'}`}>
                                                                    {translateDynamic(group.group_name, t)}
                                                                </span>
                                                            </div>
                                                            {isHeader && (
                                                                <span className="text-[9px] bg-gray-100 text-[#6B7280] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0 ml-2 border border-gray-200">
                                                                    {t('common:header') || 'HEADER'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="px-3 py-2 text-[12px] text-gray-400 text-center">No groups found</div>
                                        )}
                                    </div>
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
