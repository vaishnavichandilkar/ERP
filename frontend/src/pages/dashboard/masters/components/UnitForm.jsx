import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import unitService from '../../../../services/masters/unitService';
import { toast } from '../../../../utils/toast-mock';

// GST UOM Library Data
const UOM_LIBRARY = [
    { fullName: "BAGS", unitName: "Quantity", uom: "BAG" },
    { fullName: "BALE", unitName: "Quantity", uom: "BAL" },
    { fullName: "BUNDLES", unitName: "Quantity", uom: "BDL" },
    { fullName: "BUCKLES", unitName: "Quantity", uom: "BKL" },
    { fullName: "BILLIONS OF UNITS", unitName: "Quantity", uom: "BOU" },
    { fullName: "BOX", unitName: "Quantity", uom: "BOX" },
    { fullName: "BOTTLES", unitName: "Quantity", uom: "BTL" },
    { fullName: "BUNCHES", unitName: "Quantity", uom: "BUN" },
    { fullName: "CANS", unitName: "Quantity", uom: "CAN" },
    { fullName: "CUBIC METER", unitName: "Volume", uom: "CBM" },
    { fullName: "CUBIC CENTIMETER", unitName: "Volume", uom: "CCM" },
    { fullName: "CENTIMETER", unitName: "Length", uom: "CMS" },
    { fullName: "CARTONS", unitName: "Quantity", uom: "CTN" },
    { fullName: "DOZEN", unitName: "Quantity", uom: "DOZ" },
    { fullName: "DRUM", unitName: "Quantity", uom: "DRM" },
    { fullName: "GREAT GROSS", unitName: "Quantity", uom: "GGR" },
    { fullName: "GRAMS", unitName: "Weight", uom: "GMS" },
    { fullName: "GROSS", unitName: "Quantity", uom: "GRS" },
    { fullName: "GROSS YARDS", unitName: "Length", uom: "GYD" },
    { fullName: "KILOGRAMS", unitName: "Weight", uom: "KGS" },
    { fullName: "KILOLITER", unitName: "Volume", uom: "KLR" },
    { fullName: "KILOMETER", unitName: "Length", uom: "KME" },
    { fullName: "MILLILITER", unitName: "Volume", uom: "MLT" },
    { fullName: "METERS", unitName: "Length", uom: "MTR" },
    { fullName: "METRIC TONS", unitName: "Weight", uom: "MTS" },
    { fullName: "NUMBERS", unitName: "Quantity", uom: "NOS" },
    { fullName: "PACKS", unitName: "Quantity", uom: "PAC" },
    { fullName: "PIECES", unitName: "Quantity", uom: "PCS" },
    { fullName: "PAIRS", unitName: "Quantity", uom: "PRS" },
    { fullName: "QUINTAL", unitName: "Weight", uom: "QTL" },
    { fullName: "ROLLS", unitName: "Quantity", uom: "ROL" },
    { fullName: "SETS", unitName: "Quantity", uom: "SET" },
    { fullName: "TABLETS", unitName: "Quantity", uom: "TBS" },
    { fullName: "TEN GROSS", unitName: "Quantity", uom: "TGM" },
    { fullName: "THOUSANDS", unitName: "Quantity", uom: "THD" },
    { fullName: "TONNES", unitName: "Weight", uom: "TON" },
    { fullName: "TUBES", unitName: "Quantity", uom: "TUB" },
    { fullName: "US GALLONS", unitName: "Volume", uom: "UGS" },
    { fullName: "UNITS", unitName: "Quantity", uom: "UNT" },
    { fullName: "YARDS", unitName: "Length", uom: "YDS" },
    { fullName: "OTHERS", unitName: "Quantity", uom: "OTH" },
    { fullName: "MILLIMETER", unitName: "Length", uom: "MMT" },
    { fullName: "INCH", unitName: "Length", uom: "INH" },
    { fullName: "FOOT", unitName: "Length", uom: "FT" },
    { fullName: "MILE", unitName: "Length", uom: "MIL" },
    { fullName: "MILLIGRAM", unitName: "Weight", uom: "MGM" },
    { fullName: "POUND", unitName: "Weight", uom: "LBS" },
    { fullName: "LITER", unitName: "Volume", uom: "LTR" }
];

const INITIAL_UNIT_NAME_OPTIONS = ["Length", "Quantity", "Volume", "Weight"];

const CustomSelect = ({ label, options, value, onChange, placeholder, isSearchable = false, disabled = false, showAsterisk = false, actionLabel = '', onAction = null }) => {
    const { t } = useTranslation(['common']);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newValue, setNewValue] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = isSearchable && searchTerm
        ? options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
                setIsAddingNew(false);
                setNewValue('');
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
            setIsOpen(false);
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
                        {value || placeholder}
                    </span>
                )}
                {!disabled && (isOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />)}
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-[8px] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[240px] overflow-y-auto w-full py-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
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
                                    {opt}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-[14px] text-gray-500 text-center">{t('common:no_options_found')}</div>
                        )}
                    </div>

                    {actionLabel && onAction && (
                        <div className="border-t border-gray-200 p-1 bg-gray-50/50">
                            {isAddingNew ? (
                                <div className="flex items-center gap-2 p-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        placeholder={t('common:enter_value')}
                                        className="flex-1 h-[32px] px-3 bg-white border border-gray-200 rounded-[4px] text-[13px] outline-none focus:border-[#014A36]"
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
                                        }}
                                        className="h-[32px] px-3 text-[#4B5563] text-[12px] font-medium hover:bg-gray-100 rounded-[4px]"
                                    >
                                        {t('common:cancel')}
                                    </button>
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
    const [unitNameOptions, setUnitNameOptions] = useState(INITIAL_UNIT_NAME_OPTIONS);
    const [fullNameOptions, setFullNameOptions] = useState([...new Set(UOM_LIBRARY.map(u => u.fullName))]);
    const [uomLibrary, setUomLibrary] = useState(UOM_LIBRARY);

    const [formData, setFormData] = useState({
        unitName: initialData?.unitName || '',
        gstUom: initialData?.gstUom || '',
        fullName: initialData?.gstUqc?.quantity || '',
        description: initialData?.description || ''
    });

    const filteredUomOptions = formData.unitName 
        ? uomLibrary.filter(u => u.unitName === formData.unitName).map(u => u.uom)
        : uomLibrary.map(u => u.uom);

    const handleInputChange = (field, value) => {
        if (field === 'unitName') {
            setFormData(prev => ({
                ...prev,
                unitName: value,
                gstUom: '',
                fullName: ''
            }));
        } else if (field === 'gstUom') {
            const selectedUom = uomLibrary.find(u => u.uom === value);
            setFormData(prev => ({
                ...prev,
                gstUom: value,
                fullName: selectedUom ? selectedUom.fullName : prev.fullName
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleAddUnitName = (newValue) => {
        if (!unitNameOptions.includes(newValue)) {
            setUnitNameOptions(prev => [...prev, newValue]);
        }
        handleInputChange('unitName', newValue);
    };

    const handleAddGstUom = (newValue) => {
        // Just select it, user will fill full name
        setFormData(prev => ({ ...prev, gstUom: newValue }));
    };

    const handleAddFullName = (newValue) => {
        if (!fullNameOptions.includes(newValue)) {
            setFullNameOptions(prev => [...prev, newValue]);
        }
        setFormData(prev => ({ ...prev, fullName: newValue }));
    };

    const handleSubmit = async () => {
        if (!formData.unitName || !formData.gstUom || !formData.fullName) {
            toast.error(t('common:please_fill_required_fields'));
            return;
        }

        try {
            setLoading(true);
            const submitData = {
                unitName: formData.unitName,
                gstUom: formData.gstUom,
                description: formData.description,
                fullName: formData.fullName
            };

            if (mode === 'add') {
                await unitService.createUnit(submitData);
            } else {
                await unitService.updateUnit(initialData.id, submitData);
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
                    { label: t('modules:unit_name'), value: formData.unitName },
                    { label: t('modules:gst_uom'), value: formData.gstUom },
                    { label: 'Full Name of Measurement', value: formData.fullName || '-' }
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
            {/* Top Action Bar */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={onBack}
                    className="px-6 h-[44px] bg-white border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                    {t('common:back')}
                </button>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col w-full">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#E5E7EB]">
                    <h2 className="text-[18px] font-bold text-[#111827]">
                        {mode === 'add' ? t('modules:add_unit') : t('modules:update_unit')}
                    </h2>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-6 w-full">
                        <CustomSelect
                            label={t('modules:unit_name')}
                            placeholder="Select Unit Category"
                            options={unitNameOptions}
                            value={formData.unitName}
                            onChange={(val) => handleInputChange('unitName', val)}
                            showAsterisk={true}
                            disabled={isView}
                            actionLabel="Add Unit Name"
                            onAction={handleAddUnitName}
                        />

                        <CustomSelect
                            label={t('modules:gst_uom')}
                            placeholder="Select GST UOM"
                            options={filteredUomOptions}
                            value={formData.gstUom}
                            onChange={(val) => handleInputChange('gstUom', val)}
                            isSearchable={true}
                            disabled={isView}
                            showAsterisk={true}
                            actionLabel="Add GST UOM"
                            onAction={handleAddGstUom}
                        />

                        <CustomSelect
                            label="Full Name of Measurement"
                            placeholder="Select or Enter Full Name"
                            options={fullNameOptions}
                            value={formData.fullName}
                            onChange={(val) => handleInputChange('fullName', val)}
                            isSearchable={true}
                            disabled={isView}
                            showAsterisk={true}
                            actionLabel="Add Full Name of Measurement"
                            onAction={handleAddFullName}
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-5 border-t border-[#E5E7EB] flex items-center justify-end gap-4 bg-white/50 rounded-b-[12px]">
                    <button
                        onClick={onBack}
                        disabled={loading}
                        className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white"
                    >
                        {t('common:cancel')}
                    </button>
                    <button
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
