import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import LandlordSidebar from '../../components/LandlordSidebar';
import StatusMessage from '../../components/StatusMessage';
import API from '../../utils/axios';
import { triggerDataRefresh, useDataRefresh } from '../../utils/dataRefresh';

const LandlordDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [properties, setProperties] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [addPropertyLoading, setAddPropertyLoading] = useState(false);
    const [addPropertySuccess, setAddPropertySuccess] = useState('');
    const [addPropertyError, setAddPropertyError] = useState('');
    const [createdPropertyCode, setCreatedPropertyCode] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: 'info', text: '' });
    const [updatingRequestId, setUpdatingRequestId] = useState(null);
    const [newProperty, setNewProperty] = useState({
        name: '',
        property_type: '',
        address: '',
        city: '',
        state: '',
        country: '',
        bedrooms: '',
        bathrooms: '',
        description: '',
        postal_code: ''
    });

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

    const fetchProperties = useCallback(async () => {
        try {
            const res = await API.get('/api/properties');
            setProperties(res.data.properties || []);
        } catch (err) {
            console.error('Error fetching properties:', err);
        }
    }, []);

    const fetchJoinRequests = useCallback(async () => {
        try {
            const res = await API.get('/api/properties/join/landlord');
            setJoinRequests(res.data.requests || []);
        } catch (err) {
            console.error('Error fetching join requests:', err);
        }
    }, []);

    const handlePropertyChange = (e) => {
        const { name, value } = e.target;
        setNewProperty((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitProperty = async (e) => {
        e.preventDefault();
        setAddPropertyError('');
        setAddPropertySuccess('');
        setAddPropertyLoading(true);

        try {
            const response = await API.post('/api/properties', newProperty);
            const propertyCode = response.data.property.propertyCode;
            setAddPropertySuccess('Property created successfully!');
            setCreatedPropertyCode(propertyCode);
            setNewProperty({
                name: '',
                property_type: '',
                address: '',
                city: '',
                state: '',
                country: '',
                bedrooms: '',
                bathrooms: '',
                description: '',
                postal_code: ''
            });
            await fetchProperties();
            triggerDataRefresh('landlord');
        } catch (err) {
            setAddPropertyError(err.response?.data?.message || 'Failed to create property.');
            setCreatedPropertyCode('');
        } finally {
            setAddPropertyLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        const loadData = async () => {
            if (!active) return;
            await fetchRequests();
            await fetchProperties();
            await fetchJoinRequests();
        };
        loadData();
        return () => { active = false; };
    }, [fetchRequests, fetchProperties, fetchJoinRequests]);

    useDataRefresh(() => {
        fetchRequests();
        fetchProperties();
        fetchJoinRequests();
    }, 'landlord');

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

    const handleJoinRequestAction = async (id, nextStatus) => {
        setUpdatingRequestId(id);
        try {
            const response = await API.put(`/api/properties/join/${id}/status`, { status: nextStatus });
            setStatusMessage({ type: 'success', text: response.data.message || `Join request ${nextStatus} successfully.` });
            triggerDataRefresh('landlord');
            await fetchJoinRequests();
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Unable to update join request.' });
        } finally {
            setUpdatingRequestId(null);
        }
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
                                        <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Property Code</th>
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
                                                <tr key={request._id} className="hover:bg-[#f7f9ff] transition-colors">
                                                    <td className="px-6 py-4 font-bold text-[#005bbf] text-xs">#PM-{request._id}</td>
                                                    <td className="px-6 py-4 text-sm">{request.tenantId?.full_name || 'Tenant'}</td>
                                                    <td className="px-6 py-4 text-sm capitalize">{request.category}</td>
                                                    <td className="px-6 py-4 text-sm">{request.propertyId?.propertyCode || ''}</td>
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
                                                    <td className="px-6 py-4 text-sm text-[#414754]">{new Date(request.createdAt || request.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link to="/landlord/requests" className="text-[#005bbf] text-xs font-bold hover:underline">View</Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Properties List with copyable property codes */}
                    <div className="mt-6 bg-white rounded-xl border border-[#c1c6d6] shadow-sm p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <h4 className="text-lg font-bold">Your Properties</h4>
                            <button
                                onClick={() => setShowAddProperty((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-lg bg-[#005bbf] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004a9a]"
                            >
                                {showAddProperty ? 'Close Form' : 'Add Property'}
                            </button>
                        </div>
                        {showAddProperty && (
                            <div className="mb-6 border border-[#c1c6d6] rounded-xl bg-[#f7f9ff] p-6">
                                <h5 className="text-md font-bold mb-3">Add New Property</h5>
                                {addPropertyError && <p className="text-sm text-red-600 mb-3">{addPropertyError}</p>}
                                {addPropertySuccess && <p className="text-sm text-green-600 mb-3">{addPropertySuccess}</p>}
                                <form onSubmit={handleSubmitProperty} className="grid gap-4 md:grid-cols-2">
                                    {createdPropertyCode && (
                                        <div className="md:col-span-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center justify-between gap-3">
                                            <span>Property created successfully! Code: <strong>{createdPropertyCode}</strong></span>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(createdPropertyCode);
                                                        alert('Property code copied');
                                                    } catch {
                                                        alert('Copy failed');
                                                    }
                                                }}
                                                className="rounded-lg bg-green-600 px-3 py-2 text-white text-xs font-semibold hover:bg-green-700"
                                            >
                                                Copy Code
                                            </button>
                                        </div>
                                    )}
                                    <label className="space-y-2 text-sm text-[#414754]">
                                        <span>Property Name</span>
                                        <input
                                            name="name"
                                            value={newProperty.name}
                                            onChange={handlePropertyChange}
                                            required
                                            className="w-full rounded-lg border border-[#c1c6d6] bg-white px-3 py-2 text-sm outline-none focus:border-[#005bbf]"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-[#414754]">
                                        <span>Property Type</span>
                                        <input
                                            name="property_type"
                                            value={newProperty.property_type}
                                            onChange={handlePropertyChange}
                                            required
                                            className="w-full rounded-lg border border-[#c1c6d6] bg-white px-3 py-2 text-sm outline-none focus:border-[#005bbf]"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-[#414754] md:col-span-2">
                                        <span>Address</span>
                                        <input
                                            name="address"
                                            value={newProperty.address}
                                            onChange={handlePropertyChange}
                                            required
                                            className="w-full rounded-lg border border-[#c1c6d6] bg-white px-3 py-2 text-sm outline-none focus:border-[#005bbf]"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-[#414754]">
                                        <span>City</span>
                                        <input
                                            name="city"
                                            value={newProperty.city}
                                            onChange={handlePropertyChange}
                                            required
                                            className="w-full rounded-lg border border-[#c1c6d6] bg-white px-3 py-2 text-sm outline-none focus:border-[#005bbf]"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-[#414754]">
                                        <span>State</span>
                                        <input
                                            name="state"
                                            value={newProperty.state}
                                            onChange={handlePropertyChange}
                                            required
                                            className="w-full rounded-lg border border-[#c1c6d6] bg-white px-3 py-2 text-sm outline-none focus:border-[#005bbf]"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-[#414754]">
                                        <span>Country</span>
                                        <input
                                            name="country"
                                            value={newProperty.country}
                                            onChange={handlePropertyChange}
                                            className="w-full rounded-lg border border-[#c1c6d6] bg-white px-3 py-2 text-sm outline-none focus:border-[#005bbf]"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-[#414754]">
                                        <span>Bedrooms</span>
                                        <input
                                            name="bedrooms"
                                            value={newProperty.bedrooms}
                                            onChange={handlePropertyChange}
                                            required
                                            type="number"
                                            min="0"
                                            className="w-full rounded-lg border border-[#c1c6d6] bg-white px-3 py-2 text-sm outline-none focus:border-[#005bbf]"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-[#414754]">
                                        <span>Bathrooms</span>
                                        <input
                                            name="bathrooms"
                                            value={newProperty.bathrooms}
                                            onChange={handlePropertyChange}
                                            required
                                            type="number"
                                            min="0"
                                            className="w-full rounded-lg border border-[#c1c6d6] bg-white px-3 py-2 text-sm outline-none focus:border-[#005bbf]"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-[#414754] md:col-span-2">
                                        <span>Postal Code</span>
                                        <input
                                            name="postal_code"
                                            value={newProperty.postal_code}
                                            onChange={handlePropertyChange}
                                            className="w-full rounded-lg border border-[#c1c6d6] bg-white px-3 py-2 text-sm outline-none focus:border-[#005bbf]"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-[#414754] md:col-span-2">
                                        <span>Description</span>
                                        <textarea
                                            name="description"
                                            value={newProperty.description}
                                            onChange={handlePropertyChange}
                                            rows="3"
                                            className="w-full rounded-lg border border-[#c1c6d6] bg-white px-3 py-2 text-sm outline-none focus:border-[#005bbf]"
                                        />
                                    </label>
                                    <div className="md:col-span-2 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddProperty(false)}
                                            className="rounded-lg border border-[#c1c6d6] bg-white px-4 py-2 text-sm text-[#414754] hover:bg-[#f1f4fa]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={addPropertyLoading}
                                            className="rounded-lg bg-[#005bbf] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004a9a] disabled:opacity-50"
                                        >
                                            {addPropertyLoading ? 'Saving...' : 'Save Property'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        {properties.length === 0 ? (
                            <p className="text-sm text-[#414754]">You have no properties yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {properties.map(p => (
                                    <div key={p._id} className="border rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-bold">{p.name}</div>
                                            <div className="text-xs text-[#727785]">{p.address}</div>
                                            <div className="text-xs mt-2">Code: <span className="font-semibold">{p.propertyCode}</span></div>
                                            <div className="text-xs text-[#727785]">Share this code with tenants to allow them join the property.</div>
                                        </div>
                                        <div>
                                            <button onClick={async () => { try { await navigator.clipboard.writeText(p.propertyCode); alert('Code copied'); } catch { alert('Copy failed'); } }} className="bg-[#005bbf] text-white px-4 py-2 rounded-lg">Copy</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Join Requests */}
                    <div className="mt-6 bg-white rounded-xl border border-[#c1c6d6] shadow-sm p-6">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <h4 className="text-lg font-bold">Pending Tenant Join Requests</h4>
                            <button className="text-sm text-[#005bbf] font-semibold hover:underline" onClick={fetchJoinRequests}>Refresh</button>
                        </div>
                        {statusMessage.text && (
                            <div className="mb-4">
                                <StatusMessage type={statusMessage.type} message={statusMessage.text} onClose={() => setStatusMessage({ type: 'info', text: '' })} />
                            </div>
                        )}
                        {joinRequests.length === 0 ? (
                            <p className="text-sm text-[#414754]">No tenant join requests pending approval.</p>
                        ) : (
                            <div className="space-y-3">
                                {joinRequests.map(request => (
                                    <div key={request._id} className="border rounded-lg p-4 bg-[#f7f9ff]">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <div className="text-sm font-semibold">{request.propertyId?.name || request.propertyCode}</div>
                                                <div className="text-xs text-[#727785]">Code: {request.propertyCode}</div>
                                                <div className="text-xs text-[#727785]">Tenant: {request.tenantId?.full_name || 'Unknown'}</div>
                                                <div className="text-xs text-[#727785]">Email: {request.tenantId?.email || 'Unknown'}</div>
                                                <div className="text-xs text-[#727785]">Phone: {request.tenantId?.phone_number || 'N/A'}</div>
                                                <div className="text-xs text-[#727785]">Submitted: {new Date(request.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-amber-700">{request.status}</span>
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                                            disabled={updatingRequestId === request._id}
                                                            onClick={() => handleJoinRequestAction(request._id, 'approved')}
                                                        >
                                                            {updatingRequestId === request._id ? 'Working...' : 'Accept'}
                                                        </button>
                                                        <button
                                                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                                            disabled={updatingRequestId === request._id}
                                                            onClick={() => handleJoinRequestAction(request._id, 'rejected')}
                                                        >
                                                            {updatingRequestId === request._id ? 'Working...' : 'Reject'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LandlordDashboard;