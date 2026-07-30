import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import TechnicianSidebar from '../../components/TechnicianSidebar';
import API from '../../utils/axios';

const TechnicianDashboard = () => {
    const { user } = useAuth();
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkOrders = useCallback(async () => {
        try {
            const response = await API.get('/api/workorders/technician');
            setWorkOrders(response.data.workOrders);
        } catch (error) {
            console.error('Error fetching work orders:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkOrders();
    }, [fetchWorkOrders]);

    const stats = {
        assigned: workOrders.length,
        pending: workOrders.filter(w => w.status === 'assigned').length,
        completed: workOrders.filter(w => w.status === 'completed').length,
    };

    const getStatusBadge = (status) => {
        const badges = {
            assigned: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-yellow-100 text-amber-700',
            completed: 'bg-green-100 text-green-700',
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const formatStatus = (status) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
            <TechnicianSidebar />

            <main className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="font-bold text-lg text-[#005bbf]">Technician Dashboard</div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f1f4fa] relative">
                            <span className="material-symbols-outlined text-[#414754]">notifications</span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Welcome */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#181c20]">
                            Welcome back, {user?.full_name}! 👋
                        </h1>
                        <p className="text-[#414754]">
                            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Assigned Tasks</p>
                                <p className="text-3xl font-bold text-[#005bbf]">{String(stats.assigned).padStart(2, '0')}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#d8e2ff] rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#005bbf]">assignment</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Pending Tasks</p>
                                <p className="text-3xl font-bold text-amber-600">{String(stats.pending).padStart(2, '0')}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-600">pending_actions</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Completed Tasks</p>
                                <p className="text-3xl font-bold text-green-600">{String(stats.completed).padStart(2, '0')}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600">check_circle</span>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Active Assignments Table */}
                        <div className="lg:col-span-2 bg-white border border-[#c1c6d6] rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#c1c6d6] flex justify-between items-center">
                                <h2 className="text-lg font-bold text-[#181c20]">Active Assignments</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f1f4fa] border-b border-[#c1c6d6]">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Ticket ID</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Category</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Deadline</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c1c6d6]">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-[#414754]">Loading tasks...</td>
                                            </tr>
                                        ) : workOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-[#414754]">No tasks assigned yet.</td>
                                            </tr>
                                        ) : (
                                            workOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-[#f7f9ff] transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-[#005bbf]">#WO-{order.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[#414754] text-lg">build</span>
                                                            <span className="text-sm capitalize">{order.category}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#414754]">
                                                        {new Date(order.scheduled_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                                                            {formatStatus(order.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link
                                                            to={`/technician/update-work-order/${order.id}`}
                                                            className="text-[#005bbf] text-xs font-bold hover:underline">
                                                            Update
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-white border border-[#c1c6d6] rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-[#181c20] mb-4">Recent Activity</h2>
                                {workOrders.length === 0 ? (
                                    <p className="text-sm text-[#414754]">No recent activity.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {workOrders.slice(0, 3).map(order => (
                                            <li key={order.id} className="flex items-start gap-3">
                                                <span className={`material-symbols-outlined mt-1 ${order.status === 'completed' ? 'text-green-600' : 'text-[#005bbf]'}`}>
                                                    {order.status === 'completed' ? 'check_circle' : 'description'}
                                                </span>
                                                <div>
                                                    <p className="text-sm text-[#181c20]">
                                                        Work order <span className="font-bold">#WO-{order.id}</span> - {order.category}
                                                    </p>
                                                    <p className="text-xs text-[#414754]">
                                                        {formatStatus(order.status)}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Quick Info */}
                            <div className="bg-[#005bbf] text-white p-6 rounded-xl">
                                <h3 className="font-bold text-lg mb-2">Need Support?</h3>
                                <p className="text-sm opacity-90 mb-4">Contact your property manager for any issues.</p>
                                <button className="bg-white text-[#005bbf] font-bold py-2 px-4 rounded-lg text-sm hover:bg-[#f1f4fa] transition-all">
                                    Contact Manager
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TechnicianDashboard;