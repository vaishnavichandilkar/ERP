import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, Loader2, UploadCloud, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import accountService from '../../../../services/accountService';

const CustomSelect = ({ label, options, value, onChange, onBlur, placeholder, isSearchable = false, required = false, widthClass = "w-full", error = "" }) => {
    const { t } = useTranslation(['common']);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (isOpen) {
                    setIsOpen(false);
                    if (onBlur) onBlur();
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onBlur]);

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
                className={`w-full h-[44px] flex items-center justify-between px-4 border rounded-[8px] bg-white transition-colors ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500/10' : isOpen ? 'border-[#014A36] ring-1 ring-[#014A36]/10' : 'border-[#E5E7EB] hover:border-gray-300'} ${!isSearchable ? 'cursor-pointer' : ''}`}
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
                        onBlur={onBlur}
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

            {error && <p className="text-[12px] text-red-500 mt-0.5">{error}</p>}

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
    const { t } = useTranslation(['common']);
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);

    const handleFiles = (selectedFiles) => {
        const maxSize = maxMb * 1024 * 1024;
        const validFiles = Array.from(selectedFiles).filter(f => f.size <= maxSize);
        
        if (validFiles.length < selectedFiles.length) {
            toast.error(t('common:file_size_error', { max: maxMb }));
        }

        if (multiple) {
            setFiles(prev => {
                const nextFiles = [...prev, ...validFiles];
                onFileSelect(nextFiles);
                return nextFiles;
            });
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
                <p className="text-[14px] font-semibold text-[#014A36]">{t('common:click_to_upload')} <span className="text-gray-500 font-normal">{t('common:or_drag_drop')}</span></p>
                <p className="text-[12px] text-gray-400 mt-1">{t('common:file_limit_info', { max: maxMb })}</p>

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

const PREFIX_OPTIONS = ['Mr', 'Mrs', 'Miss', 'Ms'];
const REG_UNDER = ['Micro', 'Small', 'Medium'];
const REG_TYPE = ['Manufacturing', 'Service', 'Trading'];

const AddAccount = ({ onBack, onAddAccount, initialData, onUpdateAccount }) => {
    const { t } = useTranslation(['modules', 'common']);
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState(initialData ? {
        accountName: initialData.accountName || '',
        isCustomer: initialData.isCustomer || initialData.groupName?.some(g => g.toUpperCase().includes('DEBTOR')) || false,
        isVendor: initialData.isVendor || initialData.groupName?.some(g => g.toUpperCase().includes('CREDITOR')) || false,
        customerCode: initialData.customerCode || '',
        supplierCode: initialData.supplierCode || '',
        gstNo: initialData.gstNo || '',
        panNo: initialData.panNo || '',
        customerCreditDays: initialData.customerCreditDays ? initialData.customerCreditDays.toString() : (initialData.creditDays ? initialData.creditDays.toString() : ''),
        customerOpBalance: initialData.customerOpeningBalance ? initialData.customerOpeningBalance.toString() : (initialData.openingBalance ? initialData.openingBalance.toString() : ''),
        customerBalanceType: initialData.customerBalanceType || (initialData.customer?.balanceType ? initialData.customer.balanceType : 'Dr'),
        customerType: initialData.customerType || '',
        vendorCreditDays: initialData.supplierCreditDays ? initialData.supplierCreditDays.toString() : (initialData.creditDays ? initialData.creditDays.toString() : ''),
        vendorOpBalance: initialData.supplierOpeningBalance ? initialData.supplierOpeningBalance.toString() : (initialData.openingBalance ? initialData.openingBalance.toString() : ''),
        vendorBalanceType: initialData.supplierBalanceType || (initialData.supplier?.balanceType ? initialData.supplier.balanceType : 'Cr'),
        address1: initialData.addressLine1 || '',
        address2: initialData.addressLine2 || '',
        area: initialData.area || '',
        pinCode: initialData.pincode || '',
        city: initialData.city || '',
        state: initialData.state || '',
        subDistrict: initialData.subDistrict || '',
        district: initialData.city || '', // map city to district in UI based on api
        country: 'India',
        msmeId: initialData.msmeId || initialData.msmeRegNo || '',
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
        supplierCode: '',
        gstNo: '',
        panNo: '',
        customerCreditDays: '',
        customerOpBalance: '',
        customerBalanceType: 'Dr',
        customerType: '',
        vendorCreditDays: '',
        vendorOpBalance: '',
        vendorBalanceType: 'Cr',
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
    const [isGeneratingSupplierCode, setIsGeneratingSupplierCode] = useState(false);
    const [isFetchingPin, setIsFetchingPin] = useState(false);

    const [msmeFile, setMsmeFile] = useState(null);
    const [otherDocs, setOtherDocs] = useState([]);
    const [errors, setErrors] = useState({});

    const getFieldError = (name, value, currentFormData = formData) => {
        switch (name) {
            case 'accountName':
                if (!value?.trim()) return t('modules:error_account_name');
                if (value.trim().length < 3) return t('modules:error_account_name');
                break;
            case 'groupName':
                if (!currentFormData.isCustomer && !currentFormData.isVendor) return t('modules:error_group_name');
                break;
            case 'panNo':
                if (!value?.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.trim().toUpperCase())) {
                    return t('modules:error_pan_no');
                }
                break;
            case 'address1':
                if (!value?.trim()) return t('modules:error_address');
                break;
            case 'pinCode':
                if (!value || String(value).trim().length !== 6) {
                    return t('modules:error_pin_code');
                }
                break;
            case 'mobileNo':
                if (!value || String(value).trim().length !== 10) {
                    return t('modules:error_mobile_no');
                }
                break;
            case 'prefix':
                if (!value) return t('modules:error_prefix');
                break;
            case 'contactPersonName':
                if (!value?.trim()) return t('modules:error_contact_person');
                break;
            case 'msmeId':
                if (msmeEnabled) {
                    if (!value?.trim() || !/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(value.trim().toUpperCase())) {
                        return t('modules:error_msme_id');
                    }
                }
                break;
            case 'regUnder':
                if (msmeEnabled && !value) return t('modules:error_reg_under');
                break;
            case 'regType':
                if (msmeEnabled && !value) return t('modules:error_reg_type');
                break;
            case 'vendorOpBalance':
                if (value && parseFloat(value) < 0) return t('modules:error_amount');
                break;
            case 'customerOpBalance':
                if (value && parseFloat(value) < 0) return t('modules:error_amount');
                break;
        }
        return '';
    };

    const validateField = (name, value) => {
        const error = getFieldError(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const validateAll = () => {
        const newErrors = {};
        const fieldsToValidate = [
            'accountName', 'groupName', 'panNo', 'address1', 'pinCode', 
            'mobileNo', 'prefix', 'contactPersonName', 'vendorOpBalance', 'customerOpBalance'
        ];
        
        if (msmeEnabled) {
            fieldsToValidate.push('msmeId', 'regUnder', 'regType');
        }

        fieldsToValidate.forEach(field => {
            const val = field === 'groupName' ? null : (field === 'mobileNo' || field === 'pinCode' ? String(formData[field] || '') : formData[field]);
            const err = getFieldError(field, val, formData);
            if (err) newErrors[field] = err;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = async (field, value) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);

        // Remove error automatically when corrected
        const fieldToValidate = (field === 'isCustomer' || field === 'isVendor') ? 'groupName' : field;
        if (errors[fieldToValidate]) {
            const val = fieldToValidate === 'groupName' ? null : value;
            const error = getFieldError(fieldToValidate, val, newFormData);
            if (!error) {
                setErrors(prev => {
                    const newErrs = { ...prev };
                    delete newErrs[fieldToValidate];
                    return newErrs;
                });
            } else {
                setErrors(prev => ({ ...prev, [fieldToValidate]: error }));
            }
        }

        if (field === 'isCustomer' && value === true && !formData.customerCode) {
            setIsGeneratingCustomerCode(true);
            try {
                const res = await accountService.generateCustomerCode();
                if (res?.customerCode) setFormData(prev => ({ ...prev, customerCode: res.customerCode }));
            } catch (_err) {
                toast.error(t('modules:error_generate_customer_code'));
            } finally {
                setIsGeneratingCustomerCode(false);
            }
        }

        if (field === 'isVendor' && value === true && !formData.supplierCode) {
            setIsGeneratingSupplierCode(true);
            try {
                const res = await accountService.generateSupplierCode();
                if (res?.supplierCode) setFormData(prev => ({ ...prev, supplierCode: res.supplierCode }));
            } catch (_err) {
                toast.error(t('modules:error_generate_supplier_code'));
            } finally {
                setIsGeneratingSupplierCode(false);
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
                    toast.success(t('modules:success_location_fetched'));
                }
            } catch (_err) {
                toast.error(t('modules:error_fetch_pincode'));
            } finally {
                setIsFetchingPin(false);
            }
        }
    };

    const handleSave = async () => {
        if (!validateAll()) return;
        
        if (!isFormValid) {
            // Find which field is missing
            if (!formData.accountName?.trim() || formData.accountName.trim().length < 3) return toast.error("Missing valid Account Name");
            if (!formData.isCustomer && !formData.isVendor) return toast.error("Please select at least one Account Type");
            if (!formData.panNo?.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.trim().toUpperCase())) return toast.error("Missing valid PAN Number");
            if (!formData.address1?.trim()) return toast.error("Missing Address Line 1");
            if (!String(formData.pinCode || '').trim() || String(formData.pinCode).trim().length !== 6) return toast.error("Missing 6-digit Pincode");
            if (!formData.prefix?.trim()) return toast.error("Missing Name Prefix");
            if (!formData.contactPersonName?.trim()) return toast.error("Missing Contact Person Name");
            if (!String(formData.mobileNo || '').trim() || String(formData.mobileNo).trim().length !== 10) return toast.error("Missing 10-digit Mobile Number");
            if (msmeEnabled && (!formData.msmeId?.trim() || !/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(formData.msmeId.trim().toUpperCase()))) return toast.error("Missing valid MSME ID");
            return;
        }

        setIsLoading(true);

        const fData = new FormData();
        fData.append('accountName', formData.accountName);
        let groups = [];
        if (formData.isVendor) groups.push('SUNDRY_CREDITORS');
        if (formData.isCustomer) groups.push('SUNDRY_DEBTORS');
        fData.append('groupName', JSON.stringify(groups));

        if (formData.gstNo) fData.append('gstNo', formData.gstNo);
        fData.append('panNo', formData.panNo);
        fData.append('addressLine1', formData.address1);
        if (formData.address2) fData.append('addressLine2', formData.address2);
        fData.append('pincode', formData.pinCode);
        if (formData.area) fData.append('area', formData.area);
        fData.append('subDistrict', formData.subDistrict || '');
        fData.append('district', formData.district || formData.city || '');
        fData.append('state', formData.state || '');
        fData.append('country', formData.country || 'India');

        fData.append('prefix', formData.prefix);
        fData.append('contactPersonName', formData.contactPersonName);
        if (formData.emailId) fData.append('emailId', formData.emailId);
        fData.append('mobileNo', formData.mobileNo);

        if (formData.isVendor) {
            if (formData.supplierCode) fData.append('supplierCode', formData.supplierCode);
            if (formData.vendorCreditDays) fData.append('supplierCreditDays', formData.vendorCreditDays);
            if (formData.vendorOpBalance) fData.append('supplierOpeningBalance', formData.vendorOpBalance);
            fData.append('supplierBalanceType', formData.vendorBalanceType || 'Cr');
        }

        if (formData.isCustomer) {
            if (formData.customerCode) fData.append('customerCode', formData.customerCode);
            if (formData.customerCreditDays) fData.append('customerCreditDays', formData.customerCreditDays);
            if (formData.customerOpBalance) fData.append('customerOpeningBalance', formData.customerOpBalance);
            fData.append('customerBalanceType', formData.customerBalanceType || 'Dr');
            if (formData.customerType) fData.append('customerType', formData.customerType);
        }

        if (otherDocs.length > 0) {
             console.log('--- Appending otherDocuments to FormData ---');
             console.log('Found documents:', otherDocs.length);
             otherDocs.forEach((d, i) => {
                 console.log(`Document ${i}:`, d.name, d.size);
                 fData.append('otherDocuments', d);
             });
        } else {
             console.log('--- No otherDocuments to append ---');
        }

        fData.append('msmeEnabled', msmeEnabled ? 'true' : 'false');
        if (msmeEnabled) {
             fData.append('msmeId', formData.msmeId);
             fData.append('regUnder', formData.regUnder);
             fData.append('regType', formData.regType);
             if (msmeFile) fData.append('msmeCertificate', msmeFile);
        }

        try {
            if (isEditMode) {
                const response = await accountService.updateAccount(initialData.id, fData);
                toast.success(t('modules:success_account_updated'));
                if (onUpdateAccount) onUpdateAccount(response);
            } else {
                const response = await accountService.createAccount(fData);
                toast.success(t('modules:success_account_created'));
                if (onAddAccount) onAddAccount(response);
            }
        } catch (error) {
            const errorData = error?.response?.data;
            if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                errorData.errors.forEach(err => toast.error(err));
            } else {
                toast.error(errorData?.message || 'Failed to save account');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = React.useMemo(() => {
        if (!formData.accountName?.trim() || formData.accountName.trim().length < 3) return false;
        if (!formData.isCustomer && !formData.isVendor) return false;
        if (!formData.panNo?.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.trim().toUpperCase())) return false;
        if (formData.gstNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNo.trim().toUpperCase())) return false;
        if (!formData.address1?.trim()) return false;
        if (!String(formData.pinCode || '').trim() || String(formData.pinCode).trim().length !== 6) return false;
        if (!formData.prefix?.trim()) return false;
        if (!formData.contactPersonName?.trim()) return false;
        if (!String(formData.mobileNo || '').trim() || String(formData.mobileNo).trim().length !== 10) return false;
        
        if (msmeEnabled) {
            if (!formData.msmeId?.trim() || !/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(formData.msmeId.trim().toUpperCase())) return false;
            if (!formData.regUnder?.trim()) return false;
            if (!formData.regType?.trim()) return false;
        }

        return true;
    }, [formData, msmeEnabled]);

    return (
        <div className="flex flex-col w-full animate-in fade-in duration-300">
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col w-full relative">
                <div className="flex border-b border-[#E5E7EB] px-6 py-4 items-center justify-between">
                    <h2 className="text-[18px] font-bold text-[#111827]">{isEditMode ? t('modules:edit_account') : t('modules:add_account')}</h2>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] text-[14px] font-bold hover:bg-gray-50 transition-all bg-white shadow-sm"
                    >
                        <ArrowLeft size={18} />
                        {t('common:back')}
                    </button>
                </div>
                <div className="p-6 md:p-8">
                    <div className="flex flex-col gap-10">
                        {/* 1. Basic Details */}
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                 {/* Account Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('modules:account_name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t('modules:enter_account_name')}
                                        className={`w-full h-[44px] border rounded-[8px] px-4 text-[14px] outline-none transition-colors ${errors.accountName ? 'border-red-500 focus:ring-1 focus:ring-red-500/10' : 'border-[#E5E7EB] focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                                        value={formData.accountName}
                                        onChange={(e) => handleInputChange('accountName', e.target.value)}
                                        onBlur={() => validateField('accountName', formData.accountName)}
                                    />
                                    {errors.accountName && <p className="text-[12px] text-red-500 mt-0.5">{errors.accountName}</p>}
                                </div>
                                {/* Group Name Checkboxes */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('modules:account_type')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-4 h-[44px] items-center">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div onClick={() => handleInputChange('isVendor', !formData.isVendor)}
                                                 className={`w-[22px] h-[22px] rounded border flex items-center justify-center transition-all ${errors.groupName ? 'border-red-500' : formData.isVendor ? 'border-[#D1D5DB] bg-white' : 'border-[#E5E7EB] bg-white'}`}>
                                                {formData.isVendor && <Check size={16} className="text-[#6B7280]" />}
                                            </div>
                                            <span className="text-[14px] text-[#6B7280]">{t('modules:sundry_creditors')}</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div onClick={() => handleInputChange('isCustomer', !formData.isCustomer)}
                                                 className={`w-[22px] h-[22px] rounded border flex items-center justify-center transition-all ${errors.groupName ? 'border-red-500' : formData.isCustomer ? 'border-[#D1D5DB] bg-white' : 'border-[#E5E7EB] bg-white'}`}>
                                                {formData.isCustomer && <Check size={16} className="text-[#6B7280]" />}
                                            </div>
                                            <span className="text-[14px] text-[#6B7280]">{t('modules:sundry_debtors')}</span>
                                        </label>
                                    </div>
                                    {errors.groupName && <p className="text-[12px] text-red-500 mt-0.5">{errors.groupName}</p>}
                                </div>

                                 {/* GST and PAN */}
                                 <div className="flex flex-col gap-1.5">
                                     <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:gst_no')} ({t('common:optional')})</label>
                                     <input
                                         type="text"
                                         placeholder={t('modules:enter_gst_number')}
                                         className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                         value={formData.gstNo}
                                         onChange={(e) => handleInputChange('gstNo', e.target.value.toUpperCase())}
                                     />
                                 </div>
                                 <div className="flex flex-col gap-1.5">
                                     <label className="text-[13px] font-semibold text-[#4B5563]">
                                         {t('modules:pan_no')} <span className="text-red-500">*</span>
                                     </label>
                                     <input
                                         type="text"
                                         placeholder={t('modules:enter_pan_number')}
                                         className={`w-full h-[44px] border rounded-[8px] px-4 text-[14px] outline-none transition-colors ${errors.panNo ? 'border-red-500 focus:ring-1 focus:ring-red-500/10' : 'border-[#E5E7EB] focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                                         value={formData.panNo}
                                         onChange={(e) => handleInputChange('panNo', e.target.value.toUpperCase())}
                                         onBlur={() => validateField('panNo', formData.panNo)}
                                     />
                                     {errors.panNo && <p className="text-[12px] text-red-500 mt-0.5">{errors.panNo}</p>}
                                 </div>

                                 {/* Address */}
                                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('modules:address_1')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t('modules:enter_address_1')}
                                        className={`w-full h-[44px] border rounded-[8px] px-4 text-[14px] outline-none transition-colors ${errors.address1 ? 'border-red-500 focus:ring-1 focus:ring-red-500/10' : 'border-[#E5E7EB] focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                                        value={formData.address1}
                                        onChange={(e) => handleInputChange('address1', e.target.value)}
                                        onBlur={() => validateField('address1', formData.address1)}
                                    />
                                    {errors.address1 && <p className="text-[12px] text-red-500 mt-0.5">{errors.address1}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:address_2')} ({t('common:optional')})</label>
                                    <input
                                        type="text"
                                        placeholder={t('modules:enter_address_2')}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.address2}
                                        onChange={(e) => handleInputChange('address2', e.target.value)}
                                    />
                                </div>

                                 {/* Pincode & Area */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563] flex justify-between">
                                        <span>{t('modules:pin_code')} <span className="text-red-500">*</span></span>
                                        {isFetchingPin && <Loader2 size={14} className="animate-spin text-[#014A36]" />}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder={t('modules:enter_pin_code')}
                                        className={`hide-spinner w-full h-[44px] border rounded-[8px] px-4 text-[14px] outline-none transition-colors ${errors.pinCode ? 'border-red-500 focus:ring-1 focus:ring-red-500/10' : 'border-[#E5E7EB] focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                                        value={formData.pinCode}
                                        onChange={(e) => handleInputChange('pinCode', e.target.value)}
                                        onBlur={() => validateField('pinCode', formData.pinCode)}
                                    />
                                    {errors.pinCode && <p className="text-[12px] text-red-500 mt-0.5">{errors.pinCode}</p>}
                                </div>
                                <CustomSelect
                                    label={`${t('modules:area')} (${t('common:optional')})`}
                                    placeholder={t('modules:enter_area')}
                                    options={areaOptions}
                                    value={formData.area}
                                    onChange={(val) => handleInputChange('area', val)}
                                    isSearchable={true}
                                />

                                 {/* Auto fetched details */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:sub_district')}</label>
                                    <input type="text" readOnly placeholder={`${t('modules:sub_district')} ${t('modules:fetched_automatically')}`} className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-500 rounded-[8px] px-4 text-[14px] outline-none" value={formData.subDistrict} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:district')} ({t('common:optional')})</label>
                                    <input type="text" readOnly placeholder={`${t('modules:district')} ${t('modules:fetched_automatically')}`} className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-500 rounded-[8px] px-4 text-[14px] outline-none" value={formData.district} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:state')} ({t('common:optional')})</label>
                                    <input type="text" readOnly placeholder={`${t('modules:state')} ${t('modules:fetched_automatically')}`} className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-500 rounded-[8px] px-4 text-[14px] outline-none" value={formData.state} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:country')} ({t('common:optional')})</label>
                                    <input type="text" readOnly placeholder={`${t('modules:country')} ${t('modules:fetched_automatically')}`} className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-500 rounded-[8px] px-4 text-[14px] outline-none" value={formData.country} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Contact Person Details */}
                        <div className="flex flex-col gap-6">
                            <h3 className="text-[16px] font-bold text-[#111827] border-b pb-2">{t('modules:contact_person_details')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                 <CustomSelect
                                    label={t('modules:prefix')}
                                    required={true}
                                    placeholder={t('modules:select_prefix')}
                                    options={PREFIX_OPTIONS}
                                    value={formData.prefix}
                                    onChange={(val) => handleInputChange('prefix', val)}
                                    onBlur={() => validateField('prefix', formData.prefix)}
                                    error={errors.prefix}
                                />
                                 <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('modules:contact_person_name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t('modules:enter_person_name')}
                                        className={`w-full h-[44px] border rounded-[8px] px-4 text-[14px] outline-none transition-colors ${errors.contactPersonName ? 'border-red-500 focus:ring-1 focus:ring-red-500/10' : 'border-[#E5E7EB] focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                                        value={formData.contactPersonName}
                                        onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                                        onBlur={() => validateField('contactPersonName', formData.contactPersonName)}
                                    />
                                    {errors.contactPersonName && <p className="text-[12px] text-red-500 mt-0.5">{errors.contactPersonName}</p>}
                                </div>
                                 <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:email_id')} ({t('common:optional')})</label>
                                    <input
                                        type="email"
                                        placeholder={t('modules:enter_email_id')}
                                        className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10"
                                        value={formData.emailId}
                                        onChange={(e) => handleInputChange('emailId', e.target.value)}
                                    />
                                </div>
                                 <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">
                                        {t('modules:mobile_no')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder={t('modules:enter_mobile_number')}
                                        className={`hide-spinner w-full h-[44px] border rounded-[8px] px-4 text-[14px] outline-none transition-colors ${errors.mobileNo ? 'border-red-500 focus:ring-1 focus:ring-red-500/10' : 'border-[#E5E7EB] focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                                        value={formData.mobileNo}
                                        onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                                        onBlur={() => validateField('mobileNo', formData.mobileNo)}
                                    />
                                    {errors.mobileNo && <p className="text-[12px] text-red-500 mt-0.5">{errors.mobileNo}</p>}
                                </div>
                            </div>
                        </div>

                         {/* 3. Ledger Details */}
                        <div className="flex flex-col gap-6">
                            <h3 className="text-[16px] font-bold text-[#111827] border-b pb-2">{t('modules:ledger_details')}</h3>
                            
                             {formData.isVendor && (
                                <div className="flex flex-col gap-4">
                                    <h4 className="text-[14px] font-semibold text-[#4B5563]">{t('modules:supplier')}</h4>
                                     <div className="flex flex-col gap-1.5">
                                        <label className="text-[13px] font-semibold text-[#4B5563] flex justify-between">
                                            <span>{t('modules:supplier_code')}</span>
                                            {isGeneratingSupplierCode && <Loader2 size={12} className="animate-spin text-[#014A36]" />}
                                        </label>
                                        <input type="text" readOnly placeholder={t('modules:code_auto_generated')} value={formData.supplierCode} className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-600 rounded-[8px] px-4 text-[14px] outline-none" />
                                    </div>
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:credit_days')}</label>
                                            <input type="number" placeholder={t('modules:enter_credit_days')} value={formData.vendorCreditDays} onChange={e => handleInputChange('vendorCreditDays', e.target.value)} className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:opening_balance')}</label>
                                            <div className="flex w-full gap-2">
                                                <input
                                                    type="number"
                                                    placeholder={t('modules:enter_op_balance')}
                                                    value={formData.vendorOpBalance}
                                                    onChange={e => handleInputChange('vendorOpBalance', e.target.value)}
                                                    onBlur={() => validateField('vendorOpBalance', formData.vendorOpBalance)}
                                                    className={`hide-spinner flex-1 h-[44px] border rounded-[8px] px-4 text-[14px] outline-none transition-colors ${errors.vendorOpBalance ? 'border-red-500 focus:ring-1 focus:ring-red-500/10' : 'border-[#E5E7EB] focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                                                />
                                                <div className="w-[80px]">
                                                    <CustomSelect
                                                        options={['Cr', 'Dr']}
                                                        value={formData.vendorBalanceType}
                                                        onChange={(val) => handleInputChange('vendorBalanceType', val)}
                                                    />
                                                </div>
                                            </div>
                                            {errors.vendorOpBalance && <p className="text-[12px] text-red-500 mt-0.5">{errors.vendorOpBalance}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                             {formData.isCustomer && (
                                <div className="flex flex-col gap-4 mt-2">
                                    <h4 className="text-[14px] font-semibold text-[#4B5563]">{t('modules:customer')}</h4>
                                     <div className="flex flex-col gap-1.5">
                                        <label className="text-[13px] font-semibold text-[#4B5563] flex justify-between">
                                            <span>{t('modules:customer_code')}</span>
                                            {isGeneratingCustomerCode && <Loader2 size={12} className="animate-spin text-[#014A36]" />}
                                        </label>
                                        <input type="text" readOnly placeholder={t('modules:code_auto_generated')} value={formData.customerCode} className="w-full h-[44px] border border-[#E5E7EB] bg-gray-50 text-gray-600 rounded-[8px] px-4 text-[14px] outline-none" />
                                    </div>
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:credit_days')}</label>
                                            <input type="number" placeholder={t('modules:enter_credit_days')} value={formData.customerCreditDays} onChange={e => handleInputChange('customerCreditDays', e.target.value)} className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:opening_balance')}</label>
                                            <div className="flex w-full gap-2">
                                                <input
                                                    type="number"
                                                    placeholder={t('modules:enter_op_balance')}
                                                    value={formData.customerOpBalance}
                                                    onChange={e => handleInputChange('customerOpBalance', e.target.value)}
                                                    onBlur={() => validateField('customerOpBalance', formData.customerOpBalance)}
                                                    className={`hide-spinner flex-1 h-[44px] border rounded-[8px] px-4 text-[14px] outline-none transition-colors ${errors.customerOpBalance ? 'border-red-500 focus:ring-1 focus:ring-red-500/10' : 'border-[#E5E7EB] focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                                                />
                                                <div className="w-[80px]">
                                                    <CustomSelect
                                                        options={['Dr', 'Cr']}
                                                        value={formData.customerBalanceType}
                                                        onChange={(val) => handleInputChange('customerBalanceType', val)}
                                                    />
                                                </div>
                                            </div>
                                            {errors.customerOpBalance && <p className="text-[12px] text-red-500 mt-0.5">{errors.customerOpBalance}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-semibold text-[#4B5563]">Customer Type</label>
                                            <CustomSelect
                                                options={['industrial', 'institutional', 'dealer', 'retailer']}
                                                value={formData.customerType}
                                                onChange={(val) => handleInputChange('customerType', val)}
                                                placeholder="Select Customer Type"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Other Documents */}
                         <div className="flex flex-col gap-6 w-full md:w-1/2">
                            <FileUploadField 
                                label={t('modules:other_documents')} 
                                accept=".pdf, .jpg, .jpeg, .png" 
                                maxMb={10} 
                                multiple={true}
                                onFileSelect={setOtherDocs} 
                            />
                        </div>

                         {/* 5. MSME Details */}
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-semibold text-[#4B5563]">{t('modules:msme')} ({t('common:optional')})</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-11 h-6 shrink-0 rounded-full flex items-center p-1 cursor-pointer transition-colors ${msmeEnabled ? 'bg-[#014A36]' : 'bg-gray-200'}`}
                                            onClick={() => {
                                                const newVal = !msmeEnabled;
                                                setMsmeEnabled(newVal);
                                                if (!newVal) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        msmeId: '',
                                                        regUnder: '',
                                                        regType: ''
                                                    }));
                                                    setMsmeFile(null);
                                                }
                                            }}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${msmeEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                         {msmeEnabled && (
                                             <div className="flex-1 flex flex-col gap-1.5">
                                                 <input
                                                     type="text"
                                                     placeholder={t('modules:enter_msme_id')}
                                                     className={`w-full h-[44px] border rounded-[8px] px-4 text-[14px] outline-none transition-colors ${errors.msmeId ? 'border-red-500 focus:ring-1 focus:ring-red-500/10' : 'border-[#E5E7EB] focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                                                     value={formData.msmeId}
                                                     onChange={(e) => handleInputChange('msmeId', e.target.value.toUpperCase())}
                                                     onBlur={() => validateField('msmeId', formData.msmeId)}
                                                 />
                                                 {errors.msmeId && <p className="text-[12px] text-red-500 mt-0.5">{errors.msmeId}</p>}
                                             </div>
                                         )}
                                    </div>
                                </div>
                                {msmeEnabled && (
                                     <CustomSelect
                                         label={t('modules:reg_under')}
                                         placeholder={t('modules:select_reg_under')}
                                         options={REG_UNDER.map(opt => t(`modules:${opt.toLowerCase()}`))}
                                         value={formData.regUnder}
                                         onChange={(val) => handleInputChange('regUnder', val)}
                                        onBlur={() => validateField('regUnder', formData.regUnder)}
                                        error={errors.regUnder}
                                    />
                                )}
                                {msmeEnabled && (
                                     <CustomSelect
                                        label={t('modules:reg_type')}
                                        placeholder={t('modules:select_reg_type')}
                                        options={REG_TYPE.map(opt => t(`modules:${opt.toLowerCase()}`))}
                                        value={formData.regType}
                                        onChange={(val) => handleInputChange('regType', val)}
                                        onBlur={() => validateField('regType', formData.regType)}
                                        error={errors.regType}
                                    />
                                )}
                            </div>

                             {msmeEnabled && (
                                <div className="w-full md:w-1/2">
                                    <FileUploadField 
                                        label={t('modules:msme_certificate')} 
                                        accept=".pdf, .jpg, .jpeg, .png" 
                                        maxMb={10} 
                                        onFileSelect={setMsmeFile} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Action buttons at bottom */}
                    <div className="mt-10 flex justify-end gap-4 py-4 border-t">
                         <button
                            onClick={handleSave}
                            disabled={isLoading || !isFormValid}
                            className={`px-8 h-[40px] rounded-[8px] text-[14px] font-semibold transition-colors flex items-center justify-center ${
                                !isLoading && isFormValid ? 'bg-[#073318] hover:bg-[#04200f] text-white shadow-sm' : 'bg-[#D1D5DB] text-white cursor-not-allowed'
                            }`}
                        >
                            {t('common:save')}
                        </button>
                             <button
                                onClick={onBack}
                                className="px-8 h-[40px] bg-white border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors"
                            >
                                {t('common:cancel')}
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
                .hide-spinner::-webkit-inner-spin-button,
                .hide-spinner::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .hide-spinner {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
};

export default AddAccount;
