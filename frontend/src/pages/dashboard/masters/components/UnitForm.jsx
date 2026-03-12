import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import masterService from '../../../../services/masterService';
// import { toast } from 'react-hot-toast';
const toast = {
    success: (msg) => console.log('SUCCESS:', msg),
    error: (msg) => console.log('ERROR:', msg)
};

const CustomSelect = ({ label, options, value, onChange, placeholder, isSearchable = false, disabled = false, showAsterisk = false }) => {
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
        <div className="flex flex-col gap-1.5 relative w-full" ref={dropdownRef}>
            <label className="text-[13px] font-semibold text-[#4B5563]">
                {label} {showAsterisk && <span className="text-red-500">*</span>}
            </label>
            <div
                className={`w-full h-[44px] flex items-center justify-between px-4 border rounded-[8px] bg-white transition-colors ${disabled ? 'cursor-default border-[#E5E7EB]' : isOpen ? 'border-[#014A36] ring-1 ring-[#014A36]/10 cursor-pointer' : 'border-[#E5E7EB] hover:border-gray-300 cursor-pointer'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`text-[14px] truncate ${value ? 'text-[#111827]' : 'text-gray-500'}`}>
                    {value || placeholder}
                </span>
                {!disabled && (isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />)}
            </div>

            {isOpen && !disabled && (
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

const UnitForm = ({ mode = 'add', initialData = null, onBack, onSuccess }) => {
    const { t } = useTranslation(['modules', 'common']);
    const [loading, setLoading] = useState(false);
    const [uomOptions, setUomOptions] = useState([]);

    const [formData, setFormData] = useState({
        unitName: initialData?.unitName || '',
        gstUom: initialData?.gstUom || '',
        description: initialData?.description || ''
    });

    useEffect(() => {
        const fetchUomList = async () => {
            try {
                const response = await masterService.getGstUomList();
                setUomOptions(response.data.map(u => u.uqcCode));
            } catch (error) {
                console.error('Error fetching UOM list:', error);
            }
        };
        fetchUomList();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.unitName || !formData.gstUom) {
            toast.error(t('common:please_fill_required_fields'));
            return;
        }

        try {
            setLoading(true);
            if (mode === 'add') {
                await masterService.createUnit(formData);
                toast.success(t('common:added_successfully'));
            } else {
                await masterService.updateUnit(initialData.id, formData);
                toast.success(t('common:updated_successfully'));
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
    const showAsterisk = mode === 'add';

    const renderInput = (label, field, placeholder) => (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[13px] font-semibold text-[#4B5563]">
                {label} {showAsterisk && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                placeholder={placeholder}
                disabled={isView}
                className={`w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none transition-all bg-white 
                    ${isView ? 'cursor-default' : 'focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10'}`}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
            />
        </div>
    );

    return (
        <div className="flex flex-col w-full h-full animate-in fade-in duration-300">
            {/* Top Action Bar */}
            {mode !== 'view' && (
                <div className="flex justify-end mb-4 mt-2">
                    <button
                        onClick={onBack}
                        className="px-6 py-1.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-[6px] text-[13px] font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        {t('common:back')}
                    </button>
                </div>
            )}

            {/* Form Container */}
            <div className="flex flex-col w-full">
                {/* Form Body */}
                <div className="flex flex-col gap-6">
                    {renderInput(t('unit_name'), 'unitName', t('enter_unit_name'))}

                    <CustomSelect
                        label={t('gst_uom')}
                        placeholder={t('select_gst_uom')}
                        options={uomOptions}
                        value={formData.gstUom}
                        onChange={(val) => handleInputChange('gstUom', val)}
                        isSearchable={true}
                        disabled={isView}
                        showAsterisk={showAsterisk}
                    />

                    {renderInput(t('common:description'), 'description', t('common:enter_description'))}

                    {/* Footer Buttons */}
                    <div className={`pt-6 flex items-center ${mode === 'view' ? 'justify-end' : 'justify-end gap-4'}`}>
                        {mode === 'view' ? (
                            <button
                                onClick={onBack}
                                className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white"
                            >
                                {t('common:back')}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-8 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-colors shadow-sm opacity-90 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                                    {mode === 'add' ? t('add_unit') : t('update_unit')}
                                </button>
                                <button
                                    onClick={onBack}
                                    disabled={loading}
                                    className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white disabled:opacity-50"
                                >
                                    {t('common:exit')}
                                </button>
                            </>
                        )}
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

export default UnitForm;
