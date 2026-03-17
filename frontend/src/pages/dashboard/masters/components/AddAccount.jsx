import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2, ArrowLeft, Building2, Banknote, Contact2, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import accountService from '../../../../services/accountService';

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

    const filteredOptions = isSearchable && searchTerm && searchTerm.toLowerCase() !== (value || '').toLowerCase()
        ? options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    return (
        <div className={`flex flex-col gap-2 relative ${widthClass}`} ref={dropdownRef}>
            {label && (
                <label className="text-[14px] font-medium text-[#4B5563]">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div
                className={`w-full h-[46px] flex items-center justify-between px-4 border rounded-[10px] bg-white transition-all shadow-sm ${isOpen ? 'border-[#073318] ring-1 ring-[#073318]/10' : 'border-[#E5E7EB] hover:border-gray-300'} ${!isSearchable ? 'cursor-pointer' : ''}`}
                onClick={() => !isSearchable && setIsOpen(!isOpen)}
            >
                {isSearchable ? (
                    <input
                        type="text"
                        className="w-full h-full text-[14px] text-[#111827] outline-none bg-transparent placeholder:text-gray-400"
                        placeholder={placeholder}
                        value={isOpen ? searchTerm : (value || '')}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (!isOpen) setIsOpen(true);
                        }}
                        onFocus={() => {
                            setIsOpen(true);
                            setSearchTerm(value || '');
                        }}
                    />
                ) : (
                    <span className={`text-[14px] font-medium truncate ${value ? 'text-[#111827]' : 'text-gray-500'}`}>
                        {value || placeholder}
                    </span>
                )}
                <div 
                    className="cursor-pointer"
                    onClick={(e) => {
                        if (isSearchable) {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                            if (!isOpen) setSearchTerm(value || '');
                        }
                    }}
                >
                    {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-[#F3F4F6] rounded-[12px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[280px] overflow-y-auto w-full py-2 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${value === opt ? 'bg-[#F9FAFB] text-[#073318] font-bold' : 'text-[#4B5563] hover:bg-gray-50 font-medium'}`}
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
                            <div className="px-4 py-4 text-[14px] text-gray-400 text-center font-medium">{t('common:no_options_found')}</div>
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
        accountName: initialData.accountName || '',
        isCustomer: initialData.isCustomer || false,
        isVendor: initialData.isVendor || false,
        customerCode: initialData.customerCode || '',
        vendorCode: initialData.vendorCode || '',
        gstNo: initialData.gstNo || '',
        panNo: initialData.panNo || '',
        creditDays: initialData.creditDays ? initialData.creditDays.toString() : '',
        opBalance: initialData.openingBalance?.toString() || '',
        opBalanceType: initialData.balanceType || 'Cr',
        address1: initialData.addressLine1 || '',
        address2: initialData.addressLine2 || '',
        area: initialData.area || '',
        pinCode: initialData.pincode || '',
        city: initialData.city || '',
        state: initialData.state || '',
        msmeId: initialData.msmeRegNo || '',
        regUnder: initialData.regUnder || '',
        regType: initialData.regType || '',
        accountHolder: initialData.accountHolderName || '',
        bankName: initialData.bankName || '',
        accountNumber: initialData.accountNumber || '',
        ifscCode: initialData.ifscCode || '',
        prefix: initialData.prefix || '',
        contactPersonName: initialData.contactPersonName || '',
        emailId: initialData.emailId || '',
        mobileNo: initialData.mobileNo || ''
    } : {
        accountName: '',
        isCustomer: false,
        isVendor: false,
        customerCode: '',
        vendorCode: '',
        gstNo: '',
        panNo: '',
        creditDays: '',
        opBalance: '',
        opBalanceType: 'Cr',
        address1: '',
        address2: '',
        area: '',
        pinCode: '',
        city: '',
        state: '',
        msmeId: '',
        regUnder: '',
        regType: '',
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
    const [areaOptions, setAreaOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [isFetchingPin, setIsFetchingPin] = useState(false);

    const OP_BALANCE_TYPES = ['Cr', 'Dr'];
    const REG_UNDER = ['Micro', 'Small', 'Medium'];
    const REG_TYPES = ['Trading', 'Service', 'Manufacturing'];
    const PREFIX_OPTIONS = ['Mr', 'Mrs', 'Miss', 'Ms'];

    const handleInputChange = async (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'isCustomer' && value === true && !formData.customerCode) {
            setIsGeneratingCode(true);
            try {
                const res = await accountService.generateCustomerCode();
                if (res?.customerCode) {
                    setFormData(prev => ({ ...prev, customerCode: res.customerCode }));
                }
            } catch (err) {
                toast.error('Failed to generate customer code');
            } finally {
                setIsGeneratingCode(false);
            }
        }

        if (field === 'isVendor' && value === true && !formData.vendorCode) {
            setIsGeneratingCode(true);
            try {
                const res = await accountService.generateVendorCode();
                if (res?.vendorCode) {
                    setFormData(prev => ({ ...prev, vendorCode: res.vendorCode }));
                }
            } catch (err) {
                toast.error('Failed to generate vendor code');
            } finally {
                setIsGeneratingCode(false);
            }
        }

        if (field === 'pinCode' && value.length === 6) {
            setIsFetchingPin(true);
            try {
                const res = await accountService.lookupPincode(value);
                if (res) {
                    setFormData(prev => ({
                        ...prev,
                        city: res.city || prev.city,
                        state: res.state || prev.state,
                        area: (res.areas && res.areas.length > 0) ? res.areas[0] : prev.area
                    }));
                    if (res.areas && res.areas.length > 0) {
                        setAreaOptions(res.areas);
                    }
                    toast.success('Location details fetched successfully');
                }
            } catch (err) {
                toast.error('Failed to fetch pincode details automatically. Please enter manually.');
            } finally {
                setIsFetchingPin(false);
            }
        }
    };

    const isMsmeValid = msmeEnabled ? (formData.msmeId.trim() !== '' && formData.regUnder.trim() !== '' && formData.regType.trim() !== '') : true;

    const isNextActive = formData.accountName.trim() !== '' &&
                         (formData.isCustomer || formData.isVendor) &&
                         (formData.isCustomer ? formData.customerCode.trim() !== '' : true) &&
                         (formData.isVendor ? formData.vendorCode.trim() !== '' : true) &&
                         formData.panNo.trim() !== '' &&
                         formData.creditDays.trim() !== '' &&
                         formData.address1.trim() !== '' &&
                         formData.pinCode.trim() !== '' &&
                         isMsmeValid;

    const isAddAccountActive = formData.accountHolder.trim() !== '' &&
                               formData.bankName.trim() !== '' &&
                               formData.accountNumber.trim() !== '' &&
                               formData.ifscCode.trim() !== '' &&
                               formData.prefix.trim() !== '' &&
                               formData.contactPersonName.trim() !== '' &&
                               formData.mobileNo.trim() !== '' &&
                               !isLoading;

    const handleAddAccountSubmit = async () => {
        if (!isAddAccountActive) return;

        setIsLoading(true);

        const payload = {
            accountName: formData.accountName,
            isCustomer: formData.isCustomer,
            isVendor: formData.isVendor,
            customerCode: formData.isCustomer ? formData.customerCode : undefined,
            vendorCode: formData.isVendor ? formData.vendorCode : undefined,
            gstNo: formData.gstNo || undefined,
            panNo: formData.panNo,
            creditDays: parseInt(formData.creditDays, 10) || 0,
            openingBalance: parseInt(formData.opBalance, 10) || 0,
            balanceType: formData.opBalanceType,
            addressLine1: formData.address1,
            addressLine2: formData.address2 || undefined,
            pincode: formData.pinCode,
            area: formData.area || undefined,
            city: formData.city || undefined,
            state: formData.state || undefined,
            msmeStatus: msmeEnabled,
            msmeRegNo: msmeEnabled ? formData.msmeId : undefined,
            regUnder: msmeEnabled ? formData.regUnder : undefined,
            regType: msmeEnabled ? formData.regType : undefined,
            accountHolderName: formData.accountHolder,
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            prefix: formData.prefix,
            contactPersonName: formData.contactPersonName,
            emailId: formData.emailId || undefined,
            mobileNo: formData.mobileNo
        };

        try {
            if (isEditMode) {
                const response = await accountService.updateAccount(initialData.id, payload);
                toast.success('Account updated successfully');
                if (onUpdateAccount) onUpdateAccount(response);
            } else {
                const response = await accountService.createAccount(payload);
                toast.success('Account created successfully');
                if (onAddAccount) onAddAccount(response);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to save account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full font-['Plus_Jakarta_Sans'] animate-in fade-in duration-500 pb-12">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={onBack}
                    className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50 hover:text-[#111827] transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
                        {isEditMode ? t('modules:update_account') : t('modules:add_account')}
                    </h1>
                    <p className="text-[#6B7280] text-[15px] font-medium">
                        {currentStep === 1 ? 'Step 1: General & Location Details' : 'Step 2: Bank & Contact Details'}
                    </p>
                </div>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center gap-4 mb-8 px-2 overflow-hidden">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold transition-all ${currentStep === 1 ? 'bg-[#073318] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>1</div>
                    <span className={`text-[14px] font-bold ${currentStep === 1 ? 'text-[#111827]' : 'text-[#6B7280]'}`}>General Info</span>
                </div>
                <div className="w-12 h-[2px] bg-[#E5E7EB]" />
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold transition-all ${currentStep === 2 ? 'bg-[#073318] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>2</div>
                    <span className={`text-[14px] font-bold ${currentStep === 2 ? 'text-[#111827]' : 'text-[#6B7280]'}`}>Bank & Contact</span>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="p-8 md:p-10">
                    {currentStep === 1 ? (
                        <div className="grid grid-cols-1 gap-10 animate-in fade-in slide-in-from-left-4 duration-500">
                            {/* Section: Basic Info */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                                    <div className="w-8 h-8 bg-[#073318]/5 rounded-lg flex items-center justify-center text-[#073318]">
                                        <Building2 size={18} />
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#111827]">General Information</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-8">
                                    {/* Account Name */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-[#4B5563]">
                                            {t('modules:account_name')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={t('modules:enter_account_name')}
                                            className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                            value={formData.accountName}
                                            onChange={(e) => handleInputChange('accountName', e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Account Type */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[14px] font-bold text-[#4B5563]">
                                            {t('modules:account_type')} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-6 p-4 bg-[#F9FAFB] rounded-[12px] border border-[#F3F4F6]">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div 
                                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isCustomer ? 'bg-[#073318] border-[#073318]' : 'border-[#D1D5DB] bg-white group-hover:border-[#073318]'}`}
                                                    onClick={() => handleInputChange('isCustomer', !formData.isCustomer)}
                                                >
                                                    {formData.isCustomer && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                                </div>
                                                <span className={`text-[15px] font-bold transition-colors ${formData.isCustomer ? 'text-[#111827]' : 'text-[#6B7280]'}`}>{t('modules:customer')}</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div 
                                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isVendor ? 'bg-[#073318] border-[#073318]' : 'border-[#D1D5DB] bg-white group-hover:border-[#073318]'}`}
                                                    onClick={() => handleInputChange('isVendor', !formData.isVendor)}
                                                >
                                                    {formData.isVendor && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                                </div>
                                                <span className={`text-[15px] font-bold transition-colors ${formData.isVendor ? 'text-[#111827]' : 'text-[#6B7280]'}`}>{t('modules:vendor')}</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* GST & PAN Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:gst_no')} <span className="text-gray-400 font-normal">({t('common:optional')})</span></label>
                                            <input
                                                type="text"
                                                placeholder={t('modules:enter_gst_number')}
                                                className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                                value={formData.gstNo}
                                                onChange={(e) => handleInputChange('gstNo', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:pan_no')} <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                placeholder={t('modules:enter_pan_number')}
                                                className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                                value={formData.panNo}
                                                onChange={(e) => handleInputChange('panNo', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Credit & Balance Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:credit_days')} <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                placeholder={t('modules:enter_credit_days')}
                                                className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                                value={formData.creditDays}
                                                onChange={(e) => handleInputChange('creditDays', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:op_balance')} <span className="text-gray-400 font-normal">({t('common:optional')})</span></label>
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    placeholder={t('modules:enter_op_balance')}
                                                    className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white flex-1"
                                                    value={formData.opBalance}
                                                    onChange={(e) => handleInputChange('opBalance', e.target.value)}
                                                />
                                                <div className="w-[110px]">
                                                    <CustomSelect
                                                        options={OP_BALANCE_TYPES}
                                                        value={formData.opBalanceType}
                                                        onChange={(val) => handleInputChange('opBalanceType', val)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dynamic Codes Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-[#4B5563] flex items-center justify-between">
                                                <span>{t('modules:customer_code')}</span>
                                                {isGeneratingCode && formData.isCustomer && !formData.customerCode && <Loader2 size={16} className="animate-spin text-[#073318]" />}
                                            </label>
                                            <input
                                                type="text"
                                                className={`w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-bold outline-none transition-all ${formData.isCustomer ? 'bg-[#F0FDF4] text-[#073318] border-[#BBF7D0]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                value={formData.customerCode}
                                                readOnly
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-[#4B5563] flex items-center justify-between">
                                                <span>{t('modules:vendor_code')}</span>
                                                {isGeneratingCode && formData.isVendor && !formData.vendorCode && <Loader2 size={16} className="animate-spin text-[#073318]" />}
                                            </label>
                                            <input
                                                type="text"
                                                className={`w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-bold outline-none transition-all ${formData.isVendor ? 'bg-[#F0FDF4] text-[#073318] border-[#BBF7D0]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                value={formData.vendorCode}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Location Info */}
                            <div className="space-y-8 pt-6 border-t border-[#F3F4F6]">
                                <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                                    <div className="w-8 h-8 bg-[#073318]/5 rounded-lg flex items-center justify-center text-[#073318]">
                                        <MapPin size={18} />
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#111827]">Address & Location</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:address_1')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder={t('modules:enter_address_1')}
                                            className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                            value={formData.address1}
                                            onChange={(e) => handleInputChange('address1', e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:address_2')} <span className="text-gray-400 font-normal">({t('common:optional')})</span></label>
                                        <input
                                            type="text"
                                            placeholder={t('modules:enter_address_2')}
                                            className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                            value={formData.address2}
                                            onChange={(e) => handleInputChange('address2', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-[#4B5563] flex items-center justify-between">
                                                <span>{t('modules:pin_code')} <span className="text-red-500">*</span></span>
                                                {isFetchingPin && <Loader2 size={16} className="animate-spin text-[#073318]" />}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={t('modules:enter_pin_code')}
                                                className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                                value={formData.pinCode}
                                                onChange={(e) => handleInputChange('pinCode', e.target.value)}
                                            />
                                        </div>
                                        <CustomSelect
                                            label={`${t('modules:area')} (${t('common:optional')})`}
                                            placeholder={t('modules:enter_area')}
                                            options={areaOptions}
                                            value={formData.area}
                                            onChange={(val) => handleInputChange('area', val)}
                                            isSearchable={true}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:city')} <span className="text-gray-400 font-normal">({t('common:optional')})</span></label>
                                            <input
                                                type="text"
                                                className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-bold text-[#111827] outline-none transition-all bg-[#F1F5F9] cursor-not-allowed"
                                                value={formData.city}
                                                readOnly
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:state')} <span className="text-gray-400 font-normal">({t('common:optional')})</span></label>
                                            <input
                                                type="text"
                                                className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-bold text-[#111827] outline-none transition-all bg-[#F1F5F9] cursor-not-allowed"
                                                value={formData.state}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: MSME Info */}
                            <div className="pt-6 border-t border-[#F3F4F6]">
                                <div className="flex items-center justify-between p-6 bg-[#073318]/5 rounded-[20px] border border-[#073318]/10 group transition-all hover:border-[#073318]/20 hover:bg-[#073318]/10">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-[16px] font-bold text-[#111827]">{t('modules:msme')} Registration</h3>
                                        <p className="text-[14px] text-[#4B5563]">Enable if the account is registered under MSME</p>
                                    </div>
                                    <div
                                        className={`w-14 h-7 shrink-0 rounded-full flex items-center p-1 cursor-pointer transition-all duration-300 ${msmeEnabled ? 'bg-[#073318]' : 'bg-[#E5E7EB]'}`}
                                        onClick={() => setMsmeEnabled(!msmeEnabled)}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${msmeEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                                    </div>
                                </div>

                                {msmeEnabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 animate-in slide-in-from-top-6 duration-500">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:msme_id')} <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                placeholder={t('modules:enter_msme_id')}
                                                className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                                value={formData.msmeId}
                                                onChange={(e) => handleInputChange('msmeId', e.target.value)}
                                            />
                                        </div>
                                        <CustomSelect
                                            label={t('modules:reg_under')}
                                            placeholder={t('common:select')}
                                            options={REG_UNDER}
                                            value={formData.regUnder}
                                            onChange={(val) => handleInputChange('regUnder', val)}
                                            required={true}
                                        />
                                        <CustomSelect
                                            label={t('modules:reg_type')}
                                            placeholder={t('common:select')}
                                            options={REG_TYPES}
                                            value={formData.regType}
                                            onChange={(val) => handleInputChange('regType', val)}
                                            required={true}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-12 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Bank Details Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                                    <div className="w-8 h-8 bg-[#073318]/5 rounded-lg flex items-center justify-center text-[#073318]">
                                        <Banknote size={18} />
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#111827]">Bank Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:account_holder')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder={t('modules:enter_account_holder_name')}
                                            className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                            value={formData.accountHolder}
                                            onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:bank_name')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder={t('modules:enter_bank_name')}
                                            className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                            value={formData.bankName}
                                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:account_number')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder={t('modules:enter_account_number')}
                                            className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                            value={formData.accountNumber}
                                            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:ifsc_code')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder={t('modules:enter_ifsc_code')}
                                            className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                            value={formData.ifscCode}
                                            onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details Section */}
                            <div className="space-y-8 pt-6 border-t border-[#F3F4F6]">
                                <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                                    <div className="w-8 h-8 bg-[#073318]/5 rounded-lg flex items-center justify-center text-[#073318]">
                                        <Contact2 size={18} />
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#111827]">Contact Person Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:contact_person_name')} <span className="text-red-500">*</span></label>
                                        <div className="flex gap-4">
                                            <div className="w-[110px] shrink-0">
                                                <CustomSelect
                                                    options={PREFIX_OPTIONS}
                                                    value={formData.prefix}
                                                    onChange={(val) => handleInputChange('prefix', val)}
                                                    placeholder="Mr."
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={t('modules:enter_person_name')}
                                                className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                                value={formData.contactPersonName}
                                                onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:email_id')} <span className="text-gray-400 font-normal">({t('common:optional')})</span></label>
                                        <input
                                            type="text"
                                            placeholder={t('modules:enter_email_id')}
                                            className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                            value={formData.emailId}
                                            onChange={(e) => handleInputChange('emailId', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[14px] font-bold text-[#4B5563]">{t('modules:mobile_no')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder={t('modules:enter_mobile_number')}
                                            className="w-full h-[48px] border border-[#E5E7EB] rounded-[12px] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#073318] focus:ring-4 focus:ring-[#073318]/5 transition-all bg-[#F9FAFB] hover:bg-white"
                                            value={formData.mobileNo}
                                            onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="px-8 py-6 border-t border-[#F3F4F6] flex items-center justify-end gap-4 bg-[#F9FAFB]/50">
                    <button
                        onClick={onBack}
                        className="px-8 h-[52px] border border-[#E5E7EB] text-[#4B5563] rounded-[12px] text-[15px] font-bold hover:bg-white hover:text-[#111827] transition-all bg-white shadow-sm"
                    >
                        {t('common:cancel')}
                    </button>
                    {currentStep === 1 ? (
                        <button
                            onClick={() => setCurrentStep(2)}
                            disabled={!isNextActive}
                            className={`px-10 h-[52px] text-white rounded-[12px] text-[15px] font-bold transition-all shadow-md flex items-center justify-center min-w-[150px] ${
                                isNextActive 
                                    ? 'bg-[#073318] hover:bg-[#04200f] shadow-[#073318]/10' 
                                    : 'bg-gray-300 cursor-not-allowed shadow-none'
                            }`}
                        >
                            Next Step
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="px-8 h-[52px] border border-[#E5E7EB] text-[#4B5563] rounded-[12px] text-[15px] font-bold hover:bg-white hover:text-[#111827] transition-all bg-white shadow-sm"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleAddAccountSubmit}
                                disabled={!isAddAccountActive}
                                className={`px-10 h-[52px] text-white rounded-[12px] text-[15px] font-bold transition-all shadow-md flex items-center gap-3 min-w-[180px] ${
                                    isAddAccountActive 
                                        ? 'bg-[#073318] hover:bg-[#04200f] shadow-[#073318]/10' 
                                        : 'bg-gray-300 cursor-not-allowed shadow-none'
                                }`}
                            >
                                {isLoading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <span>{isEditMode ? t('modules:update_account') : t('modules:save_account')}</span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

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
