import { useEffect, useState } from 'react';
import useAuth from '../../context/useAuth';
import API from '../../utils/axios';
import AdminSidebar from '../../components/AdminSidebar';
import { useDataRefresh } from '../../utils/dataRefresh';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        tenantCount: 0,
        landlordCount: 0,
        technicianCount: 0,
        adminCount: 0,
        totalProperties: 0,
        totalMaintenanceRequests: 0,
        pendingMaintenanceRequests: 0,
        activeWorkOrders: 0,
        pendingTechnicians: 0,
        verifiedTechnicians: 0
    });
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    API.get('/api/admin/stats'),
                    API.get('/api/admin/activity')
                ]);

                setStats(statsRes.data.stats || {});
                setActivity(activityRes.data.activity || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    useDataRefresh(() => {
        const loadDashboard = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    API.get('/api/admin/stats'),
                    API.get('/api/admin/activity')
                ]);

                setStats(statsRes.data.stats || {});
                setActivity(activityRes.data.activity || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load dashboard data.');
            }
        };

        loadDashboard();
    }, 'admin');

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, tone: 'bg-[#d8e2ff] text-[#005bbf]' },
        { label: 'Landlords', value: stats.landlordCount, tone: 'bg-[#e8f5e9] text-[#2e7d32]' },
        { label: 'Tenants', value: stats.tenantCount, tone: 'bg-[#fff3e0] text-[#ef6c00]' },
        { label: 'Technicians', value: stats.technicianCount, tone: 'bg-[#f3e5f5] text-[#7b1fa2]' },
        { label: 'Properties', value: stats.totalProperties, tone: 'bg-[#e0f7fa] text-[#006064]' },
        { label: 'Maintenance Requests', value: stats.totalMaintenanceRequests, tone: 'bg-[#e3f2fd] text-[#1565c0]' },
        { label: 'Pending Reviews', value: stats.pendingTechnicians, tone: 'bg-[#fff8e1] text-[#f9a825]' },
        { label: 'Open Work Orders', value: stats.activeWorkOrders, tone: 'bg-[#fce4ec] text-[#c2185b]' }
    ];

    return (
        <div className="flex min-h-screen w-full bg-[#f7f9ff]">
            <AdminSidebar />

            <main className="flex-1 overflow-hidden md:ml-64">
                <div className="min-h-screen p-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#005bbf]">Admin Portal</p>
                                <h1 className="text-3xl font-bold text-[#181c20]">System Overview</h1>
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

                        {loading ? (
                            <div className="rounded-xl border border-[#c1c6d6] bg-white p-8 text-[#414754]">
                                Loading admin dashboard...
                            </div>
                        ) : (
                            <>
                                <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {cards.map((card) => (
                                        <div key={card.label} className="rounded-xl border border-[#c1c6d6] bg-white p-5 shadow-sm">
                                            <div className={`mb-4 inline-flex rounded-lg p-2 ${card.tone}`}>
                                                <span className="material-symbols-outlined text-lg">analytics</span>
                                            </div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#414754]">{card.label}</p>
                                            <h2 className="mt-2 text-3xl font-bold text-[#181c20]">{card.value}</h2>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                                    <div className="rounded-xl border border-[#c1c6d6] bg-white p-6 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-[#181c20]">Recent Platform Activity</h3>
                                            <span className="rounded-full bg-[#f1f4fa] px-2 py-1 text-xs font-semibold text-[#414754]">
                                                {activity.length} items
                                            </span>
                                        </div>

                                        {activity.length === 0 ? (
                                            <p className="text-sm text-[#414754]">No recent activity yet.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {activity.map((item) => (
                                                    <div key={item.id} className="flex items-start justify-between gap-4 border-b border-[#eef2f8] pb-3 last:border-0 last:pb-0">
                                                        <div>
                                                            <p className="text-sm font-medium text-[#181c20]">{item.message}</p>
                                                            <p className="mt-1 text-xs text-[#414754]">{item.user}</p>
                                                        </div>
                                                        <span className="shrink-0 text-[11px] text-[#727785]">
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-xl border border-[#c1c6d6] bg-white p-6 shadow-sm">
                                        <h3 className="mb-4 text-xl font-bold text-[#181c20]">Quick Summary</h3>
                                        <div className="space-y-4 text-sm text-[#414754]">
                                            <div className="rounded-lg bg-[#f1f4fa] p-3">
                                                <div className="font-semibold text-[#181c20]">Pending technician reviews</div>
                                                <div className="mt-1">{stats.pendingTechnicians} profiles awaiting approval.</div>
                                            </div>
                                            <div className="rounded-lg bg-[#f1f4fa] p-3">
                                                <div className="font-semibold text-[#181c20]">Open maintenance items</div>
                                                <div className="mt-1">{stats.pendingMaintenanceRequests} requests still awaiting landlord action.</div>
                                            </div>
                                            <div className="rounded-lg bg-[#f1f4fa] p-3">
                                                <div className="font-semibold text-[#181c20]">Active field work</div>
                                                <div className="mt-1">{stats.activeWorkOrders} work orders are currently active.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
