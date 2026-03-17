import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2, UploadCloud } from 'lucide-react';
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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = isSearchable && searchTerm && searchTerm.toLowerCase() !== (value || '').toLowerCase()
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
                className={`w-full h-[44px] flex items-center justify-between px-4 border rounded-[8px] bg-white transition-colors ${isOpen ? 'border-[#014A36] ring-1 ring-[#014A36]/10' : 'border-[#E5E7EB] hover:border-gray-300'} ${!isSearchable ? 'cursor-pointer' : ''}`}
                onClick={() => !isSearchable && setIsOpen(!isOpen)}
            >
                {isSearchable ? (
                    <input
                        type="text"
                        className="w-full h-full text-[14px] text-[#111827] outline-none bg-transparent placeholder:text-gray-500"
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
                    <span className={`text-[14px] truncate ${value ? 'text-[#111827]' : 'text-gray-500'}`}>
                        {value || placeholder}
                    </span>
                )}
                <div className="cursor-pointer" onClick={(e) => {
                    if (isSearchable) {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                        if (!isOpen) setSearchTerm(value || '');
                    }
                }}>
                    {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-[8px] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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

const FileUploadField = ({ label, onFileSelect, accept, maxMb, multiple = false }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);

    const handleFiles = (selectedFiles) => {
        const maxSize = maxMb * 1024 * 1024;
        const validFiles = Array.from(selectedFiles).filter(f => f.size <= maxSize);
        
        if (validFiles.length < selectedFiles.length) {
            toast.error(`Some files exceeded the ${maxMb}MB limit.`);
        }

        if (multiple) {
            setFiles(prev => [...prev, ...validFiles]);
            onFileSelect([...files, ...validFiles]);
        } else {
            setFiles(validFiles.slice(0, 1));
            onFileSelect(validFiles[0]);
        }
    };

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-semibold text-[#4B5563]">{label}</label>
            <div 
                className={`border-2 border-dashed rounded-[8px] p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
                    ${dragActive ? 'border-[#014A36] bg-[#014A36]/5' : 'border-gray-300 hover:border-[#014A36] bg-gray-50'}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleFiles(e.dataTransfer.files);
                    }
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept={accept} 
                    multiple={multiple}
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <UploadCloud size={24} className="text-gray-400 mb-2" />
                <p className="text-[14px] font-semibold text-[#014A36]">Click to upload <span className="text-gray-500 font-normal">or drag and drop</span></p>
                <p className="text-[12px] text-gray-400 mt-1">PDF, JPG, PNG (max. {maxMb}MB)</p>

                {files.length > 0 && (
                    <div className="mt-4 w-full text-left">
                        {files.map((file, idx) => (
                            <div key={idx} className="text-[12px] text-gray-600 truncate bg-white px-2 py-1 rounded border mb-1">
                                {file.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
        customerCreditDays: (initialData.isCustomer && initialData.creditDays) ? initialData.creditDays.toString() : '',
        customerOpBalance: (initialData.isCustomer && initialData.openingBalance) ? initialData.openingBalance.toString() : '',
        vendorCreditDays: (initialData.isVendor && initialData.creditDays) ? initialData.creditDays.toString() : '',
        vendorOpBalance: (initialData.isVendor && initialData.openingBalance) ? initialData.openingBalance.toString() : '',
        address1: initialData.addressLine1 || '',
        address2: initialData.addressLine2 || '',
        area: initialData.area || '',
        pinCode: initialData.pincode || '',
        city: initialData.city || '',
        state: initialData.state || '',
        subDistrict: initialData.subDistrict || '',
        district: initialData.city || '', // map city to district in UI based on api
        country: 'India',
        msmeId: initialData.msmeRegNo || '',
        regUnder: initialData.regUnder || '',
        regType: initialData.regType || '',
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
        customerCreditDays: '',
        customerOpBalance: '',
        vendorCreditDays: '',
        vendorOpBalance: '',
        address1: '',
        address2: '',
        area: '',
        pinCode: '',
        city: '',
        state: '',
        subDistrict: '',
        district: '',
        country: 'India',
        msmeId: '',
        regUnder: '',
        regType: '',
        prefix: '',
        contactPersonName: '',
        emailId: '',
        mobileNo: ''
    });

    const [msmeEnabled, setMsmeEnabled] = useState(Boolean(initialData?.msmeStatus || initialData?.msmeId));
    const [areaOptions, setAreaOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingCustomerCode, setIsGeneratingCustomerCode] = useState(false);
    const [isGeneratingVendorCode, setIsGeneratingVendorCode] = useState(false);
    const [isFetchingPin, setIsFetchingPin] = useState(false);

    const [msmeFile, setMsmeFile] = useState(null);
    const [otherDocs, setOtherDocs] = useState([]);

    const REG_UNDER = ['Micro', 'Small', 'Medium'];
    const REG_TYPES = ['Trading', 'Service', 'Manufacturing'];
    const PREFIX_OPTIONS = ['Mr', 'Mrs', 'Ms', 'Dr'];

    const handleInputChange = async (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'isCustomer' && value === true && !formData.customerCode) {
            setIsGeneratingCustomerCode(true);
            try {
                const res = await accountService.generateCustomerCode();
                if (res?.customerCode) setFormData(prev => ({ ...prev, customerCode: res.customerCode }));
            } catch (err) {
                toast.error('Failed to generate customer code');
            } finally {
                setIsGeneratingCustomerCode(false);
            }
        }

        if (field === 'isVendor' && value === true && !formData.vendorCode) {
            setIsGeneratingVendorCode(true);
            try {
                const res = await accountService.generateVendorCode();
                if (res?.vendorCode) setFormData(prev => ({ ...prev, vendorCode: res.vendorCode }));
            } catch (err) {
                toast.error('Failed to generate vendor code');
            } finally {
                setIsGeneratingVendorCode(false);
            }
        }

        if (field === 'pinCode' && value.length === 6) {
            setIsFetchingPin(true);
            try {
                const res = await accountService.lookupPincode(value);
                if (res) {
                    setFormData(prev => ({
                        ...prev,
                        city: res.city || res.district || prev.city,
                        district: res.district || res.city || prev.district,
                        subDistrict: res.subDistrict || '',
                        state: res.state || prev.state,
                        country: res.country || 'India',
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

    // Based on the prompt rules:
    // Required Fields: Account Name, Group Name, Address Line 1, Pincode, Contact Prefix, Contact Person Name, Mobile Number.
    const isFormValid = formData.accountName.trim() !== '' &&
                        (formData.isCustomer || formData.isVendor) &&
                        formData.panNo.trim() !== '' &&
                        formData.address1.trim() !== '' &&
                        formData.pinCode.trim() !== '' &&
                        formData.prefix.trim() !== '' &&
                        formData.contactPersonName.trim() !== '' &&
                        formData.mobileNo.trim() !== '' &&
                        isMsmeValid &&
                        !isLoading;

    const handleSave = async () => {
        if (!isFormValid) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsLoading(true);

        const creditDays = formData.isVendor ? parseInt(formData.vendorCreditDays || 0, 10) : parseInt(formData.customerCreditDays || 0, 10);
        const opBalance = formData.isVendor ? parseInt(formData.vendorOpBalance || 0, 10) : parseInt(formData.customerOpBalance || 0, 10);

        const payload = {
            accountName: formData.accountName,
            isCustomer: formData.isCustomer,
            isVendor: formData.isVendor,
            customerCode: formData.isCustomer ? formData.customerCode : undefined,
            vendorCode: formData.isVendor ? formData.vendorCode : undefined,
            gstNo: formData.gstNo || undefined,
            panNo: formData.panNo,
            creditDays: creditDays,
            openingBalance: opBalance,
            balanceType: 'Cr', // Assuming default as not in UI for new form
            addressLine1: formData.address1,
            addressLine2: formData.address2 || undefined,
            pincode: formData.pinCode,
            area: formData.area || undefined,
            city: formData.city || formData.district || 'Unknown', // mapped
            state: formData.state || 'Unknown',
            msmeStatus: msmeEnabled,
            msmeRegNo: msmeEnabled ? formData.msmeId : undefined,
            regUnder: msmeEnabled ? formData.regUnder : undefined,
            regType: msmeEnabled ? formData.regType : undefined,
            // Hidden bank details defaulting to undefined so backend validation passes
            accountHolderName: undefined,
            bankName: undefined,
            accountNumber: undefined,
            ifscCode: undefined,
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
        <div className="flex flex-col w-full h-full animate-in fade-in duration-300">
            {/* Top Action Bar */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={onBack}
                    className="px-6 h-[40px] bg-white border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Back
                </button>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col w-full h-[calc(100vh-160px)] relative">
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <div className="flex flex-col gap-10">
                        {/* 1. Basic Details */}
                        <div className="flex flex-col gap-6">
                            <h3 className="text-[16px] font-bold text-[#111827] border-b pb-2">Basic Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Account Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        Account Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter account name"
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.accountName}
                                        onChange={(e) => handleInputChange('accountName', e.target.value)}
                                    />
                                </div>
                                {/* Group Name Checkboxes */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        Group Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-6 h-[44px] items-center">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div onClick={() => handleInputChange('isVendor', !formData.isVendor)}
                                                 className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.isVendor ? 'bg-[#014A36] border-[#014A36]' : 'border-gray-300'}`}>
                                                {formData.isVendor && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                            </div>
                                            <span className="text-[14px] text-[#4B5563]">Sundry Creditors (Supplier)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div onClick={() => handleInputChange('isCustomer', !formData.isCustomer)}
                                                 className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.isCustomer ? 'bg-[#014A36] border-[#014A36]' : 'border-gray-300'}`}>
                                                {formData.isCustomer && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                            </div>
                                            <span className="text-[14px] text-[#4B5563]">Sundry Debtors (Customer)</span>
                                        </label>
                                    </div>
                                </div>

                                {/* GST and PAN */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">GST.No (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Enter GST number"
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.gstNo}
                                        onChange={(e) => handleInputChange('gstNo', e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        PAN.No <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter PAN number"
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.panNo}
                                        onChange={(e) => handleInputChange('panNo', e.target.value)}
                                    />
                                </div>

                                {/* Address */}
                                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        Address 1 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter address line 1"
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.address1}
                                        onChange={(e) => handleInputChange('address1', e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">Address 2 (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Enter address line 2"
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.address2}
                                        onChange={(e) => handleInputChange('address2', e.target.value)}
                                    />
                                </div>

                                {/* Pincode & Area */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563] flex justify-between">
                                        <span>Pin Code <span className="text-red-500">*</span></span>
                                        {isFetchingPin && <Loader2 size={14} className="animate-spin text-[#014A36]" />}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter pin code"
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.pinCode}
                                        onChange={(e) => handleInputChange('pinCode', e.target.value)}
                                    />
                                </div>
                                <CustomSelect
                                    label="Area (Optional)"
                                    placeholder="Enter area"
                                    options={areaOptions}
                                    value={formData.area}
                                    onChange={(val) => handleInputChange('area', val)}
                                    isSearchable={true}
                                />

                                {/* Auto fetched details */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">Sub District</label>
                                    <input type="text" readOnly placeholder="Sub District will be fetched automatically" className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-500 rounded-[8px] px-4 text-[14px] outline-none" value={formData.subDistrict} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">District (Optional)</label>
                                    <input type="text" readOnly placeholder="District will be fetched automatically" className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-500 rounded-[8px] px-4 text-[14px] outline-none" value={formData.district} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">State (Optional)</label>
                                    <input type="text" readOnly placeholder="State will be fetched automatically" className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-500 rounded-[8px] px-4 text-[14px] outline-none" value={formData.state} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">Country (Optional)</label>
                                    <input type="text" readOnly placeholder="Country will be fetched automatically" className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-500 rounded-[8px] px-4 text-[14px] outline-none" value={formData.country} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Contact Person Details */}
                        <div className="flex flex-col gap-6">
                            <h3 className="text-[16px] font-bold text-[#111827] border-b pb-2">Contact Person Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <CustomSelect
                                    label="Prefix"
                                    required={true}
                                    placeholder="Select prefix"
                                    options={PREFIX_OPTIONS}
                                    value={formData.prefix}
                                    onChange={(val) => handleInputChange('prefix', val)}
                                />
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        Contact Person Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter person name"
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.contactPersonName}
                                        onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">Email ID (Optional)</label>
                                    <input
                                        type="email"
                                        placeholder="Enter email id"
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.emailId}
                                        onChange={(e) => handleInputChange('emailId', e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        Mobile.No <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter mobile number"
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.mobileNo}
                                        onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Ledger Details */}
                        <div className="flex flex-col gap-6">
                            <h3 className="text-[16px] font-bold text-[#111827] border-b pb-2">Ledger Details</h3>
                            
                            {formData.isVendor && (
                                <div className="flex flex-col gap-4">
                                    <h4 className="text-[14px] font-semibold text-[#4B5563]">Supplier</h4>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[13px] font-semibold text-[#4B5563] flex justify-between">
                                            <span>Supplier Code</span>
                                            {isGeneratingVendorCode && <Loader2 size={12} className="animate-spin text-[#014A36]" />}
                                        </label>
                                        <input type="text" readOnly placeholder="Code will auto generated" value={formData.vendorCode} className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-600 rounded-[8px] px-4 text-[14px] outline-none" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-semibold text-[#4B5563]">Credit Days</label>
                                            <input type="number" placeholder="Enter Credit Days" value={formData.vendorCreditDays} onChange={e => handleInputChange('vendorCreditDays', e.target.value)} className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-semibold text-[#4B5563]">Opening Balance(Optional)</label>
                                            <input type="number" placeholder="Enter Opening Balance" value={formData.vendorOpBalance} onChange={e => handleInputChange('vendorOpBalance', e.target.value)} className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.isCustomer && (
                                <div className="flex flex-col gap-4 mt-2">
                                    <h4 className="text-[14px] font-semibold text-[#4B5563]">Customer</h4>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[13px] font-semibold text-[#4B5563] flex justify-between">
                                            <span>Customer Code</span>
                                            {isGeneratingCustomerCode && <Loader2 size={12} className="animate-spin text-[#014A36]" />}
                                        </label>
                                        <input type="text" readOnly placeholder="Code will auto generated" value={formData.customerCode} className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-600 rounded-[8px] px-4 text-[14px] outline-none" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-semibold text-[#4B5563]">Credit Days</label>
                                            <input type="number" placeholder="Enter Credit Days" value={formData.customerCreditDays} onChange={e => handleInputChange('customerCreditDays', e.target.value)} className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-semibold text-[#4B5563]">Opening Balance (Optional)</label>
                                            <input type="number" placeholder="Enter Opening Balance" value={formData.customerOpBalance} onChange={e => handleInputChange('customerOpBalance', e.target.value)} className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. MSME Details */}
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">MSME (Optional)</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-11 h-6 shrink-0 rounded-full flex items-center p-1 cursor-pointer transition-colors ${msmeEnabled ? 'bg-[#014A36]' : 'bg-gray-200'}`}
                                            onClick={() => setMsmeEnabled(!msmeEnabled)}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${msmeEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                        {msmeEnabled && (
                                            <input
                                                type="text"
                                                placeholder="Enter MSME ID"
                                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                                value={formData.msmeId}
                                                onChange={(e) => handleInputChange('msmeId', e.target.value)}
                                            />
                                        )}
                                    </div>
                                </div>
                                {msmeEnabled && (
                                    <CustomSelect
                                        label="Reg.Under"
                                        placeholder="Select Reg.Under"
                                        options={REG_UNDER}
                                        value={formData.regUnder}
                                        onChange={(val) => handleInputChange('regUnder', val)}
                                    />
                                )}
                                {msmeEnabled && (
                                    <CustomSelect
                                        label="Reg.Type"
                                        placeholder="Select Reg.Type"
                                        options={REG_TYPES}
                                        value={formData.regType}
                                        onChange={(val) => handleInputChange('regType', val)}
                                    />
                                )}
                            </div>

                            {msmeEnabled && (
                                <div className="w-full md:w-1/2">
                                    <FileUploadField 
                                        label="MSME certificate" 
                                        accept=".pdf, .jpg, .jpeg, .png" 
                                        maxMb={10} 
                                        onFileSelect={setMsmeFile} 
                                    />
                                </div>
                            )}
                        </div>

                        {/* 5. Other Documents */}
                        <div className="flex flex-col gap-6 w-full md:w-1/2">
                            <FileUploadField 
                                label="Other Documents" 
                                accept=".pdf, .jpg, .jpeg, .png" 
                                maxMb={10} 
                                multiple={true}
                                onFileSelect={setOtherDocs} 
                            />
                        </div>
                    </div>
                    
                    {/* Action buttons at bottom */}
                    <div className="mt-10 flex justify-end gap-4 py-4 border-t">
                        <button
                            onClick={handleSave}
                            disabled={!isFormValid || isLoading}
                            className={`px-8 h-[40px] text-white rounded-[8px] text-[14px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                                (isFormValid && !isLoading) ? 'bg-[#A3B8B0] hover:bg-[#8CA299] text-[#014A36]' : 'bg-[#D1D5DB] cursor-not-allowed'
                            }`}
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            Save
                        </button>
                        <button
                            onClick={onBack}
                            className="px-8 h-[40px] bg-white border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
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
