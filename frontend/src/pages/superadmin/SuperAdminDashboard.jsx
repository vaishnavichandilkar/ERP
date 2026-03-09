import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, UserPlus, ArrowUpRight } from 'lucide-react';
import { getPendingSellersApi } from '../../services/superAdminService';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        total: 120, // Example static values for now unless an API provides this 
        pending: 0,
        approved: 85,
        rejected: 5
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { getApprovedSellersApi, getRejectedSellersApi } = await import('../../services/superAdminService');
                const [pendingData, approvedData, rejectedData] = await Promise.all([
                    getPendingSellersApi(),
                    getApprovedSellersApi(),
                    getRejectedSellersApi()
                ]);

                const pendingCount = pendingData?.length || 0;
                const approvedCount = approvedData?.length || 0;
                const rejectedCount = rejectedData?.length || 0;

                setStats({
                    pending: pendingCount,
                    approved: approvedCount,
                    rejected: rejectedCount,
                    total: pendingCount + approvedCount + rejectedCount
                });
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Sellers', value: stats.total, icon: Users, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
        { title: 'Pending Sellers', value: stats.pending, icon: UserPlus, color: 'bg-orange-50 text-orange-500', border: 'border-orange-100' },
        { title: 'Approved Sellers', value: stats.approved, icon: UserCheck, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
        { title: 'Rejected Sellers', value: stats.rejected, icon: UserX, color: 'bg-red-50 text-red-500', border: 'border-red-100' }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-32"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-['Geist_Sans']">Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className={`bg-white rounded-2xl p-6 border ${stat.border} shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-gray-900 font-['Geist_Sans']">
                                        {stat.value.toLocaleString()}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <Icon size={24} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm font-medium text-green-600">
                                <ArrowUpRight size={16} className="mr-1" />
                                <span>+2.5% this month</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Placeholder for future graphs or activity logs */}
            <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[400px]">
                <h3 className="text-lg font-bold text-gray-900 mb-4 font-['Geist_Sans']">Recent Activity</h3>
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                    <p>Activity logs will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
