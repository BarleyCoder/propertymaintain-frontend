import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import useAuth from '../../context/useAuth';
import API from '../../utils/axios';

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

const AdminProperties = () => {
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await API.get('/api/admin/properties');
                setProperties(res.data.properties || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load property records.');
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const safePropertyList = useMemo(() => properties || [], [properties]);

    return (
        <div className="flex min-h-screen w-full bg-[#f7f9ff]">
            <AdminSidebar />

            <main className="flex-1 overflow-hidden md:ml-64">
                <div className="min-h-screen p-4 md:p-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#005bbf]">Admin Portal</p>
                                <h1 className="text-3xl font-bold text-[#181c20]">Property Monitoring</h1>
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
                                Loading properties...
                            </div>
                        ) : safePropertyList.length === 0 ? (
                            <div className="rounded-xl border border-[#c1c6d6] bg-white p-8 text-center text-[#414754]">
                                No properties available.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-[#c1c6d6] bg-white shadow-sm">
                                <table className="min-w-full text-left text-sm text-[#181c20]">
                                    <thead className="bg-[#f1f4fa]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Name</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Code</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Landlord</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Tenants</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Address</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">State</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Type</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Status</th>
                                            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[#414754]">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {safePropertyList.map((item) => (
                                            <tr key={item._id} className="border-t border-[#eef2f8] align-top">
                                                <td className="px-4 py-3 font-medium">{item.name || 'N/A'}</td>
                                                <td className="px-4 py-3 font-semibold text-[#005bbf]">{item.propertyCode || 'N/A'}</td>
                                                <td className="px-4 py-3">{item.landlordId?.full_name || item.landlordId?.email || 'N/A'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#e3f2fd] text-[#005bbf] font-semibold text-sm">
                                                        {item.tenantCount ?? 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.address || 'N/A'}
                                                    {item.city ? `, ${item.city}` : ''}
                                                    {item.postalCode ? ` ${item.postalCode}` : ''}
                                                </td>
                                                <td className="px-4 py-3">{item.state || 'N/A'}</td>
                                                <td className="px-4 py-3 capitalize">{item.propertyType || 'N/A'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.status === 'occupied' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#fff3e0] text-[#ef6c00]'}`}>
                                                        {item.status || 'available'}
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

export default AdminProperties;
