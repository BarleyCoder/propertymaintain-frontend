import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import LandlordSidebar from '../../components/LandlordSidebar';
import API from '../../utils/axios';

const WorkOrders = () => {
    const { user } = useAuth();
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchWorkOrders = useCallback(async () => {
        try {
            const response = await API.get('/api/workorders/landlord');
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

    const filteredOrders = workOrders.filter(w => {
        const matchSearch = searchTerm === '' ||
            `#WO-${w.id}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.technician_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === '' || w.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(start, start + itemsPerPage);

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

    // Kanban columns
    const assigned = workOrders.filter(w => w.status === 'assigned');
    const inProgress = workOrders.filter(w => w.status === 'in_progress');
    const completed = workOrders.filter(w => w.status === 'completed');

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f9ff]">
            <LandlordSidebar />

            <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="hidden md:flex bg-[#f1f4fa] px-4 py-1 rounded-full border border-[#c1c6d6] items-center gap-2 min-w-[320px]">
                        <span className="material-symbols-outlined text-[#727785]">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#727785]"
                            placeholder="Search work orders..."
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
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1280px] mx-auto space-y-6">

                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-[#181c20]">Work Orders</h1>
                                <p className="text-sm text-[#414754]">Manage and track all maintenance work orders.</p>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="border border-[#c1c6d6] rounded-lg px-3 py-2 text-sm focus:border-[#005bbf] outline-none"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                                    <option value="">All Statuses</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Kanban Board */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Assigned Column */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-semibold text-[#414754] uppercase tracking-wider">Assigned</h3>
                                        <span className="bg-[#dfe3e8] text-[#181c20] px-2 py-0.5 rounded-full text-xs font-semibold">{assigned.length}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 min-h-[400px]">
                                    {loading ? (
                                        <p className="text-sm text-[#414754] px-2">Loading...</p>
                                    ) : assigned.length === 0 ? (
                                        <div className="border-2 border-dashed border-[#c1c6d6] rounded-xl p-6 text-center">
                                            <p className="text-sm text-[#414754]">No assigned orders</p>
                                        </div>
                                    ) : (
                                        assigned.map(order => (
                                            <div key={order.id} className="bg-white border border-[#c1c6d6] p-4 rounded-xl shadow-sm hover:border-[#005bbf] transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-[#727785]">#WO-{order.id}</span>
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                </div>
                                                <h4 className="text-sm font-bold text-[#181c20] mb-1 capitalize">{order.category}</h4>
                                                <p className="text-xs text-[#414754] mb-3">{order.tenant_name}</p>
                                                <div className="border-t border-[#c1c6d6] pt-2 flex justify-between items-center">
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm text-[#414754]">person</span>
                                                        <span className="text-xs text-[#005bbf] font-semibold">{order.technician_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm text-[#414754]">calendar_today</span>
                                                        <span className="text-xs text-[#414754]">{new Date(order.scheduled_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* In Progress Column */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-semibold text-[#414754] uppercase tracking-wider">In Progress</h3>
                                        <span className="bg-[#1a73e8] text-white px-2 py-0.5 rounded-full text-xs font-semibold">{inProgress.length}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 min-h-[400px]">
                                    {loading ? (
                                        <p className="text-sm text-[#414754] px-2">Loading...</p>
                                    ) : inProgress.length === 0 ? (
                                        <div className="border-2 border-dashed border-[#c1c6d6] rounded-xl p-6 text-center">
                                            <p className="text-sm text-[#414754]">No orders in progress</p>
                                        </div>
                                    ) : (
                                        inProgress.map(order => (
                                            <div key={order.id} className="bg-white border border-[#c1c6d6] p-4 rounded-xl shadow-sm hover:border-[#005bbf] transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-[#727785]">#WO-{order.id}</span>
                                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                </div>
                                                <h4 className="text-sm font-bold text-[#181c20] mb-1 capitalize">{order.category}</h4>
                                                <p className="text-xs text-[#414754] mb-3">{order.tenant_name}</p>
                                                <div className="border-t border-[#c1c6d6] pt-2 flex justify-between items-center">
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm text-[#414754]">person</span>
                                                        <span className="text-xs text-[#005bbf] font-semibold">{order.technician_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm text-[#414754]">calendar_today</span>
                                                        <span className="text-xs text-[#414754]">{new Date(order.scheduled_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Completed Column */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-semibold text-[#414754] uppercase tracking-wider">Completed</h3>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">{completed.length}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 min-h-[400px]">
                                    {loading ? (
                                        <p className="text-sm text-[#414754] px-2">Loading...</p>
                                    ) : completed.length === 0 ? (
                                        <div className="border-2 border-dashed border-[#c1c6d6] rounded-xl p-6 text-center">
                                            <p className="text-sm text-[#414754]">No completed orders</p>
                                        </div>
                                    ) : (
                                        completed.map(order => (
                                            <div key={order.id} className="bg-white border border-[#c1c6d6] p-4 rounded-xl shadow-sm opacity-80">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-[#727785]">#WO-{order.id}</span>
                                                    <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-[#181c20] mb-1 capitalize line-through opacity-60">{order.category}</h4>
                                                <p className="text-xs text-[#414754] mb-3">{order.tenant_name}</p>
                                                <div className="border-t border-[#c1c6d6] pt-2 flex justify-between items-center">
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm text-[#414754]">person</span>
                                                        <span className="text-xs text-[#414754]">{order.technician_name}</span>
                                                    </div>
                                                    <span className="text-xs text-green-600 font-bold">Done</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Work Orders Table */}
                        <div className="bg-white border border-[#c1c6d6] rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-[#c1c6d6]">
                                <h3 className="text-lg font-bold text-[#181c20]">All Work Orders</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f1f4fa] border-b border-[#c1c6d6]">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Work Order ID</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Category</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Technician</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Tenant</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Scheduled Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c1c6d6]">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">Loading...</td>
                                            </tr>
                                        ) : paginatedOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">No work orders found.</td>
                                            </tr>
                                        ) : (
                                            paginatedOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-[#f7f9ff] transition-colors">
                                                    <td className="px-6 py-4 font-bold text-[#005bbf] text-xs">#WO-{order.id}</td>
                                                    <td className="px-6 py-4 text-sm capitalize">{order.category}</td>
                                                    <td className="px-6 py-4 text-sm">{order.technician_name}</td>
                                                    <td className="px-6 py-4 text-sm">{order.tenant_name}</td>
                                                    <td className="px-6 py-4 text-sm text-[#414754]">
                                                        {new Date(order.scheduled_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                                                            {formatStatus(order.status)}
                                                        </span>
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
                                    Showing {filteredOrders.length} work order{filteredOrders.length !== 1 ? 's' : ''}
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
                </div>
            </div>
        </div>
    );
};

export default WorkOrders;