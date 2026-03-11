import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CustomSelect = ({ label, options, value, onChange, placeholder, isSearchable = false, required = false, widthClass = "w-full" }) => {
    const { t } = useTranslation(['common']);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = isSearchable && searchTerm
        ? options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    return (
        <div className={`flex flex-col gap-1.5 relative ${widthClass}`} ref={dropdownRef}>
            {label && (
                <label className="text-[13px] font-semibold text-[#4B5563]">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div
                className={`w-full h-[44px] flex items-center justify-between px-4 border rounded-[8px] bg-white cursor-pointer transition-colors ${isOpen ? 'border-[#014A36] ring-1 ring-[#014A36]/10' : 'border-[#E5E7EB] hover:border-gray-300'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-[14px] truncate ${value ? 'text-[#111827]' : 'text-gray-500'}`}>
                    {value || placeholder}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-[8px] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {isSearchable && (
                        <div className="p-2 border-b border-gray-100">
                            <input
                                type="text"
                                placeholder={t('common:search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-[36px] px-3 text-[14px] border border-gray-200 rounded-[6px] outline-none focus:border-[#014A36]"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <div className="max-h-[240px] overflow-y-auto w-full py-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${value === opt ? 'bg-[#F9FAFB] text-[#014A36] font-medium' : 'text-[#4B5563] hover:bg-gray-50'}`}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    {opt}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-[14px] text-gray-500 text-center">{t('common:no_options_found')}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const AddAccount = ({ onBack, onAddAccount, initialData, onUpdateAccount }) => {
    const { t } = useTranslation(['modules', 'common']);
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState(initialData ? {
        accountName: initialData.account || '',
        groupName: initialData.groupName || '',
        gstNo: initialData.gstNo || '',
        panNo: initialData.panNo || '',
        creditDays: initialData.creditDays ? initialData.creditDays.toString() : '',
        opBalance: initialData.opBalanceRaw || (initialData.opBalance ? initialData.opBalance.replace(/[^0-9.]/g, '') : ''),
        opBalanceType: initialData.opBalanceType || (initialData.opBalance && initialData.opBalance.startsWith('-') ? 'Dr' : 'Cr'),
        vendorCode: initialData.vendorCode || '',
        address1: initialData.address1 || initialData.address || '',
        address2: initialData.address2 || '',
        area: initialData.area || '',
        pinCode: initialData.pinCode || '',
        city: initialData.city || '',
        state: initialData.state || '',
        msmeId: initialData.msmeId || '',
        regUnder: initialData.regUnder || '',
        regType: initialData.regType || '',
        accountHolder: initialData.accountHolder || '',
        bankName: initialData.bankName || '',
        accountNumber: initialData.bankAccountNo || '',
        ifscCode: initialData.ifscCode || '',
        prefix: initialData.prefix || '',
        contactPersonName: initialData.contactPersonName || '',
        emailId: initialData.emailId || '',
        mobileNo: initialData.mobileNo || ''
    } : {
        accountName: '',
        groupName: '',
        gstNo: '',
        panNo: '',
        creditDays: '',
        opBalance: '',
        opBalanceType: 'Cr',
        vendorCode: '',
        address1: '',
        address2: '',
        area: '',
        pinCode: '',
        city: '',
        state: '',
        msmeId: '',
        regUnder: '',
        regType: '',
        // Step 2 new fields
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        prefix: '',
        contactPersonName: '',
        emailId: '',
        mobileNo: ''
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [msmeEnabled, setMsmeEnabled] = useState(Boolean(initialData?.msmeId));

    const GROUP_NAMES = ['Sundry Creditors (Vendor)', 'Sundry Debtors (Customer)'];
    const OP_BALANCE_TYPES = ['Cr', 'Dr'];
    const REG_UNDER = ['Micro', 'Medium', 'Small'];
    const REG_TYPES = ['Trading', 'Service', 'Manufacturing'];
    const PREFIX_OPTIONS = ['Mr.', 'Mrs.', 'Miss.', 'Ms.'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isNextActive = formData.accountName.trim() !== '' &&
                         formData.groupName.trim() !== '' &&
                         formData.creditDays.trim() !== '' &&
                         formData.panNo.trim() !== '' &&
                         formData.vendorCode.trim() !== '' &&
                         formData.address1.trim() !== '' &&
                         formData.pinCode.trim() !== '';

    const isAddAccountActive = formData.accountHolder.trim() !== '' &&
                               formData.bankName.trim() !== '' &&
                               formData.accountNumber.trim() !== '' &&
                               formData.ifscCode.trim() !== '' &&
                               formData.prefix.trim() !== '' &&
                               formData.contactPersonName.trim() !== '' &&
                               formData.mobileNo.trim() !== '';

    const handleAddAccountSubmit = () => {
        if (!isAddAccountActive) return;

        const addressComponents = [formData.address1, formData.address2, formData.area, formData.city, formData.state].filter(Boolean);
        const addressStr = addressComponents.join(', ');

        const newAccount = {
            ...(initialData || {}),
            vendorCode: formData.vendorCode,
            account: formData.accountName,
            groupName: formData.groupName,
            creditDays: parseInt(formData.creditDays, 10) || formData.creditDays,
            gstNo: formData.gstNo || '-',
            panNo: formData.panNo,
            opBalance: formData.opBalance ? (formData.opBalanceType === 'Cr' ? `₹${formData.opBalance}` : `-₹${formData.opBalance}`) : '-',
            opBalanceRaw: formData.opBalance,
            opBalanceType: formData.opBalanceType,
            address: addressStr,
            address1: formData.address1,
            address2: formData.address2,
            area: formData.area,
            city: formData.city,
            state: formData.state,
            pinCode: formData.pinCode,
            msmeId: formData.msmeId,
            regUnder: formData.regUnder,
            regType: formData.regType,
            accountHolder: formData.accountHolder,
            bankName: formData.bankName,
            bankAccountNo: formData.accountNumber,
            ifscCode: formData.ifscCode,
            prefix: formData.prefix,
            contactPersonName: formData.contactPersonName,
            emailId: formData.emailId,
            mobileNo: formData.mobileNo,
            status: initialData ? initialData.status : 'Active'
        };

        if (isEditMode && onUpdateAccount) {
            onUpdateAccount(newAccount);
        } else if (onAddAccount) {
            onAddAccount(newAccount);
        }
    };

    return (
        <div className="flex flex-col w-full h-full animate-in fade-in duration-300">
            {/* Top Action Bar */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => currentStep === 2 ? setCurrentStep(1) : onBack()}
                    className="px-6 h-[44px] bg-white border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                    {currentStep === 2 ? t('common:back') : t('common:back')}
                </button>
            </div>

            {/* Form Container */}
            {currentStep === 1 ? (
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col w-full animate-in fade-in slide-in-from-left-2 duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#E5E7EB]">
                    <h2 className="text-[18px] font-bold text-[#111827]">{isEditMode ? t('update_account') : t('add_account')}</h2>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Account Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('account_name')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_account_name')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.accountName}
                                onChange={(e) => handleInputChange('accountName', e.target.value)}
                            />
                        </div>

                        {/* Group Name */}
                        <CustomSelect
                            label={t('common:group')}
                            placeholder={t('common:select_group_under')}
                            options={GROUP_NAMES}
                            value={formData.groupName}
                            onChange={(val) => handleInputChange('groupName', val)}
                            required={true}
                        />

                        {/* GST.No */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('gst_no')}({t('common:optional')})
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_gst_number')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.gstNo}
                                onChange={(e) => handleInputChange('gstNo', e.target.value)}
                            />
                        </div>

                        {/* PAN.No */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('pan_no')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_pan_number')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.panNo}
                                onChange={(e) => handleInputChange('panNo', e.target.value)}
                            />
                        </div>

                        {/* Credit Days */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('credit_days')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_credit_days')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.creditDays}
                                onChange={(e) => handleInputChange('creditDays', e.target.value)}
                            />
                        </div>

                        {/* OP Balance */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('op_balance')} ({t('common:optional')})
                            </label>
                            <div className="flex gap-2 text-[#111827]">
                                <input
                                    type="text"
                                    placeholder={t('enter_op_balance')}
                                    className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white flex-1"
                                    value={formData.opBalance}
                                    onChange={(e) => handleInputChange('opBalance', e.target.value)}
                                />
                                <div className="w-[100px]">
                                    <CustomSelect
                                        options={OP_BALANCE_TYPES}
                                        value={formData.opBalanceType}
                                        onChange={(val) => handleInputChange('opBalanceType', val)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Vendor Code */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {isEditMode ? t('common:code') : t('vendor_code')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('vendor_code')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.vendorCode}
                                onChange={(e) => handleInputChange('vendorCode', e.target.value)}
                            />
                        </div>

                        {/* Address 1 */}
                        <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('address_1')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_address_1')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.address1}
                                onChange={(e) => handleInputChange('address1', e.target.value)}
                            />
                        </div>

                        {/* Address 2 */}
                        <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('address_2')}({t('common:optional')})
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_address_2')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.address2}
                                onChange={(e) => handleInputChange('address2', e.target.value)}
                            />
                        </div>

                        {/* Area */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('area')}({t('common:optional')})
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_area')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.area}
                                onChange={(e) => handleInputChange('area', e.target.value)}
                            />
                        </div>

                        {/* Pin Code */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('pin_code')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_pin_code')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.pinCode}
                                onChange={(e) => handleInputChange('pinCode', e.target.value)}
                            />
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('city')}({t('common:optional')})
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_city')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                            />
                        </div>

                        {/* State */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('state')}({t('common:optional')})
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_state')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.state}
                                onChange={(e) => handleInputChange('state', e.target.value)}
                            />
                        </div>

                        {/* MSME Section Container */}
                        <div className="flex flex-col gap-1.5 w-full transition-all duration-300">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('msme')} ({t('common:optional')})
                            </label>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                {/* Toggle Switch */}
                                <div
                                    className={`w-11 h-6 shrink-0 rounded-full flex items-center p-1 cursor-pointer transition-colors ${msmeEnabled ? 'bg-[#014A36]' : 'bg-gray-200'}`}
                                    onClick={() => setMsmeEnabled(!msmeEnabled)}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${msmeEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>

                                {/* Conditional MSME ID Input directly next to Toggle */}
                                {msmeEnabled && (
                                    <div className="w-full md:flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <input
                                            type="text"
                                            placeholder={t('enter_msme_id')}
                                            className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                            value={formData.msmeId}
                                            onChange={(e) => handleInputChange('msmeId', e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reg.Under Conditionally Shown On Same Row Area if space permits */}
                        {msmeEnabled && (
                            <div className="animate-in fade-in flex items-end">
                                <CustomSelect
                                    label={t('reg_under')}
                                    placeholder={t('common:select')}
                                    options={REG_UNDER}
                                    value={formData.regUnder}
                                    onChange={(val) => handleInputChange('regUnder', val)}
                                />
                            </div>
                        )}

                        {/* Reg Type - Shown below when toggled */}
                        {msmeEnabled && (
                            <div className="animate-in fade-in">
                                <CustomSelect
                                    label={t('reg_type')}
                                    placeholder={t('common:select')}
                                    options={REG_TYPES}
                                    value={formData.regType}
                                    onChange={(val) => handleInputChange('regType', val)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-5 border-t border-[#E5E7EB] flex items-center justify-end gap-4 bg-white/50 rounded-b-[12px]">
                    <button
                        onClick={onBack}
                        className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white"
                    >
                        {t('common:cancel')}
                    </button>
                    <button
                        onClick={() => setCurrentStep(2)}
                        disabled={!isNextActive}
                        className={`px-8 h-[44px] text-white rounded-[8px] text-[14px] font-bold transition-colors shadow-sm ${
                            isNextActive 
                                ? 'bg-[#014A36] hover:bg-[#013b2b] cursor-pointer' 
                                : 'bg-[#A7C0B8] cursor-not-allowed'
                        }`}
                    >
                        {t('common:next')}
                    </button>
                </div>
            </div>
            ) : (
                <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-right-2 duration-300">
                    {/* Bank Details */}
                    <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col w-full">
                        <div className="px-6 py-5 border-b border-[#E5E7EB]">
                            <h2 className="text-[18px] font-bold text-[#111827]">{t('bank_details')}</h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Account Holder */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('account_holder')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t('enter_account_holder_name')}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                        value={formData.accountHolder}
                                        onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                                    />
                                </div>
                                {/* Bank Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('bank_name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t('enter_bank_name')}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                        value={formData.bankName}
                                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                                    />
                                </div>
                                {/* Account Number */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('account_number')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t('enter_account_number')}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                        value={formData.accountNumber}
                                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                    />
                                </div>
                                {/* IFSC Code */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('ifsc_code')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t('enter_ifsc_code')}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                        value={formData.ifscCode}
                                        onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Person Details */}
                    <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col w-full">
                        <div className="px-6 py-5 border-b border-[#E5E7EB]">
                            <h2 className="text-[18px] font-bold text-[#111827]">{t('contact_person_details')}</h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Prefix */}
                                <CustomSelect
                                    label={t('prefix')}
                                    placeholder={t('select_prefix')}
                                    options={PREFIX_OPTIONS}
                                    value={formData.prefix}
                                    onChange={(val) => handleInputChange('prefix', val)}
                                    required={true}
                                />
                                {/* Contact Person Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('contact_person_name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t('enter_person_name')}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                        value={formData.contactPersonName}
                                        onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                                    />
                                </div>
                                {/* Email ID */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('email_id')} ({t('common:optional')})
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t('enter_email_id')}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                        value={formData.emailId}
                                        onChange={(e) => handleInputChange('emailId', e.target.value)}
                                    />
                                </div>
                                {/* Mobile No */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('mobile_no')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t('enter_mobile_number')}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                        value={formData.mobileNo}
                                        onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer buttons for Step 2 */}
                    <div className="flex items-center justify-end gap-4 mt-2">
                        <button
                            onClick={handleAddAccountSubmit}
                            disabled={!isAddAccountActive}
                            className={`px-8 h-[44px] text-white rounded-[8px] text-[14px] font-bold transition-colors shadow-sm ${
                                isAddAccountActive 
                                    ? 'bg-[#014A36] hover:bg-[#013b2b] cursor-pointer' 
                                    : 'bg-[#A7C0B8] cursor-not-allowed'
                            }`}
                        >
                            {isEditMode ? t('update_account') : t('add_account')}
                        </button>
                        <button
                            onClick={onBack}
                            className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white"
                        >
                            {t('common:cancel')}
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #E5E7EB;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #D1D5DB;
                }
            `}</style>
        </div>
    );
};

export default AddAccount;
