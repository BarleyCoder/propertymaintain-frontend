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
        inProgress: workOrders.filter(w => w.status === 'in_progress').length,
        completed: workOrders.filter(w => w.status === 'completed').length,
    };

    const getStatusBadge = (status) => {
        const badges = {
            assigned: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-yellow-100 text-amber-700',
            completed: 'bg-green-100 text-green-700',
            unable_to_complete: 'bg-red-100 text-red-700',
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const formatStatus = (status) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const recentTasks = workOrders.slice(0, 5);

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

                    {/* Dashboard Section - Stats Cards */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-[#181c20] mb-4">Dashboard Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Total Tasks</p>
                                    <p className="text-3xl font-bold text-[#005bbf]">{String(stats.assigned).padStart(2, '0')}</p>
                                </div>
                                <div className="w-12 h-12 bg-[#d8e2ff] rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#005bbf]">assignment</span>
                                </div>
                            </div>
                            <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Assigned</p>
                                    <p className="text-3xl font-bold text-blue-600">{String(stats.pending).padStart(2, '0')}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-600">pending_actions</span>
                                </div>
                            </div>
                            <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase mb-1">In Progress</p>
                                    <p className="text-3xl font-bold text-amber-600">{String(stats.inProgress).padStart(2, '0')}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-amber-600">sync</span>
                                </div>
                            </div>
                            <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase mb-1">Completed</p>
                                    <p className="text-3xl font-bold text-green-600">{String(stats.completed).padStart(2, '0')}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity and Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Recent Tasks */}
                        <div className="lg:col-span-2 bg-white border border-[#c1c6d6] rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-[#181c20]">Recent Tasks</h2>
                                <Link to="/technician/work-orders" className="text-[#005bbf] text-xs font-bold hover:underline">
                                    View All
                                </Link>
                            </div>
                            {loading || recentTasks.length === 0 ? (
                                <p className="text-sm text-[#414754]">
                                    {loading ? 'Loading tasks...' : 'No tasks assigned yet. Click "View All" to see your assigned tasks.'}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentTasks.map(order => (
                                        <div key={order._id} className="border border-[#c1c6d6] rounded-lg p-4 hover:bg-[#f7f9ff] transition-colors">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-bold text-[#005bbf]">
                                                            #{order._id ? order._id.substring(order._id.length - 6).toUpperCase() : 'N/A'}
                                                        </p>
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(order.status)}`}>
                                                            {formatStatus(order.status)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-[#414754] capitalize">
                                                        {order.requestId?.category || 'N/A'} • {order.requestId?.propertyId?.name || 'Unknown Property'}
                                                    </p>
                                                    {order.requestId?.description && (
                                                        <p className="text-xs text-[#414754] mt-1 line-clamp-1">
                                                            {order.requestId.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <Link
                                                    to={`/technician/update-work-order/${order._id}`}
                                                    className="text-[#005bbf] text-xs font-bold hover:underline whitespace-nowrap ml-2">
                                                    Update
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions and Info */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-[#005bbf] text-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-lg mb-2">⚡ Quick Actions</h3>
                                <div className="space-y-2">
                                    <Link to="/technician/work-orders" className="block w-full bg-white text-[#005bbf] font-bold py-2 px-4 rounded-lg text-center hover:bg-[#f1f4fa] transition-all text-sm">
                                        View All Assigned Tasks
                                    </Link>
                                    <Link to="/technician/setup-profile" className="block w-full bg-white/20 text-white font-bold py-2 px-4 rounded-lg text-center hover:bg-white/30 transition-all text-sm">
                                        Update Profile
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg text-[#181c20] mb-2">📊 Performance</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-[#414754]">Completion Rate</span>
                                            <span className="font-bold text-[#181c20]">
                                                {stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#e0e0e0] rounded-full h-2">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full" 
                                                style={{ width: stats.assigned > 0 ? `${(stats.completed / stats.assigned) * 100}%` : '0%' }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg text-yellow-900 mb-2">ℹ️ Info</h3>
                                <p className="text-xs text-yellow-800">
                                    Go to "Assigned Tasks" to view, update, and manage all your work orders.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TechnicianDashboard;