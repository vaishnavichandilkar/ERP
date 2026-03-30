import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { 
    ArrowLeft, 
    Search, 
    Trash2, 
    Plus, 
    Save, 
    X,
    Edit3,
    Printer,
    ChevronsUpDown
} from 'lucide-react';

const MOCK_SUPPLIERS = [
    { 
        id: 1, 
        name: "Shree Agro Traders", 
        address: "Market Yard, Wing A, Shop 12, Pune, Maharashtra",
        credit_days: 30,
        gst_no: "27ABCDE1234F1Z5",
        pan_no: "ABCDE1234F"
    },
    { 
        id: 2, 
        name: "Global Industrial", 
        address: "Plot 45, MIDC Area, Bhosari, Pune",
        credit_days: 15,
        gst_no: "27PQRSX5678L1Z2",
        pan_no: "PQRSX5678L"
    }
];

const MOCK_PRODUCTS = [
    { id: 101, code: '101', name: 'Premium Maize Silage', rate: 4500.00, uom: 'Ton', hsn: '23099090', tax: 5, category: 'Animal Feed', sub_category: 'Silage' },
    { id: 102, code: '102', name: 'Organic Fertilizer Mix', rate: 1250.00, uom: 'Bag', hsn: '31010299', tax: 12, category: 'Fertilizers', sub_category: 'Organic' },
];

const MOCK_POS = [
    {
      id: 1,
      po_no: "PO00010",
      supplier_name: "Apex Solutions",
      po_creation_date: "2026-03-08",
      expiry_date: "2026-03-30",
      gst_number: "27AAACS1234A1Z5",
      credit_days: 30,
      pan_number: "ABCDE1234F",
      address: "Market Yard, Wing A, Shop 12, Pune, Maharashtra",
      status: "Approved",
      items: [
          { id: 1, product_code: '101', product_name: 'Premium Maize Silage', quantity: 5.0, rate: 4500.0, uom: 'Ton', discount_amount: 0.0, discount_percent: 0.0, hsn: '23099090', tax_percent: 5, before_tax: 22500.0, tax_amount: 1125.0, total_amount: 23625.0, description: 'High Quality Silage' },
          { id: 2, product_code: '102', product_name: 'Organic Fertilizer Mix', quantity: 12.0, rate: 1250.0, uom: 'Bag', discount_amount: 0.0, discount_percent: 0.0, hsn: '31010299', tax_percent: 12, before_tax: 15000.0, tax_amount: 1800.0, total_amount: 16800.0, description: 'Organic Crop Fertilizer' }
      ]
    }
];

const InfoTableRow = ({ label1, value1, label2, value2, isEditMode, renderEdit1, renderEdit2 }) => (
    <div className={`flex flex-col sm:flex-row border-[#E5E7EB] border-b last:border-0 font-outfit`}>
        <div className="sm:w-1/4 py-3.5 px-6 text-[13px] text-[#6B7280] border-r border-b sm:border-b-0 border-[#E5E7EB] bg-gray-50/10 font-semibold flex items-center">
            {label1}
        </div>
        <div className="sm:w-1/4 py-3.5 px-6 text-[13px] text-[#111827] border-r border-b sm:border-b-0 border-[#E5E7EB] bg-white flex items-center">
            {isEditMode && renderEdit1 ? renderEdit1() : (value1 || '-')}
        </div>
        <div className="sm:w-1/4 py-3.5 px-6 text-[13px] text-[#6B7280] border-r border-b sm:border-b-0 border-[#E5E7EB] bg-gray-50/10 font-semibold flex items-center">
            {label2}
        </div>
        <div className="sm:w-1/4 py-3.5 px-6 text-[13px] text-[#111827] bg-white flex items-center">
            {isEditMode && renderEdit2 ? renderEdit2() : (value2 || '-')}
        </div>
    </div>
);

const ViewPO = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = false;
    
    const [purchaseOrder, setPurchaseOrder] = useState(() => {
        const storedPOs = JSON.parse(localStorage.getItem('purchase_orders') || '[]');
        return storedPOs.find(po => String(po.id) === String(id)) || MOCK_POS[0];
    });

    const [formData, setFormData] = useState({
        supplier_name: purchaseOrder.supplier_name,
        credit_days: purchaseOrder.credit_days,
        address: purchaseOrder.address,
        creation_date: purchaseOrder.po_creation_date,
        expiry_date: purchaseOrder.expiry_date,
        po_number: purchaseOrder.po_no,
        gst_number: purchaseOrder.gst_number,
        pan_number: purchaseOrder.pan_number,
        status: purchaseOrder.status
    });

    const [items, setItems] = useState(purchaseOrder.items || []);
    const [supplierSearch, setSupplierSearch] = useState(purchaseOrder.supplier_name);
    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
    const [tableSearch, setTableSearch] = useState('');
    const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);


    const filteredSuppliers = useMemo(() => {
        return MOCK_SUPPLIERS.filter(s => 
            s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
            s.gst_no.toLowerCase().includes(supplierSearch.toLowerCase())
        );
    }, [supplierSearch]);

    const filteredProducts = useMemo(() => {
        return MOCK_PRODUCTS.filter(p => 
            p.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
            p.code.toLowerCase().includes(tableSearch.toLowerCase())
        );
    }, [tableSearch]);

    const handleSelectSupplier = (supplier) => {
        setFormData({
            ...formData,
            supplier_name: supplier.name,
            address: supplier.address,
            credit_days: supplier.credit_days,
            gst_number: supplier.gst_no,
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
            quantity: 1.0, 
            rate: product.rate, 
            uom: product.uom, 
            discount_amount: 0.0, 
            discount_percent: 0.0, 
            hsn: product.hsn, 
            tax_percent: product.tax, 
            before_tax: product.rate.toFixed(2), 
            tax_amount: (product.rate * product.tax / 100).toFixed(2), 
            total_amount: (product.rate * (1 + product.tax / 100)).toFixed(2),
            description: '' 
        };
        setItems([...items, newItem]);
        setTableSearch('');
        setIsProductSearchOpen(false);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        const item = newItems[index];
        item[field] = value;

        if (field === 'quantity' || field === 'rate' || field === 'discount_amount' || field === 'discount_percent' || field === 'tax_percent') {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            let discAmt = parseFloat(item.discount_amount) || 0;
            let discPct = parseFloat(item.discount_percent) || 0;
            const taxPct = parseFloat(item.tax_percent) || 0;

            const baseAmount = qty * rate;

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

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const totalBillAmount = items.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0);
    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const totalBefTax = items.reduce((sum, item) => sum + (parseFloat(item.before_tax) || 0), 0);
    const totalTaxAmt = items.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);

    const handlePrintPreview = () => {
        const fullPOData = {
            ...formData,
            items: items
        };
        navigate(ROUTES.PURCHASE_ORDER_PRINT, { state: { poData: fullPOData } });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 font-outfit">
            <style>{`
                .custom-po-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-po-scrollbar::-webkit-scrollbar-track { background: #E5E7EB; }
                .custom-po-scrollbar::-webkit-scrollbar-thumb { background: #A7C0B8; border-radius: 4px; }
                .custom-po-scrollbar::-webkit-scrollbar-thumb:hover { background: #014A36; }
            `}</style>

            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-[24px] font-bold text-[#111827]">Purchase</h1>
                <p className="text-[14px] text-[#6B7280]">Create and monitor purchase orders, supplier invoices, and stock procurement activities.</p>
            </div>

            <div className="flex items-center gap-8 border-b border-[#F3F4F6] -mt-2">
                <div 
                    className="pb-3 border-b-2 border-[#073318] text-[#073318] font-bold text-[14px] cursor-pointer" 
                    onClick={() => navigate('/seller/purchase/order')}
                >
                    Purchase Order
                </div>
                <div 
                    className="pb-3 text-[#9CA3AF] font-medium text-[14px] cursor-pointer hover:text-gray-600 transition-colors" 
                    onClick={() => navigate('/seller/purchase/invoice')}
                >
                    Purchase Invoice
                </div>
            </div>

            <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* Card Header Section */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-[#F3F4F6]">
                    <h2 className="text-[20px] font-bold text-[#111827]">View PO</h2>
                    <div className="flex items-center gap-3">
                        {(purchaseOrder.status === 'Pending' || purchaseOrder.status === 'Approved') && (
                            <button 
                                onClick={() => navigate(ROUTES.PURCHASE_ORDER_EDIT.replace(':id', purchaseOrder.id))}
                                className="px-8 h-[40px] bg-[#073318] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#04200f] transition-all shadow-sm"
                            >
                                Edit PO
                            </button>
                        )}
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-6 h-[40px] border border-[#E5E7EB] rounded-[10px] text-[14px] font-bold text-[#4B5563] hover:bg-gray-50 transition-all font-outfit"
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
                    </div>
                </div>

                {/* Information Section */}
                {isEditMode ? (
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-[#374151]">Supplier Name <span className="text-red-500">*</span></label>
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
                                    {isSupplierDropdownOpen && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E5E7EB] rounded-[10px] shadow-lg z-[70] overflow-hidden">
                                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                                {filteredSuppliers.map(s => (
                                                    <button 
                                                        key={s.id} 
                                                        onClick={() => handleSelectSupplier(s)} 
                                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 text-[14px] border-b border-[#F3F4F6] last:border-0"
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-[#374151]">Credit Days <span className="text-red-500">*</span></label>
                                <input 
                                    type="number" 
                                    value={formData.credit_days} 
                                    onChange={(e) => setFormData({ ...formData, credit_days: e.target.value })} 
                                    className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318]" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-[#374151]">Address <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={formData.address} 
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                                    className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318]" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-[#374151]">PO Creation Date</label>
                                <input 
                                    type="text" 
                                    value={formData.creation_date} 
                                    readOnly 
                                    className="w-full h-[48px] bg-gray-50 border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] text-gray-500" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-[#374151]">Expiry Date <span className="text-red-500">*</span></label>
                                <input 
                                    type="date" 
                                    value={formData.expiry_date} 
                                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} 
                                    className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318]" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-[#374151]">GST Number <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={formData.gst_number} 
                                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })} 
                                    className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318]" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-[#374151]">PAN Number <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={formData.pan_number} 
                                    onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })} 
                                    className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[10px] px-4 text-[14px] outline-none focus:border-[#073318]" 
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 border-b border-[#F3F4F6]">
                        <div className="border border-[#E5E7EB] rounded-[12px] overflow-hidden shadow-sm">
                            <InfoTableRow label1="Supplier Name:" value1={formData.supplier_name} label2="Credit Days:" value2={formData.credit_days} />
                            <InfoTableRow label1="Address:" value1={formData.address} label2="PO Creation Date:" value2={formData.creation_date} />
                            <InfoTableRow label1="Expiry Date:" value1={formData.expiry_date} label2="GST Number:" value2={formData.gst_number} />
                            <div className="flex border-b border-[#E5E7EB] last:border-0 font-outfit">
                                <div className="w-1/4 py-3.5 px-6 text-[13px] text-[#6B7280] border-r border-[#E5E7EB] bg-gray-50/10 font-semibold">PAN Number:</div>
                                <div className="flex-1 py-3.5 px-6 text-[13px] text-[#111827] bg-white">{formData.pan_number || '-'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="p-8">
                    {isEditMode && (
                        <div className="relative w-full max-w-[400px] mb-6">
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
                                className="w-full h-[48px] bg-white border border-[#E5E7EB] rounded-[12px] pl-12 pr-4 text-[14px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 transition-all font-outfit"
                            />
                            {isProductSearchOpen && filteredProducts.length > 0 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[#E5E7EB] rounded-[12px] shadow-xl z-[60] overflow-hidden py-1">
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {filteredProducts.map(p => (
                                            <button 
                                                key={p.id} 
                                                onClick={() => handleQuickAddProduct(p)} 
                                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-all text-left border-b border-[#F3F4F6] last:border-0"
                                            >
                                                <div>
                                                    <div className="font-bold text-[#111827] text-[14px]">{p.name}</div>
                                                    <div className="text-[12px] text-gray-400">Rate: ₹{p.rate} | UOM: {p.uom}</div>
                                                </div>
                                                <Plus size={16} className="text-[#073318]" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="overflow-x-auto custom-po-scrollbar border border-[#E5E7EB] rounded-[12px]">
                        <table className="w-full min-w-[2000px] border-collapse bg-white">
                            <thead>
                                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                                    <th className="px-4 py-4 w-[60px] text-center text-[13px] font-semibold text-[#4B5563]">#</th>
                                    {[
                                        {label: "Product Code", width: "160px"},
                                        {label: "Product", width: "350px"},
                                        {label: "Qty", width: "120px", align: "right"},
                                        {label: "UOM", width: "100px"},
                                        {label: "Rate", width: "140px", align: "right"},
                                        {label: "Disc Amt", width: "130px", align: "right"},
                                        {label: "Disc %", width: "120px", align: "right"},
                                        {label: "HSN", width: "130px"},
                                        {label: "Tax %", width: "100px", align: "right"},
                                        {label: "Before Tax", width: "150px", align: "right"},
                                        {label: "Tax Amt", width: "140px", align: "right"},
                                        {label: "Total Amt", width: "160px", align: "right"},
                                        {label: "Description", width: "250px"},
                                        {label: "Action", width: "80px", align: "center"}
                                    ].map((col, idx) => (
                                        <th 
                                            key={idx} 
                                            className={`px-4 py-4 text-[13px] font-bold text-[#4B5563] text-${col.align || 'left'} border-l border-[#F3F4F6]`}
                                            style={{ width: col.width }}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F3F4F6]">
                                {items.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group h-[60px]">
                                        <td className="px-4 py-4 text-center text-[13px] text-[#6B7280]">{index + 1}</td>
                                        <td className="px-4 py-4 text-[13px] border-l border-[#F3F4F6] text-[#111827]">{item.product_code}</td>
                                        <td className="px-4 py-4 text-[13px] border-l border-[#F3F4F6] font-bold text-[#111827]">{item.product_name}</td>
                                        <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                            {isEditMode ? (
                                                <input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                                                    className="w-full h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-2 text-right text-[13px] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10" 
                                                />
                                            ) : (
                                                <div className="px-2 text-right text-[13px] font-medium">{parseFloat(item.quantity).toFixed(2)}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center text-[13px] border-l border-[#F3F4F6] text-[#6B7280]">{item.uom}</td>
                                        <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                            {isEditMode ? (
                                                <input 
                                                    type="number" 
                                                    value={item.rate} 
                                                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)} 
                                                    className="w-full h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-2 text-right text-[13px] outline-none focus:border-[#073318]" 
                                                />
                                            ) : (
                                                <div className="px-2 text-right text-[13px]">{parseFloat(item.rate).toFixed(2)}</div>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                            {isEditMode ? (
                                                <input 
                                                    type="number" 
                                                    value={item.discount_amount} 
                                                    onChange={(e) => handleItemChange(index, 'discount_amount', e.target.value)} 
                                                    className="w-full h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-2 text-right text-[13px] outline-none focus:border-[#073318]" 
                                                />
                                            ) : (
                                                <div className="px-2 text-right text-[13px]">{parseFloat(item.discount_amount).toFixed(2)}</div>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 border-l border-[#F3F4F6]">
                                            {isEditMode ? (
                                                <input 
                                                    type="number" 
                                                    value={item.discount_percent} 
                                                    onChange={(e) => handleItemChange(index, 'discount_percent', e.target.value)} 
                                                    className="w-full h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-2 text-right text-[13px] outline-none focus:border-[#073318]" 
                                                />
                                            ) : (
                                                <div className="px-2 text-right text-[13px]">{parseFloat(item.discount_percent).toFixed(2)}%</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-[13px] border-l border-[#F3F4F6] text-[#6B7280]">{item.hsn}</td>
                                        <td className="px-4 py-4 text-right text-[13px] border-l border-[#F3F4F6] text-[#6B7280]">{item.tax_percent}%</td>
                                        <td className="px-4 py-4 text-right text-[13px] border-l border-[#F3F4F6] text-[#6B7280]">{parseFloat(item.before_tax).toFixed(2)}</td>
                                        <td className="px-4 py-4 text-right text-[13px] border-l border-[#F3F4F6] text-[#6B7280]">{parseFloat(item.tax_amount).toFixed(2)}</td>
                                        <td className="px-4 py-4 text-right text-[13px] border-l border-[#F3F4F6] font-bold text-[#073318]">₹ {parseFloat(item.total_amount).toFixed(2)}</td>
                                        <td className="px-4 py-4 border-l border-[#F3F4F6]">
                                            {isEditMode ? (
                                                <input 
                                                    type="text" 
                                                    value={item.description} 
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)} 
                                                    className="w-full h-[36px] border border-transparent rounded-[8px] px-2 text-[12px] hover:border-gray-200 focus:border-[#073318] transition-all bg-gray-50/50" 
                                                />
                                            ) : (
                                                <div className="text-[12px] text-[#6B7280] truncate max-w-[200px]" title={item.description}>{item.description || '-'}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center border-l border-[#F3F4F6]">
                                            {isEditMode && items.length > 1 && (
                                                <button 
                                                    onClick={() => removeItem(index)} 
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[#F9FAFB] border-t-2 border-[#E5E7EB] font-bold">
                                <tr>
                                    <td colSpan={3} className="px-4 py-5 text-[14px] text-[#111827]">Total Summary</td>
                                    <td className="px-4 py-4 text-right text-[14px] text-[#111827] border-l border-[#F3F4F6]">{totalQty.toFixed(2)}</td>
                                    <td className="border-l border-[#F3F4F6]"></td>
                                    <td className="border-l border-[#F3F4F6]"></td>
                                    <td className="border-l border-[#F3F4F6]"></td>
                                    <td className="border-l border-[#F3F4F6]"></td>
                                    <td className="border-l border-[#F3F4F6]"></td>
                                    <td className="border-l border-[#F3F4F6]"></td>
                                    <td className="px-4 py-4 text-right text-[14px] text-[#111827] border-l border-[#F3F4F6]">{totalBefTax.toFixed(2)}</td>
                                    <td className="px-4 py-4 text-right text-[14px] text-[#111827] border-l border-[#F3F4F6]">{totalTaxAmt.toFixed(2)}</td>
                                    <td className="px-4 py-4 text-right text-[16px] text-[#073318] border-l border-[#F3F4F6]">₹ {totalBillAmount.toFixed(2)}</td>
                                    <td colSpan={2} className="border-l border-[#F3F4F6]"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-end gap-4 px-8 py-6 border-t border-[#F3F4F6] bg-gray-50/10">
                    <button 
                        onClick={handlePrintPreview}
                        className="px-8 h-[48px] bg-[#073318] text-white rounded-[10px] text-[15px] font-bold hover:bg-[#052611] transition-all shadow-md"
                    >
                        preview and print
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPO;
