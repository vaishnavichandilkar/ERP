import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { toast } from 'react-hot-toast';
import { 
    ArrowLeft, 
    Search, 
    Trash2, 
    Plus, 
    Save, 
    Printer, 
    X,
    ChevronDown,
    Calendar,
    FileText,
    Percent,
    Hash,
    ChevronsUpDown
} from 'lucide-react';

const MOCK_SUPPLIERS = [
    { 
        id: 1, 
        name: "SilverPeak Traders", 
        address: "123, Industrial Area, Phase II, Pune, Maharashtra - 411026",
        credit_days: 30,
        gst_no: "27AAACS1234A1Z5",
        pan_no: "AAACS1234A"
    },
    { 
        id: 2, 
        name: "BlueStone Supplies", 
        address: "G-45, Market Yard, Sangli, Maharashtra - 416416",
        credit_days: 15,
        gst_no: "27BBBSX5678B2Z1",
        pan_no: "BBBSX5678B"
    },
    { 
        id: 3, 
        name: "GreenLeaf Distributors", 
        address: "Near Railway Station, Nashik, Maharashtra - 422001",
        credit_days: 45,
        gst_no: "27CCCDY9101C3Z9",
        pan_no: "CCCDY9101C"
    }
];

const MOCK_PRODUCTS = [
    { id: 1, code: "PRD-001", name: "Premium Basmati Rice", uom: "KG", hsn: "10063010", tax: 5, rate: 85, category: "Grains", sub_category: "Rice" },
    { id: 2, code: "PRD-002", name: "Refined Sunflower Oil", uom: "LR", hsn: "15121910", tax: 12, rate: 120, category: "Oils", sub_category: "Refined" },
    { id: 3, code: "PRD-003", name: "Whole Wheat Flour", uom: "KG", hsn: "11010000", tax: 0, rate: 45, category: "Flour", sub_category: "Wheat" },
    { id: 4, code: "PRD-004", name: "Organic Green Tea", uom: "PK", hsn: "09021010", tax: 5, rate: 250, category: "Beverages", sub_category: "Tea" },
];

const AddPO = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [formData, setFormData] = useState({
        supplier_name: '',
        address: '',
        po_number: '', 
        gst_number: '',
        credit_days: '',
        creation_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        pan_number: ''
    });

    const [items, setItems] = useState([
        { 
            id: Date.now(), 
            product_code: '', 
            product_name: '', 
            quantity: 0, 
            rate: 0, 
            uom: '', 
            discount_amount: 0, 
            discount_percent: 0, 
            hsn: '', 
            tax_percent: 0, 
            before_tax: 0, 
            tax_amount: 0, 
            total_amount: 0,
            description: '' 
        }
    ]);

    const [tableSearch, setTableSearch] = useState('');
    const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);

    // Initial load for Edit Mode or PO Number generation
    useEffect(() => {
        const storedPOs = JSON.parse(localStorage.getItem('purchase_orders') || '[]');

        if (isEditMode) {
            const poToEdit = storedPOs.find(p => String(p.id) === String(id));
            if (poToEdit) {
                setFormData({
                    supplier_name: poToEdit.supplier_name,
                    address: poToEdit.address,
                    po_number: poToEdit.po_no,
                    gst_number: poToEdit.gst_number,
                    credit_days: poToEdit.credit_days,
                    creation_date: poToEdit.po_creation_date ? poToEdit.po_creation_date.split('-').reverse().join('-') : formData.creation_date,
                    expiry_date: poToEdit.expiry_date ? poToEdit.expiry_date.split('-').reverse().join('-') : '',
                    pan_number: poToEdit.pan_number || ''
                });
                setSupplierSearch(poToEdit.supplier_name);
                if (poToEdit.items) {
                    setItems(poToEdit.items);
                } else {
                    // Fallback mock items if needed
                    setItems([{ id: Date.now(), product_name: 'Existing Product', quantity: 1, rate: poToEdit.po_amount, total_amount: poToEdit.total_amount }]);
                }
            } else {
                toast.error("Purchase Order not found");
                navigate(ROUTES.PURCHASE_ORDER);
            }
        } else {
            // Auto-generate next PO number
            const lastPO = storedPOs.reduce((max, po) => {
                const num = parseInt(po.po_no.replace('PO', '')) || 0;
                return num > max ? num : max;
            }, 0);
            const nextID = String(lastPO + 1).padStart(5, '0');
            setFormData(prev => ({ ...prev, po_number: `PO${nextID}` }));
        }
    }, [id, isEditMode]);

    // Save functionality
    const handleSave = () => {
        // Validation
        if (!formData.supplier_name || !formData.address || !formData.credit_days) {
            toast.error("Please fill all required supplier details");
            return;
        }

        if (items.length === 0 || !items[0].product_name) {
            toast.error("Please add at least one product");
            return;
        }

        const storedPOs = JSON.parse(localStorage.getItem('purchase_orders') || '[]');
        
        const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0);
        const taxAmount = items.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);

        const newPOData = {
            id: isEditMode ? Number(id) : Date.now(),
            po_no: formData.po_number,
            supplier_name: formData.supplier_name,
            address: formData.address,
            po_creation_date: formData.creation_date.split('-').reverse().join('-'),
            expiry_date: formData.expiry_date ? formData.expiry_date.split('-').reverse().join('-') : '',
            po_amount: totalAmount - taxAmount,
            gst_number: formData.gst_number,
            pan_number: formData.pan_number,
            credit_days: Number(formData.credit_days),
            tax_amount: taxAmount,
            total_amount: totalAmount,
            status: isEditMode ? (storedPOs.find(p => String(p.id) === String(id))?.status || "Pending") : "Pending",
            items: items
        };

        let updatedPOs;
        if (isEditMode) {
            updatedPOs = storedPOs.map(po => String(po.id) === String(id) ? newPOData : po);
            toast.success("Purchase Order updated successfully");
        } else {
            updatedPOs = [newPOData, ...storedPOs];
            toast.success("Purchase Order saved successfully");
        }

        localStorage.setItem('purchase_orders', JSON.stringify(updatedPOs));
        navigate(ROUTES.PURCHASE_ORDER);
    };

    // Filtered suppliers for dropdown
    const filteredSuppliers = useMemo(() => {
        return MOCK_SUPPLIERS.filter(s => 
            s.name.toLowerCase().includes(supplierSearch.toLowerCase())
        );
    }, [supplierSearch]);

    // Filter products for the main search bar
    const filteredProducts = useMemo(() => {
        if (!tableSearch.trim()) return [];
        const term = tableSearch.toLowerCase();
        return MOCK_PRODUCTS.filter(p => 
            p.name.toLowerCase().includes(term) ||
            p.code.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term) ||
            p.sub_category.toLowerCase().includes(term) ||
            p.hsn.toLowerCase().includes(term) ||
            p.tax.toString().includes(term)
        );
    }, [tableSearch]);

    const handleSelectSupplier = (supplier) => {
        setFormData({
            ...formData,
            supplier_name: supplier.name,
            address: supplier.address,
            gst_number: supplier.gst_no,
            credit_days: supplier.credit_days,
            pan_number: supplier.pan_no
        });
        setIsSupplierDropdownOpen(false);
        setSupplierSearch(supplier.name);
    };

    const handleQuickAddProduct = (product) => {
        const newItem = {
            id: Date.now(), 
            product_code: product.code, 
            product_name: product.name, 
            quantity: 1, 
            rate: product.rate, 
            uom: product.uom, 
            discount_amount: 0, 
            discount_percent: 0, 
            hsn: product.hsn, 
            tax_percent: product.tax, 
            before_tax: product.rate.toFixed(2), 
            tax_amount: (product.rate * product.tax / 100).toFixed(2), 
            total_amount: (product.rate * (1 + product.tax / 100)).toFixed(2),
            description: '' 
        };
        
        // Remove empty row if it's the only one
        if (items.length === 1 && !items[0].product_name) {
            setItems([newItem]);
        } else {
            setItems([...items, newItem]);
        }
        
        setTableSearch('');
        setIsProductSearchOpen(false);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        const item = newItems[index];
        item[field] = value;

        // Auto Calculations
        if (field === 'quantity' || field === 'rate' || field === 'discount_amount' || field === 'discount_percent' || field === 'tax_percent') {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            let discAmt = parseFloat(item.discount_amount) || 0;
            let discPct = parseFloat(item.discount_percent) || 0;
            const taxPct = parseFloat(item.tax_percent) || 0;

            const baseAmount = qty * rate;

            // Sync Discount Amount and Percent
            if (field === 'discount_percent' && baseAmount > 0) {
                discAmt = (baseAmount * discPct) / 100;
                item.discount_amount = discAmt.toFixed(2);
            } else if (field === 'discount_amount' && baseAmount > 0) {
                discPct = (discAmt / baseAmount) * 100;
                item.discount_percent = discPct.toFixed(2);
            }

            const amountBeforeTax = baseAmount - discAmt;
            const taxAmt = (amountBeforeTax * taxPct) / 100;
            const finalAmout = amountBeforeTax + taxAmt;

            item.before_tax = amountBeforeTax.toFixed(2);
            item.tax_amount = taxAmt.toFixed(2);
            item.total_amount = finalAmout.toFixed(2);
        }

        setItems(newItems);
    };

    const addNewRow = () => {
        setItems([...items, { 
            id: Date.now(), 
            product_code: '', 
            product_name: '', 
            quantity: 0, 
            rate: 0, 
            uom: '', 
            discount_amount: 0, 
            discount_percent: 0, 
            hsn: '', 
            tax_percent: 0, 
            before_tax: 0, 
            tax_amount: 0, 
            total_amount: 0,
            description: '' 
        }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handlePrintPreview = () => {
        const fullPOData = {
            ...formData,
            items: items.map(item => ({
                ...item,
                before_tax: (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)).toFixed(2),
                tax_amount: ((parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)) * (parseFloat(item.tax_percent || 0) / 100)).toFixed(2),
                total_amount: ((parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)) * (1 + parseFloat(item.tax_percent || 0) / 100)).toFixed(2)
            }))
        };
        navigate(ROUTES.PURCHASE_ORDER_PRINT, { state: { poData: fullPOData } });
    };

    const totalBillAmount = items.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* Main Integrated Form Card */}
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* Header Section */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-[#F3F4F6]">
                    <h2 className="text-[20px] font-bold text-[#111827]">{isEditMode ? 'Edit PO' : 'Add PO'}</h2>
                    <button 
                        onClick={() => navigate(ROUTES.PURCHASE_ORDER)}
                        className="flex items-center gap-2 px-6 h-[40px] border border-[#E5E7EB] rounded-[10px] text-[14px] font-bold text-[#4B5563] hover:bg-gray-50 transition-all font-outfit"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                </div>

                {/* Form Fields Section */}
                <div className="p-8 border-b border-[#F3F4F6]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {/* Row 1 */}
                        <div className="space-y-2 relative">
                            <label className="text-[14px] font-semibold text-[#374151] font-outfit">Supplier Name <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Select supplier name"
                                    value={supplierSearch}
                                    onFocus={() => setIsSupplierDropdownOpen(true)}
                                    onChange={(e) => {
                                        setSupplierSearch(e.target.value);
                                        setIsSupplierDropdownOpen(true);
                                    }}
                                    className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318] transition-all"
                                />
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                
                                {isSupplierDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[65]" onClick={() => setIsSupplierDropdownOpen(false)}></div>
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E5E7EB] rounded-[10px] shadow-lg z-[70] overflow-hidden font-outfit">
                                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                                {filteredSuppliers.length > 0 ? (
                                                    filteredSuppliers.map(s => (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => handleSelectSupplier(s)}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-[14px] transition-colors border-b border-[#F3F4F6] last:border-0"
                                                        >
                                                            <div className="font-bold text-[#111827] font-outfit">{s.name}</div>
                                                            <div className="text-[12px] text-gray-400 font-outfit">{s.gst_no}</div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-8 text-[13px] text-gray-400 italic text-center font-outfit">
                                                        No results for "{supplierSearch}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 bg-gray-50 border-t border-[#F3F4F6]">
                                                <button 
                                                    onClick={() => navigate(`/seller/masters/account-master?mode=add&redirect=${ROUTES.PURCHASE_ORDER_ADD}`)}
                                                    className="w-full h-[40px] bg-[#073318] text-white text-[13px] font-bold rounded-[8px] hover:bg-[#052611] transition-all flex items-center justify-center gap-2 group shadow-sm font-outfit"
                                                >
                                                    <Plus size={16} className="group-hover:scale-110 transition-transform" /> 
                                                    Add new supplier
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 font-outfit">
                            <label className="text-[14px] font-semibold text-[#374151]">Credit Days <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                placeholder="Enter credit days"
                                value={formData.credit_days}
                                onChange={(e) => setFormData({ ...formData, credit_days: e.target.value })}
                                className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318] transition-all"
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="space-y-2 font-outfit">
                            <label className="text-[14px] font-semibold text-[#374151]">Address <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Enter address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318] transition-all"
                            />
                        </div>

                        <div className="space-y-2 font-outfit">
                            <label className="text-[14px] font-semibold text-[#374151]">PO Creation Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                placeholder="Enter Date"
                                value={formData.creation_date}
                                onChange={(e) => setFormData({ ...formData, creation_date: e.target.value })}
                                className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318] transition-all"
                            />
                        </div>

                        {/* Row 3 */}
                        <div className="space-y-2 font-outfit">
                            <label className="text-[14px] font-semibold text-[#374151]">PO Number <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Purchase order will be autogenerated here"
                                value={formData.po_number}
                                readOnly
                                className="w-full h-[48px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] text-[#6B7280] outline-none cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2 font-outfit">
                            <label className="text-[14px] font-semibold text-[#374151]">Expiry Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                placeholder="Enter expire date"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318] transition-all"
                            />
                        </div>

                        {/* Row 4 */}
                        <div className="space-y-2 font-outfit">
                            <label className="text-[14px] font-semibold text-[#374151]">GST Number <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Enter GST number"
                                value={formData.gst_number}
                                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                                className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318] transition-all"
                            />
                        </div>

                        <div className="space-y-2 font-outfit">
                            <label className="text-[14px] font-semibold text-[#374151]">PAN Number <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Enter PAN number"
                                value={formData.pan_number}
                                onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                                className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318] transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-[320px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                            <input
                                type="text"
                                placeholder="Search By Anything..."
                                value={tableSearch}
                                onFocus={() => setIsProductSearchOpen(true)}
                                onChange={(e) => {
                                    setTableSearch(e.target.value);
                                    setIsProductSearchOpen(true);
                                }}
                                className="w-full h-[44px] bg-white border border-[#E5E7EB] rounded-[12px] pl-11 pr-4 text-[14px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 transition-all placeholder:text-[#9CA3AF] shadow-sm font-outfit"
                            />
                            
                            {/* Product Search Suggestions Dropdown */}
                            {isProductSearchOpen && filteredProducts.length > 0 && (
                                <div className="absolute top-full left-0 w-[500px] mt-2 bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-[60] overflow-hidden py-1">
                                    <div className="p-2 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                                        <span>Product Details</span>
                                        <span>Category</span>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {filteredProducts.map(p => (
                                            <button 
                                                key={p.id}
                                                onClick={() => handleQuickAddProduct(p)}
                                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#073318]/5 transition-all outline-none border-b border-gray-50 last:border-0"
                                            >
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[#111827] text-[14px]">{p.name}</span>
                                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">{p.code}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[12px] text-gray-400">
                                                        <span>HSN: <span className="text-gray-600 font-medium">{p.hsn}</span></span>
                                                        <span>Tax: <span className="text-gray-600 font-medium">{p.tax}%</span></span>
                                                        <span>Rate: <span className="text-[#073318] font-bold">₹{p.rate}</span></span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[12px] font-semibold text-[#6B7280]">{p.category}</span>
                                                    <div className="text-[10px] text-gray-400 font-medium">{p.sub_category}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Overlay */}
                            {isProductSearchOpen && (
                                <div className="fixed inset-0 z-50 cursor-default" onClick={() => setIsProductSearchOpen(false)}></div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate(`/seller/masters/product-master?mode=add&redirect=${ROUTES.PURCHASE_ORDER_ADD}`)}
                            className="bg-[#073318] hover:bg-[#04200f] text-white px-8 h-[44px] rounded-[10px] text-[14px] font-semibold transition-all shadow-sm active:scale-[0.98] font-outfit whitespace-nowrap"
                        >
                            Add Product
                        </button>
                    </div>
                </div>

                <style>{`
                    .custom-po-scrollbar::-webkit-scrollbar {
                        height: 6px;
                    }
                    .custom-po-scrollbar::-webkit-scrollbar-track {
                        background: #E5E7EB;
                    }
                    .custom-po-scrollbar::-webkit-scrollbar-thumb {
                        background: #A7C0B8;
                        border-radius: 4px;
                    }
                    .custom-po-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #014A36;
                    }
                `}</style>

                <div className="overflow-x-auto custom-po-scrollbar">
                    <table className="w-full min-w-[1800px] border-collapse bg-white">
                        <thead>
                            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                                <th className="px-4 py-4 w-[60px] text-center text-[13px] font-semibold text-[#4B5563]">
                                    #
                                </th>
                                {[
                                    { label: "Product Code", width: "160px" },
                                    { label: "Product", width: "350px" },
                                    { label: "Quantity", width: "120px" },
                                    { label: "Rate", width: "120px" },
                                    { label: "UOM", width: "100px" },
                                    { label: "Discount Amount", width: "160px" },
                                    { label: "Discount (%)", width: "140px" },
                                    { label: "HSN Code", width: "140px" },
                                    { label: "Tax (%)", width: "120px" },
                                    { label: "Bef. Tax Amount", width: "160px" },
                                    { label: "Tax Amount", width: "140px" },
                                    { label: "Amount", width: "160px" },
                                    { label: "Print Description", width: "300px" }
                                ].map((col, i) => (
                                    <th key={i} className="px-4 py-4 text-left text-[13px] font-medium text-[#6B7280] border-l border-[#F3F4F6]" style={{ width: col.width }}>
                                        {col.label}
                                    </th>
                                ))}
                                <th className="px-4 py-4 w-[80px] text-center text-[13px] font-semibold text-[#4B5563] border-l border-[#F3F4F6]">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors group">
                                    <td className="px-4 py-3 text-center text-[#6B7280] text-[13px]">{index + 1}</td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="text" 
                                            readOnly
                                            value={item.product_code}
                                            className="w-full h-[36px] bg-transparent border-none px-2 text-[13px] text-[#6B7280] outline-none cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="text" 
                                            readOnly
                                            value={item.product_name}
                                            className="w-full h-[36px] bg-transparent border-none px-2 text-[13px] font-bold text-[#111827] outline-none cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="number" 
                                            value={item.quantity || ''}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            className="w-full h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-2 text-[13px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 text-right transition-all shadow-sm"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="number" 
                                            value={item.rate || ''}
                                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                            className="w-full h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-2 text-[13px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 text-right transition-all shadow-sm"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="text" 
                                            readOnly
                                            value={item.uom}
                                            className="w-full h-[36px] bg-transparent border-none px-2 text-[13px] text-[#6B7280] text-center outline-none cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="number" 
                                            value={item.discount_amount || ''}
                                            onChange={(e) => handleItemChange(index, 'discount_amount', e.target.value)}
                                            className="w-full h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-2 text-[13px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 text-right transition-all shadow-sm"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="number" 
                                            value={item.discount_percent || ''}
                                            onChange={(e) => handleItemChange(index, 'discount_percent', e.target.value)}
                                            className="w-full h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-2 text-[13px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 text-right font-medium text-[#073318] transition-all shadow-sm"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="text" 
                                            readOnly
                                            value={item.hsn}
                                            className="w-full h-[36px] bg-transparent border-none px-2 text-[13px] text-[#6B7280] outline-none cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="number" 
                                            readOnly
                                            value={item.tax_percent || ''}
                                            className="w-full h-[36px] bg-transparent border-none px-2 text-[13px] text-[#6B7280] text-right outline-none cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={item.before_tax || '0.00'}
                                            className="w-full h-[36px] bg-transparent border-none px-2 text-[13px] text-right text-[#6B7280] outline-none cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={item.tax_amount || '0.00'}
                                            className="w-full h-[36px] bg-transparent border-none px-2 text-[13px] text-right text-[#6B7280] outline-none cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={item.total_amount || '0.00'}
                                            className="w-full h-[36px] bg-transparent border-none px-2 text-[13px] font-bold text-[#073318] text-right outline-none cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                        <input 
                                            type="text" 
                                            readOnly
                                            value={item.description}
                                            className="w-full h-[36px] bg-transparent border-none px-2 text-[13px] text-[#6B7280] outline-none cursor-not-allowed"
                                            placeholder="Description"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center border-l border-[#F3F4F6]">
                                        <button 
                                            onClick={() => removeItem(index)}
                                            className="p-1.5 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
                                <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">Total</td>
                                <td className="border-l border-[#F3F4F6]"></td>
                                <td className="border-l border-[#F3F4F6]"></td>
                                <td className="px-4 py-4 text-right text-[13px] font-bold text-[#111827] border-l border-[#F3F4F6]">
                                    {items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)}
                                </td>
                                <td className="border-l border-[#F3F4F6]"></td>
                                <td className="border-l border-[#F3F4F6]"></td>
                                <td className="border-l border-[#F3F4F6]"></td>
                                <td className="border-l border-[#F3F4F6]"></td>
                                <td className="border-l border-[#F3F4F6]"></td>
                                <td className="border-l border-[#F3F4F6]"></td>
                                <td className="px-4 py-4 text-right text-[13px] font-bold text-[#111827] border-l border-[#F3F4F6]">
                                    {items.reduce((sum, item) => sum + (parseFloat(item.before_tax) || 0), 0).toFixed(2)}
                                </td>
                                <td className="px-4 py-4 text-right text-[13px] font-bold text-[#111827] border-l border-[#F3F4F6]">
                                    {items.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0).toFixed(2)}
                                </td>
                                <td className="px-4 py-4 text-right text-[13px] font-bold text-[#073318] border-l border-[#F3F4F6]">
                                    ₹ {totalBillAmount.toFixed(2)}
                                </td>
                                <td className="border-l border-[#F3F4F6]"></td>
                                <td className="border-l border-[#F3F4F6]"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Action buttons moved inside the main card */}
                <div className="flex items-center justify-end gap-4 mt-8 px-6 pb-6">
                    <button 
                        onClick={handlePrintPreview}
                        className="px-8 h-[48px] bg-[#073318] text-white rounded-[10px] text-[15px] font-bold hover:bg-[#052611] transition-all shadow-md"
                    >
                        preview and print
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex items-center justify-center gap-2 px-10 h-[48px] bg-[#073318] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#052611] transition-all shadow-md"
                    >
                        Save PO
                    </button>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-10 h-[48px] border border-[#E5E7EB] rounded-[10px] text-[14px] font-bold text-[#4B5563] bg-white hover:bg-gray-50 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPO;
