import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import LandlordSidebar from '../../components/LandlordSidebar';
import API from '../../utils/axios';

const LandlordDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        try {
            const response = await API.get('/api/maintenance/landlord');
            setRequests(response.data.requests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        inProgress: requests.filter(r => r.status === 'in_progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-amber-700',
            approved: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700'
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const formatStatus = (status) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'text-red-500',
            emergency: 'text-red-500',
            medium: 'text-amber-500',
            low: 'text-gray-500'
        };
        return colors[priority] || 'text-gray-500';
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
            <LandlordSidebar />

            <main className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="hidden md:flex bg-[#f1f4fa] px-4 py-1 rounded-full border border-[#c1c6d6] items-center gap-2 min-w-[320px]">
                        <span className="material-symbols-outlined text-[#727785]">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#727785]"
                            placeholder="Search requests..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f1f4fa] relative">
                            <span className="material-symbols-outlined text-[#414754]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Welcome */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-[#181c20]">Dashboard Overview</h1>
                            <p className="text-[#414754]">Welcome back, {user?.full_name}. Here is what requires your attention today.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c1c6d6] rounded-lg text-xs font-semibold text-[#414754] hover:bg-[#f1f4fa]">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                This Month
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c1c6d6] rounded-lg text-xs font-semibold text-[#414754] hover:bg-[#f1f4fa]">
                                <span className="material-symbols-outlined text-sm">download</span>
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="material-symbols-outlined p-2 bg-[#d8e2ff] text-[#005bbf] rounded-lg">assignment</span>
                                <span className="text-green-600 text-xs font-bold">+12%</span>
                            </div>
                            <p className="text-xs font-semibold text-[#414754] uppercase mt-2">Total Requests</p>
                            <h3 className="text-3xl font-bold text-[#181c20]">{stats.total}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="material-symbols-outlined p-2 bg-red-100 text-red-500 rounded-lg">pending_actions</span>
                                <span className="text-red-500 text-xs font-bold">+5%</span>
                            </div>
                            <p className="text-xs font-semibold text-[#414754] uppercase mt-2">Pending</p>
                            <h3 className="text-3xl font-bold text-[#181c20]">{stats.pending}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="material-symbols-outlined p-2 bg-[#d8e2ff] text-[#005ac1] rounded-lg">sync</span>
                                <span className="text-[#414754] text-xs font-bold">-2%</span>
                            </div>
                            <p className="text-xs font-semibold text-[#414754] uppercase mt-2">In Progress</p>
                            <h3 className="text-3xl font-bold text-[#181c20]">{stats.inProgress}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="material-symbols-outlined p-2 bg-green-100 text-green-600 rounded-lg">task_alt</span>
                                <span className="text-green-600 text-xs font-bold">+18%</span>
                            </div>
                            <p className="text-xs font-semibold text-[#414754] uppercase mt-2">Completed</p>
                            <h3 className="text-3xl font-bold text-[#181c20]">{stats.completed}</h3>
                        </div>
                    </div>

                    {/* Recent Requests Table */}
                    <div className="bg-white rounded-xl border border-[#c1c6d6] shadow-sm overflow-hidden">
                        <div className="p-6 flex justify-between items-center border-b border-[#c1c6d6]">
                            <h4 className="text-lg font-bold text-[#181c20]">Recent Requests</h4>
                            <Link className="text-[#005bbf] font-bold text-xs hover:underline" to="/landlord/requests">
                                View All Requests
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#f1f4fa] border-b border-[#c1c6d6]">
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Ticket ID</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Tenant</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Category</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Priority</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#c1c6d6]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-[#414754]">Loading requests...</td>
                                        </tr>
                                    ) : requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-[#414754]">No requests found.</td>
                                        </tr>
                                    ) : (
                                        requests.slice(0, 5).map(request => (
                                            <tr key={request.id} className="hover:bg-[#f7f9ff] transition-colors">
                                                <td className="px-6 py-4 font-bold text-[#005bbf] text-xs">#PM-{request.id}</td>
                                                <td className="px-6 py-4 text-sm">{request.tenant_name}</td>
                                                <td className="px-6 py-4 text-sm capitalize">{request.category}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-bold capitalize ${getPriorityColor(request.priority)}`}>
                                                        {request.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(request.status)}`}>
                                                        {formatStatus(request.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#414754]">
                                                    {new Date(request.submitted_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        to="/landlord/requests"
                                                        className="text-[#005bbf] text-xs font-bold hover:underline">
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LandlordDashboard;