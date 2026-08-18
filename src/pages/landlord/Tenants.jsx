import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import LandlordSidebar from '../../components/LandlordSidebar';
import API from '../../utils/axios';
import { triggerDataRefresh, useDataRefresh } from '../../utils/dataRefresh';

const LandlordTenants = () => {
    const { user } = useAuth();
    const [approvedTenants, setApprovedTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [propertyFilter, setPropertyFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [properties, setProperties] = useState([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [editFormData, setEditFormData] = useState({ full_name: '', phone_number: '' });
    const [updating, setUpdating] = useState(false);
    const itemsPerPage = 10;

    const fetchApprovedTenants = useCallback(async () => {
        setLoading(true);
        try {
            const response = await API.get('/api/properties/approved-tenants/list');
            setApprovedTenants(response.data.approvedTenants || []);
        } catch (error) {
            console.error('Error fetching approved tenants:', error);
            setApprovedTenants([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProperties = useCallback(async () => {
        try {
            const res = await API.get('/api/properties');
            setProperties(res.data.properties || []);
        } catch (err) {
            console.error('Error fetching properties:', err);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const loadData = async () => {
            if (!active) return;
            await fetchApprovedTenants();
            await fetchProperties();
        };
        loadData();

        const handleFocus = () => {
            if (active) {
                fetchApprovedTenants();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            active = false;
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchApprovedTenants, fetchProperties]);

    useDataRefresh(() => {
        fetchApprovedTenants();
    }, 'landlord');

    const filteredTenants = approvedTenants.filter(tenant => {
        const matchSearch = searchTerm === '' ||
            tenant.tenantId?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.tenantId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.tenantId?.phone_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchProperty = propertyFilter === '' || tenant.propertyId?._id === propertyFilter;
        return matchSearch && matchProperty;
    });

    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedTenants = filteredTenants.slice(start, start + itemsPerPage);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const openEditModal = (tenant) => {
        setEditingTenant(tenant);
        setEditFormData({
            full_name: tenant.tenantId?.full_name || '',
            phone_number: tenant.tenantId?.phone_number || ''
        });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingTenant(null);
        setEditFormData({ full_name: '', phone_number: '' });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingTenant) return;

        setUpdating(true);
        try {
            const response = await API.put(
                `/api/properties/${editingTenant.propertyId._id}/tenants/${editingTenant.tenantId._id}`,
                {
                    full_name: editFormData.full_name,
                    phone_number: editFormData.phone_number
                }
            );

            if (response.data.tenant) {
                // Update the tenant in the list
                setApprovedTenants(prevTenants =>
                    prevTenants.map(t =>
                        t._id === editingTenant._id
                            ? {
                                ...t,
                                tenantId: {
                                    ...t.tenantId,
                                    full_name: response.data.tenant.full_name,
                                    phone_number: response.data.tenant.phone_number
                                }
                            }
                            : t
                    )
                );
            }

            closeEditModal();
            
            // Trigger global data refresh
            triggerDataRefresh('landlord');
        } catch (error) {
            console.error('Error updating tenant:', error);
            alert(error.response?.data?.message || 'Failed to update tenant information.');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f9ff]">
            <LandlordSidebar />

            <div className="flex-1 flex flex-col md:ml-64">

                {/* Top Navbar */}
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="hidden md:flex bg-[#f1f4fa] px-4 py-1 rounded-full border border-[#c1c6d6] items-center gap-2 min-w-[320px]">
                        <span className="material-symbols-outlined text-[#727785]">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#727785]"
                            placeholder="Search by name, email, or phone..."
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
                                <h1 className="text-3xl font-bold text-[#181c20]">Approved Tenants</h1>
                                <p className="text-sm text-[#414754]">View and manage all tenants with approved access to your properties.</p>
                            </div>
                            <button
                                className="bg-white border border-[#c1c6d6] text-[#414754] px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#f1f4fa] transition-all"
                                onClick={fetchApprovedTenants}
                                disabled={loading}
                            >
                                <span className="material-symbols-outlined text-xl">refresh</span>
                                <span className="text-xs font-semibold">Refresh</span>
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-4 flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[240px]">
                                <label className="block text-xs font-semibold text-[#414754] uppercase mb-1">Search</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727785] text-lg">search</span>
                                    <input
                                        className="w-full border border-[#c1c6d6] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#005bbf] outline-none"
                                        placeholder="Name, email, or phone"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="block text-xs font-semibold text-[#414754] uppercase mb-1">Property</label>
                                <select
                                    className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2 text-sm focus:border-[#005bbf] outline-none"
                                    value={propertyFilter}
                                    onChange={(e) => { setPropertyFilter(e.target.value); setCurrentPage(1); }}>
                                    <option value="">All Properties</option>
                                    {properties.map(prop => (
                                        <option key={prop._id} value={prop._id}>{prop.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tenants Table */}
                        <div className="bg-white border border-[#c1c6d6] rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f1f4fa] border-b border-[#c1c6d6]">
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Tenant Name</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Email</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Phone</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Property</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Approval Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c1c6d6]">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">Loading approved tenants...</td>
                                            </tr>
                                        ) : paginatedTenants.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">No approved tenants yet.</td>
                                            </tr>
                                        ) : (
                                            paginatedTenants.map(tenant => (
                                                <tr key={tenant._id} className="hover:bg-[#f7f9ff] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-[#d8e2ff] flex items-center justify-center text-xs font-bold text-[#005bbf]">
                                                                {tenant.tenantId?.full_name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-medium">{tenant.tenantId?.full_name || 'Unknown'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#414754]">{tenant.tenantId?.email || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-sm text-[#414754]">{tenant.tenantId?.phone_number || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-sm text-[#414754]">{tenant.propertyId?.name || 'Unknown'}</td>
                                                    <td className="px-6 py-4 text-sm text-[#414754]">{formatDate(tenant.approvedAt)}</td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            className="inline-flex items-center gap-1 bg-[#005bbf] text-white px-3 py-2 rounded text-xs font-semibold hover:bg-[#004493] transition-all"
                                                            onClick={() => openEditModal(tenant)}>
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {paginatedTenants.length > 0 && (
                                <div className="px-6 py-4 border-t border-[#c1c6d6] bg-white flex items-center justify-between">
                                    <span className="text-xs font-semibold text-[#414754]">
                                        Showing {filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''}
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
                            )}
                        </div>

                    </div>
                </main>
            </div>

            {/* Edit Tenant Modal */}
            {editModalOpen && editingTenant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-bold text-[#181c20] mb-4">Edit Tenant Information</h3>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Full Name</label>
                                <input
                                    className="w-full px-4 py-3 border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] outline-none"
                                    name="full_name"
                                    type="text"
                                    value={editFormData.full_name}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Phone Number</label>
                                <input
                                    className="w-full px-4 py-3 border border-[#c1c6d6] rounded-lg text-sm focus:border-[#005bbf] outline-none"
                                    name="phone_number"
                                    type="tel"
                                    value={editFormData.phone_number}
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg p-4 text-sm text-[#414754]">
                                <p><span className="font-semibold">Tenant:</span> {editingTenant.tenantId?.full_name}</p>
                                <p><span className="font-semibold">Email:</span> {editingTenant.tenantId?.email} (read-only)</p>
                                <p><span className="font-semibold">Property:</span> {editingTenant.propertyId?.name}</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 bg-[#005bbf] text-white py-3 rounded-lg font-bold hover:bg-[#004493] transition-all disabled:opacity-60">
                                    {updating ? 'Updating...' : 'Update Tenant'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={updating}
                                    className="flex-1 border border-[#c1c6d6] text-[#414754] py-3 rounded-lg font-bold hover:bg-[#f1f4fa] transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandlordTenants;
