import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import unitService from '../../../../services/masters/unitService';
import { toast } from '../../../../utils/toast-mock';
import { translateDynamic } from '../../../../utils/i18nUtils';

const CustomSelect = ({ label, options, value, onChange, placeholder, isSearchable = false, disabled = false, showAsterisk = false, actionLabel = '', onAction = null, error = '' }) => {
    const { t } = useTranslation(['common']);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [subError, setSubError] = useState(false);
    const dropdownRef = useRef(null);

    const filteredOptions = isSearchable && searchTerm
        ? options.filter(opt => opt?.toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
                setIsAddingNew(false);
                setNewValue('');
                setSubError(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddNew = (e) => {
        e.stopPropagation();
        if (newValue.trim()) {
            onAction && onAction(newValue.trim().toUpperCase());
            setIsAddingNew(false);
            setNewValue('');
            setSubError(false);
            setIsOpen(false);
        } else {
            setSubError(true);
        }
    };

    return (
        <div className="flex flex-col gap-1.5 relative w-full" ref={dropdownRef}>
            <label className="text-[13px] font-semibold text-[#4B5563]">
                {label} {showAsterisk && <span className="text-red-500">*</span>}
            </label>
            <div
                className={`w-full h-[44px] flex items-center justify-between px-4 border rounded-[8px] bg-white transition-colors ${disabled ? 'cursor-default border-[#E5E7EB]' : isOpen ? 'border-[#014A36] ring-1 ring-[#014A36]/10 cursor-pointer' : 'border-[#E5E7EB] hover:border-gray-300 cursor-pointer'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {isSearchable && isOpen ? (
                    <input
                        type="text"
                        autoFocus
                        placeholder={value || placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-full bg-transparent outline-none text-[14px] text-[#111827] placeholder:text-gray-400 font-medium"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className={`text-[14px] truncate font-medium ${value ? 'text-[#111827]' : 'text-gray-400'}`}>
                        {value ? translateDynamic(value, t) : placeholder}
                    </span>
                )}
                {!disabled && (isOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />)}
            </div>
            {error && <span className="text-red-500 text-[12px] mt-0.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">{error}</span>}

            {isOpen && !disabled && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-[8px] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[240px] overflow-y-auto w-full py-1 custom-scrollbar">
                        {filteredOptions?.length > 0 ? (
                            filteredOptions.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${value === opt ? 'bg-[#F9FAFB] text-[#014A36] font-semibold' : 'text-[#4B5563] hover:bg-gray-50'}`}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    {translateDynamic(opt, t)}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-[14px] text-gray-500 text-center">{t('common:no_options_found')}</div>
                        )}
                    </div>

                    {actionLabel && onAction && (
                        <div className="border-t border-gray-200 p-1 bg-gray-50/50">
                            {isAddingNew ? (
                                <div className="flex flex-col gap-1 p-1">
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            autoFocus
                                            value={newValue}
                                            onChange={(e) => {
                                                setNewValue(e.target.value);
                                                if (e.target.value.trim()) setSubError(false);
                                            }}
                                            placeholder={t('common:enter_value')}
                                            className={`flex-1 h-[32px] px-3 bg-white border rounded-[4px] text-[13px] outline-none transition-colors ${subError ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]' : 'border-gray-200 focus:border-[#014A36]'}`}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddNew(e)}
                                        />
                                        <button
                                            onClick={handleAddNew}
                                            className="h-[32px] px-3 bg-[#014A36] text-white text-[12px] font-semibold rounded-[4px] hover:bg-[#013b2b]"
                                        >
                                            {t('common:add')}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsAddingNew(false);
                                                setNewValue('');
                                                setSubError(false);
                                            }}
                                            className="h-[32px] px-3 text-[#4B5563] text-[12px] font-medium hover:bg-gray-100 rounded-[4px]"
                                        >
                                            {t('common:cancel')}
                                        </button>
                                    </div>
                                    {subError && <span className="text-red-500 text-[11px] font-medium ml-1 animate-in fade-in slide-in-from-top-1 duration-200">Value is required</span>}
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAddingNew(true);
                                    }}
                                    className="w-full py-2.5 text-[14px] text-[#014A36] font-semibold hover:bg-[#014A36]/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="text-[18px]">+</span> {actionLabel}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const UnitForm = ({ mode = 'add', initialData = null, onBack, onSuccess }) => {
    const { t } = useTranslation(['modules', 'common']);
    const [loading, setLoading] = useState(false);
    const [unitNameOptions, setUnitNameOptions] = useState([]);
    const [gstUomOptions, setGstUomOptions] = useState([]);
    const [fullNameOptions, setFullNameOptions] = useState([]);

    const [formData, setFormData] = useState({
        unit_name: '',
        gst_uom: '',
        full_name_of_measurement: '',
    });
    const [errors, setErrors] = useState({});

    // Reset form when initialData changes or mode changes
    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && initialData) {
            setFormData({
                unit_name: initialData.unit_name || '',
                gst_uom: initialData.gst_uom || '',
                full_name_of_measurement: initialData.full_name_of_measurement || '',
            });
        } else if (mode === 'add') {
            setFormData({
                unit_name: '',
                gst_uom: '',
                full_name_of_measurement: '',
            });
        }
    }, [initialData, mode]);

    // Initial Load - Fetch Unit Names
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const response = await unitService.getUnitNames();
                setUnitNameOptions(response.data || []);

                // If editing, load dependent options safely
                if (mode === 'edit' && initialData) {
                    if (initialData.unit_name) {
                        try {
                            const uomRes = await unitService.getUomByUnitName(initialData.unit_name);
                            setGstUomOptions(uomRes.data || []);
                        } catch (err) { console.error("Error loading UOMs:", err); }
                    }
                    if (initialData.gst_uom) {
                        try {
                            const measurementRes = await unitService.getMeasurementByUom(initialData.gst_uom);
                            if (measurementRes.data) {
                                setFullNameOptions([measurementRes.data]);
                            }
                        } catch (err) { console.error("Error loading Measurement:", err); }
                    }
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };
        loadInitialData();
    }, [mode, initialData]);

    const handleUnitNameChange = async (value) => {
        setFormData(prev => ({
            ...prev,
            unit_name: value,
            gst_uom: '',
            full_name_of_measurement: ''
        }));
        setErrors(prev => ({ ...prev, unit_name: '' }));

        if (value) {
            try {
                const response = await unitService.getUomByUnitName(value);
                setGstUomOptions(response.data || []);
            } catch (error) {
                console.error('Error loading UOMs:', error);
            }
        } else {
            setGstUomOptions([]);
        }
    };

    const handleGstUomChange = async (value) => {
        setFormData(prev => ({
            ...prev,
            gst_uom: value,
            full_name_of_measurement: ''
        }));
        setErrors(prev => ({ ...prev, gst_uom: '' }));

        if (value) {
            try {
                const response = await unitService.getMeasurementByUom(value);
                const measurementName = response.data || '';
                setFormData(prev => ({
                    ...prev,
                    full_name_of_measurement: measurementName
                }));

                if (measurementName && !fullNameOptions.includes(measurementName)) {
                    setFullNameOptions(prev => [...prev, measurementName]);
                }
            } catch (error) {
                console.error('Error loading measurement name:', error);
            }
        }
    };

    const handleAddCustomUnitName = (newValue) => {
        if (!unitNameOptions.includes(newValue)) {
            setUnitNameOptions(prev => [...prev, newValue]);
        }
        handleUnitNameChange(newValue);
    };

    const handleAddCustomGstUom = (newValue) => {
        if (!gstUomOptions.includes(newValue)) {
            setGstUomOptions(prev => [...prev, newValue]);
        }
        setFormData(prev => ({ ...prev, gst_uom: newValue }));
    };

    const handleAddCustomFullName = (newValue) => {
        if (!fullNameOptions.includes(newValue)) {
            setFullNameOptions(prev => [...prev, newValue]);
        }
        setFormData(prev => ({ ...prev, full_name_of_measurement: newValue }));
    };

    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.unit_name) newErrors.unit_name = 'Unit Name is required';
        if (!formData.gst_uom) newErrors.gst_uom = 'GST UOM is required';
        if (!formData.full_name_of_measurement) newErrors.full_name_of_measurement = 'Measurement Name is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error(t('common:please_fill_required_fields'));
            return;
        }

        try {
            setLoading(true);
            const payload = {
                unit_name: formData.unit_name,
                gst_uom: formData.gst_uom,
                full_name_of_measurement: formData.full_name_of_measurement
            };

            if (mode === 'add') {
                await unitService.createUnit(payload);
            } else {
                // Ensure ID is a number and present
                const updateId = initialData?.id;
                if (!updateId) {
                    throw new Error('Update ID not found');
                }
                await unitService.updateUnit(updateId, payload);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving unit:', error);
            const message = error.response?.data?.message || t('common:error_saving_data');
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const isView = mode === 'view';

    const renderViewMode = () => (
        <div className="flex flex-col w-full bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden shadow-sm animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <h3 className="text-[16px] font-bold text-[#111827]">{t('modules:view_unit')}</h3>
            </div>

            <div className="flex flex-col">
                {[
                    { label: t('modules:unit_name'), value: formData.unit_name },
                    { label: t('modules:gst_uom'), value: formData.gst_uom },
                    { label: t('modules:full_name_of_measurement'), value: formData.full_name_of_measurement || '-' }
                ].map((item, idx) => (
                    <div key={idx} className="flex border-b border-[#E5E7EB] min-h-[52px]">
                        <div className="w-[200px] bg-[#F9FAFB] px-6 py-4 flex items-center border-r border-[#E5E7EB]">
                            <span className="text-[14px] font-semibold text-[#4B5563]">{item.label}:</span>
                        </div>
                        <div className="flex-1 px-6 py-4 flex items-center bg-white">
                            <span className="text-[14px] font-medium text-[#111827]">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-6 py-4 bg-white flex justify-end mt-4">
                <button
                    onClick={onBack}
                    className="px-8 h-[40px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white shadow-sm"
                >
                    {t('common:back')}
                </button>
            </div>
        </div>
    );

    if (isView) {
        return (
            <div className="flex flex-col w-full h-full p-2">
                {renderViewMode()}
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full animate-in fade-in duration-300">
            <div className="flex justify-end mb-6">
                <button
                    onClick={onBack}
                    className="px-6 h-[44px] bg-white border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                    {t('common:back')}
                </button>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col w-full">
                <div className="px-6 py-5 border-b border-[#E5E7EB]">
                    <h2 className="text-[18px] font-bold text-[#111827]">
                        {mode === 'add' ? t('modules:add_unit') : t('modules:update_unit')}
                    </h2>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-6 w-full">
                        <CustomSelect
                            label={t('modules:unit_name')}
                            placeholder={t('modules:select_unit_category')}
                            options={unitNameOptions}
                            value={formData.unit_name}
                            onChange={handleUnitNameChange}
                            showAsterisk={true}
                            disabled={isView}
                            actionLabel={t('modules:add_unit_name')}
                            onAction={handleAddCustomUnitName}
                            error={errors.unit_name}
                        />

                        <CustomSelect
                            label={t('modules:gst_uom')}
                            placeholder={t('modules:select_gst_uom')}
                            options={gstUomOptions}
                            value={formData.gst_uom}
                            onChange={handleGstUomChange}
                            isSearchable={true}
                            disabled={isView || !formData.unit_name}
                            showAsterisk={true}
                            actionLabel={t('modules:add_gst_uom')}
                            onAction={handleAddCustomGstUom}
                            error={errors.gst_uom}
                        />

                        <CustomSelect
                            label={t('modules:full_name_of_measurement')}
                            placeholder={t('modules:select_or_enter_full_name')}
                            options={fullNameOptions}
                            value={formData.full_name_of_measurement}
                            onChange={(val) => {
                                setFormData(prev => ({ ...prev, full_name_of_measurement: val }));
                                setErrors(prev => ({ ...prev, full_name_of_measurement: '' }));
                            }}
                            isSearchable={true}
                            disabled={isView || !formData.gst_uom}
                            showAsterisk={true}
                            actionLabel={t('modules:add_full_name_of_measurement')}
                            onAction={handleAddCustomFullName}
                            error={errors.full_name_of_measurement}
                        />
                    </div>
                </div>

                <div className="px-6 py-5 border-t border-[#E5E7EB] flex items-center justify-end gap-4 bg-white/50 rounded-b-[12px]">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={loading}
                        className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white"
                    >
                        {t('common:cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all shadow-sm flex items-center justify-center min-w-[140px]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            mode === 'add' ? t('modules:add_unit') : t('modules:update_unit')
                        )}
                    </button>
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

export default UnitForm;
