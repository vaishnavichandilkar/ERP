import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CustomSelect = ({ label, options, value, onChange, placeholder, isSearchable = false }) => {
    const { t } = useTranslation('common');
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
                {label} <span className="text-red-500">*</span>
            </label>
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
                                placeholder={t('search')}
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
                            <div className="px-4 py-3 text-[14px] text-gray-500 text-center">{t('no_options_found')}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const AddProduct = ({ onBack }) => {
    const { t } = useTranslation(['modules', 'common']);
    const [formData, setFormData] = useState({
        productName: '',
        productCode: '',
        uom: '',
        productType: '',
        category: '',
        subcategory: '',
        hsnCode: '',
        tax: '',
        description: ''
    });

    const UOM_LIST = [
        'BAG', 'BAL', 'BDL', 'BKL', 'BOU', 'BOX', 'BTL', 'BUN', 'CAN', 'CBM',
        'CCM', 'CMS', 'CTN', 'DOZ', 'DRM', 'GGR', 'GMS', 'GRS', 'GYD', 'KGS',
        'KLR', 'KME', 'MLT', 'MTR', 'MTS', 'NOS', 'PAC', 'PCS', 'PRS', 'QTL',
        'ROL', 'SET', 'SQF', 'SQM', 'SQY', 'TBS', 'TGM', 'THD', 'TON', 'TUB',
        'UGC', 'UNT', 'YDS', 'OTHER'
    ];

    const PRODUCT_TYPES = [t('goods'), t('service')];
    const CATEGORIES = [t('cattle_feed'), t('fertilizers'), 'Weighing Equipment', 'Agricultural Inputs'];
    const SUBCATEGORIES = [t('maize_silage'), t('organic_fertilizers'), 'Digital Indicator', 'Crop Nutrients'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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
                    <h2 className="text-[18px] font-bold text-[#111827]">{t('add_product')}</h2>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Product Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('product_name')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_product_name')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.productName}
                                onChange={(e) => handleInputChange('productName', e.target.value)}
                            />
                        </div>

                        {/* Product Code */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('product_code')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('product_code_auto')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.productCode}
                                onChange={(e) => handleInputChange('productCode', e.target.value)}
                            />
                        </div>

                        {/* UOM */}
                        <CustomSelect
                            label={t('uom')}
                            placeholder={t('common:select')}
                            options={UOM_LIST}
                            value={formData.uom}
                            onChange={(val) => handleInputChange('uom', val)}
                            isSearchable={true}
                        />

                        {/* Product Type */}
                        <CustomSelect
                            label={t('product_type')}
                            placeholder={t('common:select')}
                            options={PRODUCT_TYPES}
                            value={formData.productType}
                            onChange={(val) => handleInputChange('productType', val)}
                        />

                        {/* Category */}
                        <CustomSelect
                            label={t('category')}
                            placeholder={t('common:select')}
                            options={CATEGORIES}
                            value={formData.category}
                            onChange={(val) => handleInputChange('category', val)}
                        />

                        {/* Sub Category */}
                        <CustomSelect
                            label={t('sub_category')}
                            placeholder={t('common:select')}
                            options={SUBCATEGORIES}
                            value={formData.subcategory}
                            onChange={(val) => handleInputChange('subcategory', val)}
                        />

                        {/* HSN Code */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('hsn_code')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('enter_hsn_code')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.hsnCode}
                                onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                            />
                        </div>

                        {/* Tax */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-[#4B5563]">
                                {t('tax_percent')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('tax_auto')}
                                className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                                value={formData.tax}
                                onChange={(e) => handleInputChange('tax', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Product Description */}
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[13px] font-semibold text-[#4B5563]">
                            {t('product_desc')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder={t('enter_product_desc')}
                            className="w-full h-[44px] border border-[#E5E7EB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/10 transition-all bg-white"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-5 border-t border-[#E5E7EB] flex items-center justify-end gap-4 bg-white/50 rounded-b-[12px]">
                    <button
                        onClick={onBack}
                        className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors"
                    >
                        {t('common:cancel')}
                    </button>
                    <button
                        className="px-8 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-colors shadow-sm opacity-60 hover:opacity-100"
                    >
                        {t('add_product')}
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

export default AddProduct;
