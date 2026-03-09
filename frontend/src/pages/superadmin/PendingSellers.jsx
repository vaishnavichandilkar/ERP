import React, { useState, useEffect } from 'react';
import { Check, X, Search, Loader2 } from 'lucide-react';
import { getPendingSellersApi, approveSellerApi, rejectSellerApi } from '../../services/superAdminService';

const PendingSellers = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [actionModal, setActionModal] = useState({ isOpen: false, type: null, seller: null });
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchPendingSellers();
    }, []);

    const fetchPendingSellers = async () => {
        try {
            setLoading(true);
            const data = await getPendingSellersApi();
            setSellers(data || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch pending sellers');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleActionClick = (seller, type) => {
        setActionModal({ isOpen: true, type, seller });
        setRejectReason('');
    };

    const confirmAction = async () => {
        if (!actionModal.seller) return;

        try {
            setActionLoading(true);
            if (actionModal.type === 'approve') {
                await approveSellerApi(actionModal.seller.id);
                showToast(`Successfully approved ${actionModal.seller.firstName}`);
            } else if (actionModal.type === 'reject') {
                if (!rejectReason.trim()) {
                    showToast('Please provide a rejection reason');
                    setActionLoading(false);
                    return;
                }
                await rejectSellerApi(actionModal.seller.id, rejectReason);
                showToast(`Successfully rejected ${actionModal.seller.firstName}`);
            }

            // Refetch or update UI
            setSellers(prev => prev.filter(s => s.id !== actionModal.seller.id));
            setActionModal({ isOpen: false, type: null, seller: null });
        } catch (err) {
            showToast(err.response?.data?.message || err.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredSellers = sellers.filter(seller =>
        (seller.firstName && seller.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (seller.email && seller.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (seller.phone && seller.phone.includes(searchTerm)) ||
        (seller.shopDetail?.shopName && seller.shopDetail.shopName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="w-full h-full flex flex-col relative">
            {toastMessage && (
                <div className="fixed top-20 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-4 font-semibold text-sm">
                    {toastMessage}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-['Geist_Sans']">Pending Sellers</h2>
                    <p className="text-gray-500 text-sm mt-1">Review and manage new seller applications.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search sellers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm text-sm placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1 h-[calc(100vh-250px)]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F8FAFC] border-b border-gray-200 sticky top-0 z-10 shadow-[0_1px_0_0_#e5e7eb]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Shop</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 relative">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="animate-spin text-green-600" size={32} />
                                            <span className="text-sm font-medium">Loading sellers...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-red-500 font-medium">
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredSellers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                                <Search size={24} className="text-gray-400" />
                                            </div>
                                            <span className="text-base font-semibold text-gray-800">No pending sellers found</span>
                                            <span className="text-sm text-gray-400">Try adjusting your search query</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSellers.map((seller) => (
                                    <tr key={seller.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">#{seller.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                                                    {seller.firstName ? seller.firstName.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{seller.firstName} {seller.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{seller.phone}</span>
                                                <span className="text-xs text-gray-500 mt-0.5">{seller.email || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                                {seller.shopDetail?.shopName || 'Not Added'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{seller.shopDetail?.district || seller.address?.district || 'N/A'}</span>
                                                <span className="text-xs text-gray-500 mt-0.5">{seller.shopDetail?.state || seller.address?.state || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
                                                Pending
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleActionClick(seller, 'approve')}
                                                    className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-colors border border-green-200/50 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                                    title="Approve Seller"
                                                >
                                                    <Check size={16} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleActionClick(seller, 'reject')}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors border border-red-200/50 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                    title="Reject Seller"
                                                >
                                                    <X size={16} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between mt-auto">
                    <span className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-900">{filteredSellers.length > 0 ? 1 : 0}</span> to <span className="font-semibold text-gray-900">{filteredSellers.length}</span> of <span className="font-semibold text-gray-900">{filteredSellers.length}</span> results
                    </span>
                    <div className="flex gap-1">
                        <button disabled className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-400 bg-gray-50 cursor-not-allowed">Prev</button>
                        <button disabled className="px-3 py-1 border border-gray-200 rounded text-sm text-white bg-green-600 font-medium">1</button>
                        <button disabled className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-400 bg-gray-50 cursor-not-allowed">Next</button>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                {actionModal.type === 'approve' ? 'Approve Seller' : 'Reject Seller'}
                            </h3>
                            <button
                                onClick={() => !actionLoading && setActionModal({ isOpen: false, type: null, seller: null })}
                                className="text-gray-400 hover:bg-gray-100 rounded-full p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                {actionModal.type === 'approve'
                                    ? `Are you sure you want to approve ${actionModal.seller?.firstName}'s application? They will gain access to the seller portal immediately.`
                                    : `Please provide a reason for rejecting ${actionModal.seller?.firstName}'s application. This will be visible to the seller.`
                                }
                            </p>

                            {actionModal.type === 'reject' && (
                                <textarea
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none placeholder-gray-400 text-sm"
                                    rows={4}
                                    placeholder="Enter rejection reason..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    autoFocus
                                ></textarea>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 w-full">
                            <button
                                onClick={() => setActionModal({ isOpen: false, type: null, seller: null })}
                                disabled={actionLoading}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                disabled={actionLoading || (actionModal.type === 'reject' && !rejectReason.trim())}
                                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors flex items-center justify-center min-w-[100px] border-none
                                    ${actionModal.type === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                                        : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                                    }`}
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingSellers;
