import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import TenantSidebar from '../../components/Sidebar';
import API from '../../utils/axios';
import { useDataRefresh } from '../../utils/dataRefresh';

const MyRequests = () => {
    const { user } = useAuth();
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const itemsPerPage = 8;

    const fetchRequests = useCallback(async () => {
        try {
            const response = await API.get('/api/maintenance/tenant');
            setAllRequests(response.data.requests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    useDataRefresh(() => {
        fetchRequests();
    }, 'tenant');

    const filteredRequests = allRequests.filter(r => {
        const matchSearch = searchTerm === '' ||
            `#TKT-${r.id}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === '' || r.status === statusFilter;
        const matchPriority = priorityFilter === '' || r.priority === priorityFilter;
        return matchSearch && matchStatus && matchPriority;
    });

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedRequests = filteredRequests.slice(start, start + itemsPerPage);

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

    const getPriorityDot = (priority) => {
        const dots = {
            high: 'bg-red-500',
            emergency: 'bg-red-500',
            medium: 'bg-amber-500',
            low: 'bg-gray-400'
        };
        return dots[priority] || 'bg-gray-400';
    };

    const formatStatus = (status) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f9ff]">
            <TenantSidebar />

            <div className="flex-1 flex flex-col md:ml-64">

                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="hidden md:flex bg-[#f1f4fa] px-4 py-1 rounded-full border border-[#c1c6d6] items-center gap-2 min-w-[320px]">
                        <span className="material-symbols-outlined text-[#727785]">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#727785]"
                            placeholder="Search requests..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f1f4fa]">
                            <span className="material-symbols-outlined text-[#414754]">notifications</span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1280px] mx-auto space-y-6">

                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-[#181c20]">My Maintenance Requests</h1>
                                <p className="text-sm text-[#414754]">Track and manage your property maintenance tickets.</p>
                            </div>
                            <Link
                                className="bg-[#005bbf] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#004493] transition-all active:scale-95 shadow-sm"
                                to="/tenant/submit-request">
                                <span className="material-symbols-outlined text-xl">add</span>
                                <span className="text-xs font-semibold">New Request</span>
                            </Link>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-4 flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[240px]">
                                <label className="block text-xs font-semibold text-[#414754] uppercase mb-1">Search</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727785] text-lg">search</span>
                                    <input
                                        className="w-full border border-[#c1c6d6] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#005bbf] outline-none"
                                        placeholder="Ticket ID or Category"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="block text-xs font-semibold text-[#414754] uppercase mb-1">Status</label>
                                <select
                                    className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2 text-sm focus:border-[#005bbf] outline-none"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="block text-xs font-semibold text-[#414754] uppercase mb-1">Priority</label>
                                <select
                                    className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2 text-sm focus:border-[#005bbf] outline-none"
                                    value={priorityFilter}
                                    onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}>
                                    <option value="">All Priorities</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                        </div>

                        {/* Requests Table */}
                        <div className="bg-white border border-[#c1c6d6] rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f1f4fa] border-b border-[#c1c6d6]">
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Ticket ID</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Category</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Priority</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c1c6d6]">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">
                                                    Loading requests...
                                                </td>
                                            </tr>
                                        ) : paginatedRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">
                                                    No requests found.{' '}
                                                    <Link to="/tenant/submit-request" className="text-[#005bbf] font-bold hover:underline">
                                                        Submit one!
                                                    </Link>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedRequests.map(request => (
                                                <tr key={request.id} className="hover:bg-[#f7f9ff] transition-colors">
                                                    <td className="px-6 py-4 text-xs font-bold text-[#005bbf]">#TKT-{request.id}</td>
                                                    <td className="px-6 py-4 text-sm capitalize">{request.category}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`w-2 h-2 rounded-full ${getPriorityDot(request.priority)}`}></span>
                                                            <span className="text-sm capitalize">{request.priority}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(request.status)}`}>
                                                            {formatStatus(request.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#414754]">
                                                        {new Date(request.submitted_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link
                                                            to={`/tenant/request-details/${request.id}`}
                                                            className="text-[#005bbf] text-xs font-bold hover:underline">
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-[#c1c6d6] bg-white flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#414754]">
                                    Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-1 rounded hover:bg-[#e5e8ee] transition-colors disabled:opacity-30"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}>
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <span className="text-xs font-semibold text-[#414754]">
                                        Page {currentPage} of {totalPages || 1}
                                    </span>
                                    <button
                                        className="p-1 rounded hover:bg-[#e5e8ee] transition-colors disabled:opacity-30"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}>
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MyRequests;