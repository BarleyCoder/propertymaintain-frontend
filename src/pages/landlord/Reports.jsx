import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import LandlordSidebar from '../../components/LandlordSidebar';
import API from '../../utils/axios';

const Reports = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [requestsRes, workOrdersRes] = await Promise.all([
                API.get('/api/maintenance/landlord'),
                API.get('/api/workorders/landlord')
            ]);
            setRequests(requestsRes.data.requests);
            setWorkOrders(workOrdersRes.data.workOrders);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        inProgress: requests.filter(r => r.status === 'in_progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
        totalWorkOrders: workOrders.length,
        completedWorkOrders: workOrders.filter(w => w.status === 'completed').length,
    };

    const resolutionRate = stats.total > 0
        ? Math.round((stats.completed / stats.total) * 100)
        : 0;

    const categories = requests.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
    }, {});

    const categoryData = Object.entries(categories).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / requests.length) * 100) || 0
    }));

    const categoryColors = {
        plumbing: 'bg-[#005bbf]',
        electrical: 'bg-[#4d8efe]',
        carpentry: 'bg-[#006d2c]',
        roofing: 'bg-amber-500',
        painting: 'bg-purple-500',
        other: 'bg-gray-400'
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f9ff]">
            <LandlordSidebar />

            <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-[#005bbf]">Reports & Analytics</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 bg-[#005bbf] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#004493]">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Export Report
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1280px] mx-auto space-y-6">

                        {/* Page Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-[#181c20]">Reports & Analytics</h1>
                            <p className="text-sm text-[#414754]">Overview of your property maintenance performance.</p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="material-symbols-outlined p-2 bg-[#d8e2ff] text-[#005bbf] rounded-lg">timer</span>
                                    <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">trending_down</span>
                                        12%
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-[#414754] uppercase mt-2">Avg Resolution Time</p>
                                <h3 className="text-2xl font-bold text-[#181c20]">4.2 hrs</h3>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="material-symbols-outlined p-2 bg-[#d8e2ff] text-[#005bbf] rounded-lg">payments</span>
                                    <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">trending_up</span>
                                        5%
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-[#414754] uppercase mt-2">Total Monthly Spend</p>
                                <h3 className="text-2xl font-bold text-[#181c20]">₦1,240,000</h3>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="material-symbols-outlined p-2 bg-[#d8e2ff] text-[#005bbf] rounded-lg">assignment_late</span>
                                    <span className="bg-[#d8e2ff] text-[#005bbf] px-2 py-0.5 rounded text-xs font-bold">ACTIVE</span>
                                </div>
                                <p className="text-xs font-semibold text-[#414754] uppercase mt-2">Active Work Orders</p>
                                <h3 className="text-2xl font-bold text-[#181c20]">{stats.inProgress}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="material-symbols-outlined p-2 bg-[#d8e2ff] text-[#005bbf] rounded-lg">engineering</span>
                                    <span className="text-green-600 text-xs font-bold">Optimal</span>
                                </div>
                                <p className="text-xs font-semibold text-[#414754] uppercase mt-2">Resolution Rate</p>
                                <h3 className="text-2xl font-bold text-[#181c20]">{resolutionRate}%</h3>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Request Status Chart */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm">
                                <h4 className="text-lg font-bold text-[#181c20] mb-6">Request Status Overview</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-semibold text-[#414754]">Pending</span>
                                            <span className="text-xs font-bold text-[#181c20]">{stats.pending}</span>
                                        </div>
                                        <div className="w-full bg-[#dfe3e8] h-3 rounded-full">
                                            <div
                                                className="bg-amber-500 h-full rounded-full transition-all"
                                                style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-semibold text-[#414754]">In Progress</span>
                                            <span className="text-xs font-bold text-[#181c20]">{stats.inProgress}</span>
                                        </div>
                                        <div className="w-full bg-[#dfe3e8] h-3 rounded-full">
                                            <div
                                                className="bg-[#005bbf] h-full rounded-full transition-all"
                                                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-semibold text-[#414754]">Completed</span>
                                            <span className="text-xs font-bold text-[#181c20]">{stats.completed}</span>
                                        </div>
                                        <div className="w-full bg-[#dfe3e8] h-3 rounded-full">
                                            <div
                                                className="bg-green-500 h-full rounded-full transition-all"
                                                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bar Chart */}
                                <div className="mt-8">
                                    <h4 className="text-sm font-bold text-[#181c20] mb-4">Monthly Trends</h4>
                                    <div className="flex items-end justify-between gap-4 h-32">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
                                            const heights = ['40%', '60%', '45%', '85%', '55%', '70%'];
                                            return (
                                                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                                                    <div
                                                        className="w-full bg-[#005bbf]/20 rounded-t-lg hover:bg-[#005bbf]/40 transition-all"
                                                        style={{ height: heights[index] }}>
                                                    </div>
                                                    <span className="text-xs text-[#414754]">{month}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm">
                                <h4 className="text-lg font-bold text-[#181c20] mb-6">Repair Categories</h4>
                                {loading ? (
                                    <p className="text-sm text-[#414754]">Loading...</p>
                                ) : categoryData.length === 0 ? (
                                    <p className="text-sm text-[#414754]">No data available</p>
                                ) : (
                                    <div className="space-y-4">
                                        {categoryData.map(cat => (
                                            <div key={cat.name}>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs font-semibold text-[#414754] capitalize">{cat.name}</span>
                                                    <span className="text-xs font-bold text-[#181c20]">{cat.count}</span>
                                                </div>
                                                <div className="w-full bg-[#dfe3e8] h-2 rounded-full">
                                                    <div
                                                        className={`${categoryColors[cat.name] || 'bg-gray-400'} h-full rounded-full`}
                                                        style={{ width: `${cat.percentage}%` }}>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="mt-6 pt-4 border-t border-[#c1c6d6]">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-[#414754]">Total Requests</span>
                                        <span className="text-xs font-bold">{stats.total}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-[#414754]">Work Orders</span>
                                        <span className="text-xs font-bold">{stats.totalWorkOrders}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-[#414754]">Completed</span>
                                        <span className="text-xs font-bold text-green-600">{stats.completedWorkOrders}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Table */}
                        <div className="bg-white rounded-xl border border-[#c1c6d6] overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-[#c1c6d6] flex justify-between items-center">
                                <h4 className="text-lg font-bold text-[#181c20]">Recent Performance Audit</h4>
                                <button className="text-[#005bbf] font-bold text-xs hover:underline">View All Records</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f1f4fa] border-b border-[#c1c6d6]">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Technician</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Tasks</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Completed</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Rate</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c1c6d6]">
                                        {workOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-[#414754]">
                                                    No work orders data available.
                                                </td>
                                            </tr>
                                        ) : (
                                            (() => {
                                                const techStats = workOrders.reduce((acc, wo) => {
                                                    if (!acc[wo.technician_name]) {
                                                        acc[wo.technician_name] = { total: 0, completed: 0 };
                                                    }
                                                    acc[wo.technician_name].total++;
                                                    if (wo.status === 'completed') acc[wo.technician_name].completed++;
                                                    return acc;
                                                }, {});

                                                return Object.entries(techStats).map(([name, data]) => {
                                                    const rate = Math.round((data.completed / data.total) * 100);
                                                    return (
                                                        <tr key={name} className="hover:bg-[#f7f9ff] transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-[#d8e2ff] flex items-center justify-center text-[#005bbf] font-bold text-xs">
                                                                        {name?.charAt(0)}
                                                                    </div>
                                                                    <span className="text-sm font-medium">{name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm">{data.total}</td>
                                                            <td className="px-6 py-4 text-sm">{data.completed}</td>
                                                            <td className="px-6 py-4 text-sm font-bold">{rate}%</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${rate >= 80 ? 'bg-green-100 text-green-700' : rate >= 50 ? 'bg-yellow-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                                    {rate >= 80 ? 'Excellent' : rate >= 50 ? 'Good' : 'Needs Improvement'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })()
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;