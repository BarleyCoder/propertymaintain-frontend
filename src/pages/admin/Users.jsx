import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import useAuth from '../../context/useAuth';
import API from '../../utils/axios';

const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Landlords', value: 'landlord' },
    { label: 'Tenants', value: 'tenant' },
    { label: 'Technicians', value: 'technician' }
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

const AdminUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await API.get('/api/admin/users');
                setUsers(res.data.users || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load user records.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const visibleUsers = useMemo(() => {
        if (selectedFilter === 'all') return users;
        return users.filter((item) => item.role === selectedFilter);
    }, [selectedFilter, users]);

    return (
        <div className="flex min-h-screen w-full bg-[#f7f9ff]">
            <AdminSidebar />

            <main className="flex-1 overflow-hidden md:ml-64">
                <div className="min-h-screen p-4 md:p-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#005bbf]">Admin Portal</p>
                                <h1 className="text-3xl font-bold text-[#181c20]">User Monitoring</h1>
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
                            {filterOptions.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => setSelectedFilter(filter.value)}
                                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${selectedFilter === filter.value
                                        ? 'bg-[#005bbf] text-white'
                                        : 'border border-[#c1c6d6] bg-white text-[#414754] hover:bg-[#eef3ff]'}
                                    `}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="rounded-xl border border-[#c1c6d6] bg-white p-8 text-[#414754]">
                                Loading users...
                            </div>
                        ) : visibleUsers.length === 0 ? (
                            <div className="rounded-xl border border-[#c1c6d6] bg-white p-8 text-center text-[#414754]">
                                No users found for this filter.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-[#c1c6d6] bg-white shadow-sm">
                                <table className="min-w-full text-left text-sm text-[#181c20]">
                                    <thead className="bg-[#f1f4fa]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Name</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Email</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Phone</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Role</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Email Status</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleUsers.map((item) => (
                                            <tr key={item._id} className="border-t border-[#eef2f8]">
                                                <td className="px-4 py-3 font-medium">{item.full_name || 'N/A'}</td>
                                                <td className="px-4 py-3">{item.email || 'N/A'}</td>
                                                <td className="px-4 py-3">{item.phone_number || 'N/A'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-[#e8f5e9] px-2 py-1 text-xs font-semibold capitalize text-[#2e7d32]">
                                                        {item.role || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.isEmailVerified ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#fff3e0] text-[#ef6c00]'}`}>
                                                        {item.isEmailVerified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
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

export default AdminUsers;
