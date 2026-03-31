import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Filter,
  MoreVertical,
  X,
  FileText,
  FileSpreadsheet,
  Eye,
  FileEdit,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  ChevronsUpDown,
  Upload,
  CloudUpload,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ROUTES } from "../../../constants/routes";

import purchaseOrderService from "../../../services/purchaseOrderService";

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const dropdownRefs = useRef({});
  const exportRef = useRef(null);

  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Current date
  const currentDate = new Date("2026-03-26");

  // Local Storage Data Retrieval
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Helper date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  // Fetch logic from API
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: searchQuery,
            };
            
            // Map tabs to backend statuses if needed
            if (activeTab !== "All") {
                if (activeTab === "Pending") params.status = "PENDING";
                if (activeTab === "Completed") params.status = "INVOICE_GENERATED";
                if (activeTab === "Deleted") params.status = "DELETED";
                // Note: "Expiring soon" and "Expired" logic handled by specific query params if backend supports them, 
                // or we filter locally if the dataset is small. For now we assume typical status filters.
            }

            const response = await purchaseOrderService.getPurchaseOrders(params);
            const data = Array.isArray(response) ? response : (response.data || []);
            setPurchaseOrders(data);
            setTotalItemsCount(response.meta?.total || data.length);
        } catch (error) {
            console.error("Error fetching purchase orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, [currentPage, itemsPerPage, searchQuery, activeTab, isRefreshing]);

  // Helper date parsing
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  /**
   * Filter Logic
   */
  const filteredData = useMemo(() => {
    // With API integration, we mostly use purchaseOrders as is, 
    // but we can still apply the special date-based status logic here 
    // for "Expiring soon" and "Expired" if the backend doesn't filter by those.
    return purchaseOrders.filter((po) => {
      if (activeTab === "Expiring soon" || activeTab === "Expired") {
        const poExpiryDate = new Date(po.expiryDate);
        const diffHrs = (poExpiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
        if (activeTab === "Expiring soon") return diffHrs >= 0 && diffHrs <= 48;
        if (activeTab === "Expired") return diffHrs < 0;
      }
      return true;
    });
  }, [activeTab, purchaseOrders]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
      if (activeDropdown !== null) {
        const ref = dropdownRefs.current[activeDropdown];
        if (ref && !ref.contains(event.target)) {
          setActiveDropdown(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  // Derived pagination data
  // Derived pagination data
  const totalItems = totalItemsCount;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredData; // API handles pagination slice, but we can use filteredData here if we did local date filters.

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  /**
   * Action: Refresh (Quick + Toast)
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Quick Simulation (400ms)
    setTimeout(() => {
        setIsRefreshing(false);
        setShowSuccessToast(true);
        // Auto-hide toast after 3s
        setTimeout(() => setShowSuccessToast(false), 3000);
    }, 400);
  };

  /**
   * Export Logic
   */
  /**
   * Universal Export Handler (Backend Driven)
   */
  const handleExport = async (format) => {
    try {
        setIsExportOpen(false);
        setIsRefreshing(true);
        
        const params = {
            format,
            filter: activeTab === "All" ? "all" : activeTab.toLowerCase(),
            search: searchQuery
        };

        const response = await purchaseOrderService.exportPurchaseOrders(params);
        
        // Trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `purchase_orders_${activeTab.toLowerCase()}.${format === 'xlsx' ? 'xlsx' : 'pdf'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
        console.error("Export error:", error);
        // Fallback or Alert
    } finally {
        setIsRefreshing(false);
    }
  };

  const handleExportPDF = () => handleExport('pdf');
  const handleExportExcel = () => handleExport('xlsx');

  const handleDownloadSample = async () => {
    try {
      const response = await purchaseOrderService.downloadSample();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'PO_Import_Sample.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading sample:", error);
    }
  };

  const handleSubmitImport = async () => {
    if (!selectedFile) return;
    try {
        setIsRefreshing(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        await purchaseOrderService.importPurchaseOrders(formData);
        setIsImportModalOpen(false);
        setSelectedFile(null);
        handleRefresh(); // Refresh the list
    } catch (error) {
        console.error("Error importing PO:", error);
    } finally {
        setIsRefreshing(false);
    }
  };

  const statusTabs = ["All", "Pending", "Expiring soon", "Expired", "Completed", "Deleted"];

  return (
    <div className="flex flex-col gap-1 w-full animate-in fade-in duration-300 relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #E5E7EB;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #A7C0B8;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #073318;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
      
      {/* Toast Notification (Success Popup) */}
      {showSuccessToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-4 duration-300">
              <div className="bg-[#073318] text-white px-6 py-2.5 rounded-full flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)] ring-1 ring-white/10">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <span className="text-[15px] font-semibold tracking-tight">Data refreshed successfully</span>
                  <button 
                    onClick={() => setShowSuccessToast(false)}
                    className="ml-2 hover:text-emerald-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
              </div>
          </div>
      )}

      {/* Title Section */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
          Purchase Order
        </h1>
        <button 
          onClick={() => navigate('/seller/purchase/order/add')}
          className="px-8 h-[44px] bg-[#073318] text-white rounded-[10px] text-[15px] font-bold hover:bg-[#04200f] transition-all shadow-sm"
        >
          Add PO
        </button>
      </div>
      <p className="text-[#6B7280] text-[15px] mb-8">
        View, verify, and monitor all purchase orders, supplier invoices, and stock procurement activities.
      </p>

      {/* Sub-Tabs */}
      <div className="flex gap-8 border-b border-[#E5E7EB] mb-8 overflow-x-auto no-scrollbar scrollbar-hide">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`pb-4 text-[14px] font-semibold transition-all duration-200 relative whitespace-nowrap
              ${activeTab === tab 
                ? 'text-[#073318] after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-[2px] after:bg-[#073318]' 
                : 'text-[#6B7280] hover:text-[#111827]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Area */}
      <div className="flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full overflow-hidden mb-8">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-[#F3F4F6]">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-[320px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search By Anything..."
                        value={searchQuery}
                        onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                        className="w-full h-[42px] bg-white border border-[#E5E7EB] rounded-[10px] pl-10 pr-10 text-[14px] text-[#111827] outline-none focus:border-[#073318] focus:ring-1 focus:ring-[#073318]/10 transition-all placeholder:text-gray-400 shadow-sm"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={handleRefresh}
                    className={`flex items-center justify-center w-[42px] h-[42px] border border-[#E5E7EB] text-[#4B5563] rounded-[10px] hover:bg-gray-50 bg-white shadow-sm transition-all ${isRefreshing ? 'animate-spin border-[#073318] text-[#073318]' : ''}`}
                    disabled={isRefreshing}
                    title="Refresh Data"
                >
                    <RefreshCw size={18} className={isRefreshing ? "text-[#073318]" : "text-gray-400"} />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 h-[42px] border border-[#E5E7EB] rounded-[10px] text-[14px] font-bold text-[#4B5563] bg-white hover:bg-gray-50 shadow-sm transition-all"
                >
                    <Upload size={18} className="text-gray-400" />
                    Import
                </button>

                <div className="relative" ref={exportRef}>
                    <button
                        onClick={() => setIsExportOpen(!isExportOpen)}
                        className={`flex items-center justify-center gap-2 px-4 h-[42px] border border-[#E5E7EB] rounded-[10px] text-[14px] font-bold text-[#4B5563] bg-white hover:bg-gray-50 shadow-sm transition-all ${isExportOpen ? 'border-[#073318] text-[#073318]' : ''}`}
                    >
                        <Download size={18} className="text-gray-400" />
                        Export
                    </button>
                    {isExportOpen && (
                        <div className="absolute top-full right-0 mt-2 w-[160px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button 
                                onClick={handleExportPDF}
                                className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622]"
                            >
                                <FileText size={18} className="text-red-500" /> PDF
                            </button>
                            <button 
                                onClick={handleExportExcel}
                                className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#0A3622]"
                            >
                                <FileSpreadsheet size={18} className="text-green-600" /> Excel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto w-full min-h-[400px] custom-scrollbar">
          <table className="w-full min-w-[1500px] border-collapse text-left">
            <thead>
              <tr className="bg-emerald-900 border-b border-emerald-950 text-[14px] font-bold text-white uppercase tracking-tight">
                {[
                  "PO  No", "Supplier  Name", "Creation  Date", "Expiry  Date", "Amount", 
                  "GST  Number", "Credit  Days", "Tax  Amount", "Total  Amount", "Status"
                ].map((col) => (
                  <th key={col} className="px-6 py-5 border-r border-white/50 whitespace-nowrap tracking-tight">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-white/80 transition-colors uppercase tracking-tight">
                      {col}
                      <ChevronsUpDown size={14} className="text-white opacity-80" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-5 text-center w-[100px] whitespace-nowrap tracking-tight uppercase">Action</th>
              </tr>
            </thead>
            <tbody className={`text-[14px] text-[#111827] transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              {(isLoading ? Array(5).fill({}) : currentItems).length > 0 ? (
                (isLoading ? Array(5).fill({}) : currentItems).map((po, index) => (
                  <tr key={po.id || index} className={`border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F9FAFB] transition-colors group ${isLoading ? 'animate-pulse' : ''}`}>
                    <td className="px-6 py-5 font-bold border-r border-[#F3F4F6]">
                        {isLoading ? <div className="h-4 bg-gray-200 rounded w-20"></div> : po.poNumber}
                    </td>
                    <td className="px-6 py-5 font-bold border-r border-[#F3F4F6]">
                        {isLoading ? <div className="h-4 bg-gray-200 rounded w-40"></div> : po.supplierName}
                    </td>
                    <td className="px-6 py-5 text-[#4B5563] border-r border-[#F3F4F6]">
                        {isLoading ? <div className="h-4 bg-gray-200 rounded w-24"></div> : formatDate(po.poCreationDate)}
                    </td>
                    <td className="px-6 py-5 text-[#4B5563] border-r border-[#F3F4F6]">
                        {isLoading ? <div className="h-4 bg-gray-200 rounded w-24"></div> : formatDate(po.expiryDate)}
                    </td>
                    <td className="px-6 py-5 font-medium border-r border-[#F3F4F6] text-[#4B5563]">
                        {isLoading ? <div className="h-4 bg-gray-200 rounded w-16"></div> : (po.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-[#4B5563] border-r border-[#F3F4F6]">
                        {isLoading ? <div className="h-4 bg-gray-200 rounded w-32"></div> : (po.gstNumber || '-')}
                    </td>
                    <td className="px-6 py-5 text-[#4B5563] border-r border-[#F3F4F6]">
                        {isLoading ? <div className="h-4 bg-gray-200 rounded w-8"></div> : (po.creditDays || 0)}
                    </td>
                    <td className="px-6 py-5 text-[#4B5563] border-r border-[#F3F4F6]">
                        {isLoading ? <div className="h-4 bg-gray-200 rounded w-16"></div> : (po.taxAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-5 font-bold border-r border-[#F3F4F6] text-[#111827]">
                        {isLoading ? <div className="h-4 bg-gray-200 rounded w-20"></div> : (po.grandTotal || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-[#4B5563] border-r border-[#F3F4F6]">
                        {isLoading ? <div className="h-4 bg-gray-200 rounded w-20"></div> : (
                            <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase
                                ${po.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 
                                  po.status === 'INVOICE_GENERATED' ? 'bg-emerald-100 text-emerald-600' : 
                                  po.status === 'APPROVED' ? 'bg-blue-100 text-blue-600' : 
                                  'bg-gray-100 text-gray-600'}`}
                            >
                                {po.status}
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-5 text-center relative" ref={el => dropdownRefs.current[po.id] = el}>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === po.id ? null : po.id)}
                        className={`p-2 rounded-lg transition-all ${activeDropdown === po.id ? 'bg-gray-100 text-[#111827]' : 'text-gray-400 hover:bg-gray-100 hover:text-[#111827]'}`}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeDropdown === po.id && (
                        <div className={`absolute right-4 w-max min-w-[180px] bg-white border border-gray-100 rounded-[14px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] z-[110] py-2 animate-in duration-200 text-left ${index >= currentItems.length - 2 ? 'bottom-0 mb-2' : 'top-0 mt-2'}`}>
                          <button 
                            onClick={() => navigate(ROUTES.PURCHASE_ORDER_VIEW.replace(':id', po.id))}
                            className="w-full px-5 py-3 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#073318] transition-colors font-bold"
                          >
                            <Eye size={18} className="text-gray-400" /> View and Edit Order
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="px-6 py-20 text-center text-gray-400 font-medium">
                    No results found for {activeTab}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {isRefreshing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/20 backdrop-blur-[1px] transition-all">
                <div className="w-10 h-10 border-4 border-[#073318]/10 border-t-[#073318] rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t border-[#F3F4F6] bg-white gap-4">
          <div className="flex items-center gap-3 text-[14px] text-[#6B7280] font-medium">
            <span>Show</span>
            <div className="relative group">
              <select
                value={itemsPerPage}
                onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                className="appearance-none border border-[#E5E7EB] rounded-[8px] pl-3 pr-8 py-1.5 outline-none focus:border-[#073318] text-[#111827] bg-[#F9FAFB] cursor-pointer font-bold transition-all hover:bg-white"
              >
                {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-[#073318]" />
            </div>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[#6B7280] text-[14px] font-medium">
              {totalItems > 0 
                ? `${((currentPage - 1) * itemsPerPage) + 1}–${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}`
                : '0-0 of 0'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-[10px]"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-[10px] flex items-center justify-center transition-all text-[14px] font-bold
                      ${currentPage === i + 1 
                        ? 'bg-[#F9FAFB] text-[#111827] shadow-sm' 
                        : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-[10px]"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] animate-in fade-in duration-300"
            onClick={() => setIsImportModalOpen(false)}
          >
              <div 
                className="bg-white w-full max-w-[500px] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                  {/* Modal Header */}
                  <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                      <h3 className="text-[18px] font-bold text-[#111827]">Import Data</h3>
                      <button 
                        onClick={() => setIsImportModalOpen(false)}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                          <X size={20} className="text-gray-400" />
                      </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-8 flex flex-col items-center gap-10">
                      {/* Download Sample */}
                      <button 
                        onClick={handleDownloadSample}
                        className="flex items-center gap-2 px-6 py-3 bg-[#AFC9BD]/40 text-[#073318] rounded-[10px] text-[14px] font-bold hover:bg-[#AFC9BD]/60 transition-all"
                      >
                          <Download size={18} />
                          Download Sample
                      </button>

                      {/* Upload Section */}
                      <div className="w-full flex flex-col items-center gap-3">
                          <span className="text-[15px] font-bold text-[#4B5563]">Upload File</span>
                          <div className="flex items-center gap-4 w-full px-4">
                              <span className="text-[14px] text-gray-400 font-medium whitespace-nowrap">Select File</span>
                              <div className="flex-1 flex items-center border border-dashed border-gray-300 rounded-[8px] h-[44px] overflow-hidden">
                                  <label className="h-full px-4 flex items-center justify-center bg-gray-50 border-r border-dashed border-gray-300 text-[13px] font-bold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors">
                                      Choose File
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                      />
                                  </label>
                                  <span className="px-4 text-[13px] text-gray-400 truncate">
                                      {selectedFile ? selectedFile.name : 'No file chosen'}
                                  </span>
                              </div>
                          </div>
                      </div>

                      {/* Submit Action */}
                      <button 
                        onClick={handleSubmitImport}
                        disabled={!selectedFile || isRefreshing}
                        className={`flex items-center gap-2 px-10 py-3 rounded-[12px] text-[15px] font-bold transition-all shadow-sm
                          ${selectedFile && !isRefreshing
                            ? 'bg-[#073318] text-white hover:bg-[#04200f] shadow-[#073318]/20' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                          <CloudUpload size={20} />
                          {isRefreshing ? 'Importing...' : 'Submit'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PurchaseOrder;
