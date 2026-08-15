import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import useAuth from '../../context/useAuth';
import API from '../../utils/axios';

const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'assigned' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' }
];

const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getStatusBadge = (status) => {
    const normalized = status || 'assigned';
    const styles = {
        assigned: 'bg-[#fff3e0] text-[#ef6c00]',
        in_progress: 'bg-[#d8e2ff] text-[#005bbf]',
        completed: 'bg-[#e8f5e9] text-[#2e7d32]',
        cancelled: 'bg-[#fbe9e7] text-[#c62828]'
    };
    return `rounded-full px-2 py-1 text-xs font-semibold capitalize ${styles[normalized] || 'bg-[#f1f4fa] text-[#414754]'}`;
};

const AdminWorkOrders = () => {
    const { user } = useAuth();
    const [workOrders, setWorkOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWorkOrders = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await API.get('/api/admin/work-orders');
                setWorkOrders(res.data.workOrders || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load work orders.');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkOrders();
    }, []);

    const visibleWorkOrders = useMemo(() => {
        if (filter === 'all') return workOrders;
        return workOrders.filter((item) => item.status === filter);
    }, [filter, workOrders]);

    return (
        <div className="flex min-h-screen w-full bg-[#f7f9ff]">
            <AdminSidebar />

            <main className="flex-1 overflow-hidden md:ml-64">
                <div className="min-h-screen p-4 md:p-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#005bbf]">Admin Portal</p>
                                <h1 className="text-3xl font-bold text-[#181c20]">Work Order Monitoring</h1>
                            </div>
                            <div className="rounded-full bg-[#005bbf] px-4 py-2 text-sm font-semibold text-white">
                                {user?.full_name || 'Administrator'}
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="mb-5 flex flex-wrap gap-2">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFilter(option.value)}
                                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${filter === option.value
                                        ? 'bg-[#005bbf] text-white'
                                        : 'border border-[#c1c6d6] bg-white text-[#414754] hover:bg-[#eef3ff]'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="rounded-xl border border-[#c1c6d6] bg-white p-8 text-[#414754]">
                                Loading work orders...
                            </div>
                        ) : visibleWorkOrders.length === 0 ? (
                            <div className="rounded-xl border border-[#c1c6d6] bg-white p-8 text-center text-[#414754]">
                                No work orders found for this filter.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-[#c1c6d6] bg-white shadow-sm">
                                <table className="min-w-full text-left text-sm text-[#181c20]">
                                    <thead className="bg-[#f1f4fa]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Work Order ID</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Maintenance Request</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Technician</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Landlord</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Property</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Status</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Scheduled Date</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Completed Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleWorkOrders.map((item) => (
                                            <tr key={item._id} className="border-t border-[#eef2f8] align-top">
                                                <td className="px-4 py-3 font-medium text-[#005bbf]">{item._id || 'N/A'}</td>
                                                <td className="px-4 py-3">
                                                    {item.requestId?.category ? `${item.requestId.category} / ${item.requestId.priority || ''}`.trim() : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3">{item.technicianId?.full_name || item.technicianId?.email || 'N/A'}</td>
                                                <td className="px-4 py-3">{item.assignedBy?.full_name || item.assignedBy?.email || 'N/A'}</td>
                                                <td className="px-4 py-3">{item.requestId?.propertyId?.name || item.requestId?.propertyId?.propertyCode || 'N/A'}</td>
                                                <td className="px-4 py-3"><span className={getStatusBadge(item.status)}>{item.status || 'assigned'}</span></td>
                                                <td className="px-4 py-3">{formatDate(item.scheduledDate)}</td>
                                                <td className="px-4 py-3">{formatDate(item.completedAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminWorkOrders;
